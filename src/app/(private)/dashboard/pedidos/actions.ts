"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

/**
 * HELPER: Sube múltiples archivos a Supabase Storage
 */
async function uploadImages(files: File[], userId: string) {
    const supabase = await createClient()
    const urls: string[] = []

    for (const file of files) {
        if (file && file.size > 0) {
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
        }
    }
    return urls
}

/**
 * 1. CREAR PEDIDO
 */
export async function createOrder(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autorizado")

    const customerName = formData.get("customerName") as string
    const customerPhone = formData.get("customerPhone") as string
    const templateId = formData.get("templateId") as string
    const quantity = parseInt(formData.get("quantity") as string)
    const deliveryDateRaw = formData.get("deliveryDate") as string
    const designDetails = formData.get("designDetails") as string
    const status = formData.get("status") as any
    const deposit = parseFloat(formData.get("deposit") as string) || 0
    const files = formData.getAll("files") as File[]

    const imageUrls = await uploadImages(files, user.id)

    const template = await prisma.productTemplate.findUnique({
        where: { id: templateId, userId: user.id },
        include: { materials: { include: { material: true } } }
    })

    if (!template) throw new Error("Plantilla no encontrada")

    const totalPrice = template.basePrice * quantity
    const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)

    await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                customerName, customerPhone, totalPrice, totalCost, status, designDetails, userId: user.id,
                deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
                items: {
                    create: { templateId: template.id, quantity, customPrice: template.basePrice }
                },
                payments: deposit > 0 ? {
                    create: { amount: deposit, method: "SEÑA" }
                } : undefined,
                images: { create: imageUrls.map(url => ({ url })) }
            }
        })

        // Notificación de creación
        await tx.notification.create({
            data: {
                title: status === 'PRESUPUESTADO' ? "Nuevo Presupuesto" : "Nuevo Pedido",
                message: `${customerName} solicitó ${quantity}x ${template.name}`,
                type: 'DELIVERY',
                userId: user.id
            }
        })

        if (status !== "PRESUPUESTADO") {
            for (const item of template.materials) {
                const mat = await tx.material.update({
                    where: { id: item.materialId },
                    data: { stock: { decrement: item.quantity * quantity } }
                })
                if (mat.stock <= mat.minStock) {
                    await tx.notification.create({
                        data: {
                            title: "¡Stock Crítico!",
                            message: `El insumo ${mat.name} llegó al mínimo.`,
                            type: 'STOCK',
                            userId: user.id
                        }
                    })
                }
            }
        }
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

/**
 * 2. REGISTRAR PAGO (Faltaba esta función)
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

        await tx.notification.create({
            data: {
                title: "Cobro Registrado",
                message: `Se recibió un pago de $${amount.toLocaleString()} de ${order?.customerName}`,
                type: 'PAYMENT',
                userId: user.id
            }
        })
    })

    revalidatePath("/dashboard/pedidos")
}

/**
 * 3. CONFIRMAR PRESUPUESTO
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
        for (const item of order.items) {
            for (const m of item.template.materials) {
                await tx.material.update({
                    where: { id: m.materialId },
                    data: { stock: { decrement: m.quantity * item.quantity } }
                })
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
        await tx.notification.create({
            data: {
                title: "Presupuesto Confirmado",
                message: `El trabajo de ${order.customerName} pasó a producción.`,
                type: 'DELIVERY',
                userId: user.id
            }
        })
    })
    revalidatePath("/dashboard/pedidos")
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

    const imageUrls = await uploadImages(files, user.id)

    await prisma.order.update({
        where: { id: orderId, userId: user.id },
        data: {
            customerName, customerPhone, designDetails, status,
            deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
            images: { create: imageUrls.map(url => ({ url })) }
        }
    })
    revalidatePath("/dashboard/pedidos")
}

/**
 * 5. MARCAR COMO ENTREGADO
 */
export async function markAsDelivered(id: string) {
    const order = await prisma.order.update({ 
        where: { id }, 
        data: { status: 'ENTREGADO' } 
    })
    
    await prisma.notification.create({
        data: {
            title: "Pedido Finalizado",
            message: `El pedido de ${order.customerName} fue entregado.`,
            type: 'DELIVERY',
            userId: order.userId
        }
    })
    revalidatePath("/dashboard/pedidos")
}

/**
 * 6. BORRAR IMAGEN / PEDIDO
 */
export async function deleteOrderImage(imageId: string, imageUrl: string) {
    const supabase = await createClient()
    const path = imageUrl.split('/public/disenos/')[1]
    if (path) await supabase.storage.from('disenos').remove([path])
    await prisma.orderImage.delete({ where: { id: imageId } })
    revalidatePath("/dashboard/pedidos")
}

export async function deleteOrder(id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: { images: true, items: { include: { template: { include: { materials: true } } } } } })
    if (!order) return
    await prisma.$transaction(async (tx) => {
        if (order.status !== "PRESUPUESTADO") {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    await tx.material.update({ where: { id: m.materialId }, data: { stock: { increment: m.quantity * item.quantity } } })
                }
            }
        }
        await tx.payment.deleteMany({ where: { orderId: id } })
        await tx.orderImage.deleteMany({ where: { orderId: id } })
        await tx.orderItem.deleteMany({ where: { orderId: id } })
        await tx.order.delete({ where: { id } })
    })
    revalidatePath("/dashboard/pedidos")
}