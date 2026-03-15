"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { sendGlobalNotification } from "@/app/(private)/dashboard/actions-notifications"

/**
 * PROCESAR SOLICITUD DE PEDIDO DESDE LA WEB PÚBLICA
 */
export async function submitOrderRequest(formData: FormData, userId: string, templateId: string) {
    const customerName = formData.get("customerName") as string
    const customerPhone = formData.get("customerPhone") as string
    const quantity = parseInt(formData.get("quantity") as string) || 1
    const designDetails = formData.get("designDetails") as string
    const deliveryMethod = formData.get("deliveryMethod") as any
    const shippingAddress = formData.get("shippingAddress") as string
    const files = formData.getAll("files") as File[]

    // 1. Subida de archivos del cliente al bucket 'disenos'
    const supabase = await createClient()
    const imageUrls: string[] = []

    for (const file of files) {
        if (file && file.size > 0) {
            // Guardamos en una carpeta específica para pedidos web
            const fileName = `${userId}/public-order/${Date.now()}-${file.name}`
            const arrayBuffer = await file.arrayBuffer()
            
            const { data } = await supabase.storage
                .from('disenos')
                .upload(fileName, Buffer.from(arrayBuffer), { contentType: file.type })
            
            if (data) {
                const { data: { publicUrl } } = supabase.storage.from('disenos').getPublicUrl(fileName)
                imageUrls.push(publicUrl)
            }
        }
    }

    // 2. Buscamos la plantilla para calcular costos y precios base
    const template = await prisma.productTemplate.findUnique({
        where: { id: templateId },
        include: { materials: { include: { material: true } } }
    })

    if (!template) throw new Error("Producto no encontrado")

    const totalPrice = template.basePrice * quantity
    const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)

    // 3. Crear el pedido en la base de datos
    const order = await prisma.order.create({
        data: {
            customerName,
            customerPhone,
            designDetails,
            totalPrice,
            totalCost,
            deliveryMethod,
            shippingAddress,
            isFromStore: true,
            status: 'PRESUPUESTADO', 
            userId,
            deliveryDate: null, 
            items: {
                create: {
                    templateId,
                    quantity, // Aquí es donde debe ir la cantidad
                    customPrice: template.basePrice
                }
            },
            images: {
                create: imageUrls.map(url => ({ url }))
            }
        }
    })

    // 4. Notificamos al dueño del taller (Push + Centro de Notificaciones)
    try {
        await sendGlobalNotification(
            userId,
            "🛒 Nueva Solicitud Web",
            `${customerName} quiere ${quantity}x ${template.name}`,
            "DELIVERY"
        )
    } catch (error) {
        console.error("Error enviando notificación push:", error)
    }

    return { 
        success: true, 
        orderId: order.id, 
        customerName: order.customerName, 
        productName: template.name 
    }
}