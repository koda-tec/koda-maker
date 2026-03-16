"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { sendGlobalNotification } from "@/app/(private)/dashboard/actions-notifications"

/**
 * PROCESAR SOLICITUD DE PEDIDO DESDE LA WEB PÚBLICA
 * Incluye validación de stock de seguridad y gestión de archivos
 */
export async function submitOrderRequest(formData: FormData, userId: string, templateId: string) {
    const customerName = formData.get("customerName") as string
    const customerPhone = formData.get("customerPhone") as string
    const quantity = parseInt(formData.get("quantity") as string) || 1
    const designDetails = formData.get("designDetails") as string
    const deliveryMethod = formData.get("deliveryMethod") as any
    const shippingAddress = formData.get("shippingAddress") as string
    const files = formData.getAll("files") as File[]

    // 1. BUSCAMOS LA PLANTILLA Y SU STOCK REAL
    const template = await prisma.productTemplate.findUnique({
        where: { id: templateId },
        include: { 
            materials: { 
                include: { material: true } 
            } 
        }
    })

    if (!template) throw new Error("Producto no encontrado")

    // 2. VALIDACIÓN TÉCNICA DE STOCK (CUELLO DE BOTELLA)
    // Verificamos si hay insumos suficientes para la cantidad pedida
    for (const item of template.materials) {
        if (item.material.type !== 'Máquina') {
            const availableForThisMaterial = Math.floor(item.material.stock / item.quantity);
            if (quantity > availableForThisMaterial) {
                // Si el cliente pide más de lo que el stock permite
                throw new Error(`Lo sentimos, no hay stock suficiente de ${item.material.name} para fabricar ${quantity} unidades.`);
            }
        }
    }

    // 3. SUBIDA DE ARCHIVOS A SUPABASE STORAGE
    const supabase = await createClient()
    const imageUrls: string[] = []

    for (const file of files) {
        if (file && file.size > 0 && file.name !== 'undefined') {
            try {
                const fileExt = file.name.split('.').pop()
                const fileName = `${userId}/public-order/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                
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
                    imageUrls.push(publicUrl)
                }
            } catch (err) {
                console.error("Error al subir archivo de cliente:", err)
            }
        }
    }

    // 4. CÁLCULO DE COSTO Y PRECIO FINAL
    const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)
    const totalPrice = template.basePrice * quantity

    // 5. CREAR EL PEDIDO EN LA BASE DE DATOS
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
            status: 'PRESUPUESTADO', // Siempre entra como presupuesto para revisión manual
            userId,
            deliveryDate: null, // Se coordina luego por WhatsApp
            items: {
                create: {
                    templateId,
                    quantity,
                    customPrice: template.basePrice
                }
            },
            images: {
                create: imageUrls.map(url => ({ url }))
            }
        }
    })

    // 6. NOTIFICACIONES (Push al celular del dueño y Centro de Notificaciones)
    try {
        await sendGlobalNotification(
            userId,
            "🛒 Nueva Solicitud Web",
            `${customerName} quiere ${quantity}x ${template.name}`,
            "DELIVERY"
        )
    } catch (error) {
        console.error("Error al enviar notificación push:", error)
    }

    return { 
        success: true, 
        orderId: order.id, 
        customerName: order.customerName, 
        productName: template.name 
    }
}