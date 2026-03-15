"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { sendGlobalNotification } from "../actions-notifications"

/**
 * HELPER: Sube múltiples archivos a Supabase Storage y retorna las URLs.
 * Se usa Buffer para asegurar compatibilidad total con Server Actions.
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

                const { data } = await supabase.storage
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
 * Registra venta, gestiona stock, fotos y envía notificaciones Push.
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

    const template = await prisma.productTemplate.findUnique({
        where: { id: templateId, userId: user.id },
        include: { materials: { include: { material: true } } }
    })
    if (!template) throw new Error("Plantilla no encontrada")

    const imageUrls = await uploadImages(files, user.id)
    const totalPrice = template.basePrice * quantity
    const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)

    const lowStockAlerts: { name: string, stock: number }[] = []

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

            if (status !== "PRESUPUESTADO") {
                for (const item of template.materials) {
                    const mat = await tx.material.update({
                        where: { id: item.materialId },
                        data: { stock: { decrement: item.quantity * quantity } }
                    })
                    if (mat.stock <= mat.minStock) {
                        lowStockAlerts.push({ name: mat.name, stock: mat.stock })
                    }
                }
            }
        })
    } catch (e) {
        console.error("Error DB:", e)
        throw new Error("Fallo al guardar el pedido")
    }

    // Notificaciones fuera de la transacción para evitar Timeouts en Vercel
    try {
        await sendGlobalNotification(user.id, status === 'PRESUPUESTADO' ? "📄 Nuevo Presupuesto" : "📦 Nuevo Pedido", `Registraste a ${customerName} por $${totalPrice.toLocaleString('es-AR')}`, 'DELIVERY')
        for (const alert of lowStockAlerts) {
            await sendGlobalNotification(user.id, "⚠️ Stock Crítico", `El insumo ${alert.name} se está agotando (${alert.stock.toFixed(1)} restantes)`, 'STOCK')
        }
    } catch (notifErr) { console.error("Push Error:", notifErr) }

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

/**
 * 2. REGISTRAR PAGO ADICIONAL (Cobros parciales)
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
        await sendGlobalNotification(user.id, "💰 Cobro Recibido", `Ingresaron $${amount.toLocaleString()} de ${order?.customerName}`, 'PAYMENT')
    } catch (e) { console.error(e) }

    revalidatePath("/dashboard/pedidos")
}

/**
 * 3. CONFIRMAR PRESUPUESTO
 * Pasa a pedido firme, resta stock y pide fecha obligatoria.
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

    const lowStockAlerts: { name: string, stock: number }[] = []

    try {
        await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    const mat = await tx.material.update({
                        where: { id: m.materialId },
                        data: { stock: { decrement: m.quantity * item.quantity } }
                    })
                    if (mat.stock <= mat.minStock) lowStockAlerts.push({ name: mat.name, stock: mat.stock })
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
        for (const alert of lowStockAlerts) {
            await sendGlobalNotification(user.id, "⚠️ Stock Crítico", `Insumo ${alert.name} agotándose.`, 'STOCK')
        }
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
    
    // NUEVOS CAMPOS DE LOGÍSTICA
    const deliveryMethod = formData.get("deliveryMethod") as any
    const shippingAddress = formData.get("shippingAddress") as string

    const files = formData.getAll("files") as File[]

    const order = await prisma.order.findUnique({
        where: { id: orderId, userId: user.id },
        include: { items: { include: { template: { include: { materials: true } } } } }
    })
    if (!order) return

    // Reutilizamos el helper de subida si hay fotos nuevas
    const imageUrls = await uploadImages(formData.getAll("files") as File[], user.id)

    await prisma.$transaction(async (tx) => {
        // Lógica de Stock: Si cambia de presupuesto a confirmado ahora, restamos stock
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
                customerName,
                customerPhone,
                designDetails,
                status,
                deliveryMethod, // Se guarda el método (PICKUP, LOCAL, NATIONWIDE)
                shippingAddress, // Se guarda la dirección
                deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
                images: { create: imageUrls.map(url => ({ url })) }
            }
        })
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/logistica") // También refrescamos la hoja de ruta
}

/**
 * 5. MARCAR COMO ENTREGADO
 * Cierra el ciclo y avisa si el cliente todavía debe dinero.
 */
export async function markAsDelivered(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: { payments: true }
    })
    if (!order) return

    const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0)
    const remaining = order.totalPrice - totalPaid

    await prisma.order.update({ 
        where: { id }, 
        data: { status: 'ENTREGADO' } 
    })
    
    // Notificación Estándar
    await sendGlobalNotification(order.userId, "🏁 Trabajo Entregado", `El pedido de ${order.customerName} fue finalizado.`, 'DELIVERY')

    // ALERTA DE DEUDA: Si entregó pero no cobró todo
    if (remaining > 0) {
        await sendGlobalNotification(
            order.userId, 
            "🚩 ¡Saldo Pendiente!", 
            `Entregaste el trabajo pero ${order.customerName} aún debe $${remaining.toLocaleString('es-AR')}`, 
            'PAYMENT'
        )
    }

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
 * 7. ELIMINAR PEDIDO COMPLETO
 * Borra de la DB, limpia Storage y DEVUELVE los materiales al stock.
 */
export async function deleteOrder(id: string) {
    const order = await prisma.order.findUnique({ 
        where: { id }, 
        include: { images: true, items: { include: { template: { include: { materials: true } } } } } 
    })
    if (!order) return

    await prisma.$transaction(async (tx) => {
        // Solo devolvemos si el pedido no era un presupuesto (es decir, si ya se había restado)
        if (order.status !== "PRESUPUESTADO") {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    await tx.material.update({ 
                        where: { id: m.materialId }, 
                        data: { stock: { increment: m.quantity * item.quantity } } 
                    })
                }
            }
        }
        
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