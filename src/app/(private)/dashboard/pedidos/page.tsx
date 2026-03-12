"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { sendGlobalNotification } from "../actions-notifications"

/**
 * HELPER: Sube múltiples archivos a Supabase Storage y retorna las URLs
 */
async function uploadImages(files: File[], userId: string) {
    const supabase = await createClient()
    const urls: string[] = []

    for (const file of files) {
        if (file && file.size > 0) {
            // Generamos un nombre único con timestamp para evitar colisiones
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
            } else {
                console.error("Error subiendo imagen al storage:", error)
            }
        }
    }
    return urls
}

/**
 * 1. CREAR PEDIDO
 * Registra la venta, gestiona fotos, descuenta stock y envía notificaciones push.
 */
export async function createOrder(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autorizado")

    // Extracción de datos del FormData
    const customerName = formData.get("customerName") as string
    const customerPhone = formData.get("customerPhone") as string
    const templateId = formData.get("templateId") as string
    const quantity = parseInt(formData.get("quantity") as string) || 1
    const deliveryDateRaw = formData.get("deliveryDate") as string
    const designDetails = formData.get("designDetails") as string
    const status = formData.get("status") as any
    const deposit = parseFloat(formData.get("deposit") as string) || 0
    const files = formData.getAll("files") as File[]

    // Subida de imágenes al bucket 'disenos'
    const imageUrls = await uploadImages(files, user.id)

    // Buscamos la plantilla para obtener el precio de venta y los materiales (costos)
    const template = await prisma.productTemplate.findUnique({
        where: { id: templateId, userId: user.id },
        include: { materials: { include: { material: true } } }
    })

    if (!template) throw new Error("La plantilla seleccionada no existe.")

    // Cálculo de totales basados en la receta de la plantilla
    const totalPrice = template.basePrice * quantity
    const totalCost = template.materials.reduce((acc, m) => 
        acc + (m.quantity * m.material.unitPrice * quantity), 0
    )

    try {
        await prisma.$transaction(async (tx) => {
            // A. Creamos el registro del Pedido
            const order = await tx.order.create({
                data: {
                    customerName,
                    customerPhone,
                    totalPrice,
                    totalCost,
                    status,
                    designDetails,
                    userId: user.id,
                    deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
                    items: {
                        create: {
                            templateId: template.id,
                            quantity,
                            customPrice: template.basePrice,
                        }
                    },
                    // B. Registramos la seña si el usuario ingresó un monto
                    payments: deposit > 0 ? {
                        create: { amount: deposit, method: "SEÑA" }
                    } : undefined,
                    // C. Vinculamos las URLs de las fotos subidas
                    images: {
                        create: imageUrls.map(url => ({ url }))
                    }
                }
            })

            // D. NOTIFICACIÓN PUSH: Registro de operación
            await sendGlobalNotification(
                user.id, 
                status === 'PRESUPUESTADO' ? "📄 Nuevo Presupuesto" : "📦 Nuevo Pedido", 
                `Registraste a ${customerName} por un total de $${totalPrice.toLocaleString('es-AR')}`, 
                'DELIVERY'
            )

            // E. GESTIÓN DE STOCK: Solo restamos si NO es un simple presupuesto
            if (status !== "PRESUPUESTADO") {
                for (const item of template.materials) {
                    const updatedMaterial = await tx.material.update({
                        where: { id: item.materialId },
                        data: { stock: { decrement: item.quantity * quantity } }
                    })
                    
                    // Si el stock cae por debajo del mínimo, enviamos alerta crítica
                    if (updatedMaterial.stock <= updatedMaterial.minStock) {
                        await sendGlobalNotification(
                            user.id, 
                            "⚠️ Stock Crítico", 
                            `El insumo ${updatedMaterial.name} llegó a su nivel mínimo (${updatedMaterial.stock} restantes).`, 
                            'STOCK'
                        )
                    }
                }
            }
        })
    } catch (error) {
        console.error("Error en la transacción de creación:", error)
        throw new Error("No se pudo completar el registro del pedido.")
    }

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

    await prisma.$transaction(async (tx) => {
        await tx.payment.create({
            data: { orderId, amount, method, date: new Date() }
        })

        // NOTIFICACIÓN PUSH: Ingreso de dinero
        await sendGlobalNotification(
            user.id, 
            "💰 Cobro Recibido", 
            `Ingresaron $${amount.toLocaleString()} de ${order?.customerName}`, 
            'PAYMENT'
        )
    })

    revalidatePath("/dashboard/pedidos")
}

/**
 * 3. CONFIRMAR PRESUPUESTO (Pasar a Pedido Firmado)
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

    await prisma.$transaction(async (tx) => {
        // Al confirmar, ahora sí descontamos el stock físico
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

        // NOTIFICACIÓN PUSH: Confirmación de venta
        await sendGlobalNotification(
            user.id, 
            "✅ Venta Confirmada", 
            `El trabajo de ${order.customerName} ya está en producción oficial.`, 
            'DELIVERY'
        )
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

/**
 * 4. EDITAR PEDIDO (Actualización general)
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
        // Lógica de Stock: Si el usuario cambia manualmente el estado de Presupuesto a Confirmado
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
                deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
                images: { create: imageUrls.map(url => ({ url })) }
            }
        })
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

/**
 * 5. MARCAR COMO ENTREGADO (Cierre de ciclo)
 */
export async function markAsDelivered(id: string) {
    const order = await prisma.order.update({ 
        where: { id }, 
        data: { status: 'ENTREGADO' } 
    })
    
    // NOTIFICACIÓN PUSH: Fin de trabajo
    await sendGlobalNotification(
        order.userId, 
        "🏁 Trabajo Entregado", 
        `El pedido de ${order.customerName} ha sido finalizado con éxito.`, 
        'DELIVERY'
    )
    revalidatePath("/dashboard/pedidos")
}

/**
 * 6. GESTIÓN DE IMÁGENES (Borrado individual)
 */
export async function deleteOrderImage(imageId: string, imageUrl: string) {
    const supabase = await createClient()
    
    // Extraemos la ruta del archivo del URL público para borrarlo de Supabase Storage
    const path = imageUrl.split('/public/disenos/')[1]
    if (path) {
        await supabase.storage.from('disenos').remove([path])
    }

    await prisma.orderImage.delete({ where: { id: imageId } })
    revalidatePath("/dashboard/pedidos")
}

/**
 * 7. ELIMINAR PEDIDO COMPLETO
 * Borra registros, imágenes en la nube y DEVUELVE los materiales al stock.
 */
export async function deleteOrder(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const order = await prisma.order.findUnique({
        where: { id, userId: user.id },
        include: { 
            images: true, 
            items: { include: { template: { include: { materials: true } } } } 
        }
    })

    if (!order) return

    await prisma.$transaction(async (tx) => {
        // A. DEVOLUCIÓN DE STOCK (Solo si el pedido ya los había restado)
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

        // B. LIMPIEZA DE STORAGE: Borramos todas las fotos del pedido de la nube
        for (const img of order.images) {
            const path = img.url.split('/public/disenos/')[1]
            if (path) await supabase.storage.from('disenos').remove([path])
        }

        // C. BORRADO DE BASE DE DATOS (Cascade manual)
        await tx.payment.deleteMany({ where: { orderId: id } })
        await tx.orderImage.deleteMany({ where: { orderId: id } })
        await tx.orderItem.deleteMany({ where: { orderId: id } })
        await tx.order.delete({ where: { id, userId: user.id } })
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}