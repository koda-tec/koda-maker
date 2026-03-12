"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { sendGlobalNotification } from "../actions-notifications"

/**
 * HELPER: Sube múltiples archivos a Supabase Storage y retorna las URLs.
 * Se usa Buffer para asegurar la compatibilidad con Server Actions.
 */
async function uploadImages(files: File[], userId: string) {
    const supabase = await createClient()
    const urls: string[] = []

    for (const file of files) {
        if (file && file.size > 0 && file.name !== 'undefined') {
            try {
                const fileExt = file.name.split('.').pop()
                const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                const { data, error } = await supabase.storage
                    .from('disenos')
                    .upload(fileName, buffer, {
                        contentType: file.type,
                        upsert: true
                    })

                if (data) {
                    const { data: { publicUrl } } = supabase.storage.from('disenos').getPublicUrl(fileName)
                    urls.push(publicUrl)
                }
            } catch (err) {
                console.error("Error subiendo imagen individual:", err)
            }
        }
    }
    return urls
}

/**
 * 1. CREAR PEDIDO
 * Registra venta, gestiona stock, sube fotos y envía notificación Push.
 */
export async function createOrder(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autorizado")

    const customerName = formData.get("customerName") as string
    const customerPhone = formData.get("customerPhone") as string
    const templateId = formData.get("templateId") as string
    const quantity = parseInt(formData.get("quantity") as string) || 1
    const deliveryDateRaw = formData.get("deliveryDate") as string
    const designDetails = formData.get("designDetails") as string
    const status = formData.get("status") as any
    const deposit = parseFloat(formData.get("deposit") as string) || 0
    const files = formData.getAll("files") as File[]

    // A. Buscamos la receta
    const template = await prisma.productTemplate.findUnique({
        where: { id: templateId, userId: user.id },
        include: { materials: { include: { material: true } } }
    })
    if (!template) throw new Error("Plantilla no encontrada")

    // B. Subida de imágenes
    const imageUrls = await uploadImages(files, user.id)

    const totalPrice = template.basePrice * quantity
    const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)

    // C. Transacción en Base de Datos
    try {
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    customerName, customerPhone, totalPrice, totalCost, status, designDetails, userId: user.id,
                    deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
                    items: { create: { templateId: template.id, quantity, customPrice: template.basePrice } },
                    payments: deposit > 0 ? { create: { amount: deposit, method: "SEÑA" } } : undefined,
                    images: { create: imageUrls.map(url => ({ url })) }
                }
            })

            // D. Descuento de stock y Alertas automáticas
            if (status !== "PRESUPUESTADO") {
                for (const item of template.materials) {
                    const mat = await tx.material.update({
                        where: { id: item.materialId },
                        data: { stock: { decrement: item.quantity * quantity } }
                    })
                    
                    if (mat.stock <= mat.minStock) {
                        await sendGlobalNotification(user.id, "⚠️ Stock Crítico", `El insumo ${mat.name} llegó al mínimo (${mat.stock} un.)`, 'STOCK')
                    }
                }
            }
        })
    } catch (e) {
        console.error("Error DB:", e)
        throw new Error("Error al guardar el pedido")
    }

    // E. Notificación Push de éxito
    try {
        await sendGlobalNotification(
            user.id, 
            status === 'PRESUPUESTADO' ? "📄 Nuevo Presupuesto" : "📦 Nuevo Pedido", 
            `Registraste a ${customerName} por $${totalPrice.toLocaleString('es-AR')}`, 
            'DELIVERY'
        )
    } catch (notifErr) { console.error("Push falló silenciosamente:", notifErr) }

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

/**
 * 2. REGISTRAR PAGO ADICIONAL
 */
export async function addPayment(orderId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const amount = parseFloat(formData.get("amount") as string)
    const method = formData.get("method") as string || "EFECTIVO"

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerName: true }
    })

    try {
        await prisma.payment.create({
            data: { orderId, amount, method, date: new Date() }
        })
        
        await sendGlobalNotification(
            user.id, 
            "💰 Cobro Recibido", 
            `Ingresaron $${amount.toLocaleString()} de ${order?.customerName}`, 
            'PAYMENT'
        )
    } catch (e) { console.error(e) }

    revalidatePath("/dashboard/pedidos")
}

/**
 * 3. CONFIRMAR PEDIDO (Desde Presupuesto)
 */
export async function confirmOrder(orderId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const deliveryDate = formData.get("deliveryDate") as string
    const designDetails = formData.get("designDetails") as string
    const files = formData.getAll("files") as File[]
    const imageUrls = await uploadImages(files, user.id)

    const order = await prisma.order.findUnique({
        where: { id: orderId, userId: user.id },
        include: { items: { include: { template: { include: { materials: true } } } } }
    })
    if (!order) return

    try {
        await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    const mat = await tx.material.update({
                        where: { id: m.materialId },
                        data: { stock: { decrement: m.quantity * item.quantity } }
                    })
                    if (mat.stock <= mat.minStock) {
                        await sendGlobalNotification(user.id, "⚠️ Stock Crítico", `Insumo ${mat.name} agotándose.`, 'STOCK')
                    }
                }
            }
            await tx.order.update({
                where: { id: orderId },
                data: { 
                    status: 'CONFIRMADO', 
                    deliveryDate: new Date(deliveryDate), 
                    designDetails: designDetails || order.designDetails,
                    images: { create: imageUrls.map(url => ({ url })) }
                }
            })
        })

        await sendGlobalNotification(user.id, "✅ Venta Confirmada", `El presupuesto de ${order.customerName} pasó a producción`, 'DELIVERY')
    } catch (e) { console.error(e) }

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

/**
 * 4. EDITAR PEDIDO GENERAL
 */
export async function updateOrder(orderId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const customerName = formData.get("customerName") as string
    const customerPhone = formData.get("customerPhone") as string
    const designDetails = formData.get("designDetails") as string
    const status = formData.get("status") as any
    const deliveryDateRaw = formData.get("deliveryDate") as string
    const files = formData.getAll("files") as File[]

    const order = await prisma.order.findUnique({
        where: { id: orderId, userId: user.id },
        include: { items: { include: { template: { include: { materials: true } } } } }
    })
    if (!order) return

    const imageUrls = await uploadImages(files, user.id)

    await prisma.$transaction(async (tx) => {
        // Si el estado cambia de Presupuesto a algo real, descontamos stock ahora
        if (order.status === "PRESUPUESTADO" && status !== "PRESUPUESTADO") {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    await tx.material.update({ where: { id: m.materialId }, data: { stock: { decrement: m.quantity * item.quantity } } })
                }
            }
        }

        await tx.order.update({
            where: { id: orderId },
            data: {
                customerName, customerPhone, designDetails, status,
                deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
                images: { create: imageUrls.map(url => ({ url })) }
            }
        })
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

/**
 * 5. MARCAR COMO ENTREGADO
 */
export async function markAsDelivered(id: string) {
    const order = await prisma.order.update({ 
        where: { id }, 
        data: { status: 'ENTREGADO' } 
    })
    
    try {
        await sendGlobalNotification(order.userId, "🏁 Trabajo Entregado", `El pedido de ${order.customerName} ha sido finalizado.`, 'DELIVERY')
    } catch (e) {}
    
    revalidatePath("/dashboard/pedidos")
}

/**
 * 6. BORRAR IMAGEN INDIVIDUAL
 */
export async function deleteOrderImage(imageId: string, imageUrl: string) {
    const supabase = await createClient()
    const path = imageUrl.split('/public/disenos/')[1]
    if (path) await supabase.storage.from('disenos').remove([path])
    await prisma.orderImage.delete({ where: { id: imageId } })
    revalidatePath("/dashboard/pedidos")
}

/**
 * 7. ELIMINAR PEDIDO COMPLETO (Devuelve materiales al stock)
 */
export async function deleteOrder(id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: { images: true, items: { include: { template: { include: { materials: true } } } } } })
    if (!order) return
    
    await prisma.$transaction(async (tx) => {
        // Devolvemos materiales al estante si no era solo un presupuesto
        if (order.status !== "PRESUPUESTADO") {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    await tx.material.update({ where: { id: m.materialId }, data: { stock: { increment: m.quantity * item.quantity } } })
                }
            }
        }
        
        // Limpiamos Storage
        const supabase = await createClient()
        for (const img of order.images) {
            const path = img.url.split('/public/disenos/')[1]
            if (path) await supabase.storage.from('disenos').remove([path])
        }

        await tx.payment.deleteMany({ where: { orderId: id } })
        await tx.orderImage.deleteMany({ where: { orderId: id } })
        await tx.orderItem.deleteMany({ where: { orderId: id } })
        await tx.order.delete({ where: { id } })
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}