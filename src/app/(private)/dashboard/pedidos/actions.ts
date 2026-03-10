"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  // 1. Extraer datos básicos
  const customerName = formData.get("customerName") as string
  const customerPhone = formData.get("customerPhone") as string
  const templateId = formData.get("templateId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const deliveryDate = formData.get("deliveryDate") as string
  const designDetails = formData.get("designDetails") as string
  const status = formData.get("status") as any
  const deposit = parseFloat(formData.get("deposit") as string) || 0
  
  // 2. EXTRAER MÚLTIPLES ARCHIVOS
  const files = formData.getAll("files") as File[]
  const uploadedUrls: string[] = []

  for (const file of files) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { data: uploadData } = await supabase.storage
        .from('disenos')
        .upload(fileName, buffer, { contentType: file.type, upsert: true })

      if (uploadData) {
        const { data } = supabase.storage.from('disenos').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }
    }
  }

  // 3. Cálculos de costo y precio
  const template = await prisma.productTemplate.findUnique({
    where: { id: templateId, userId: user.id },
    include: { materials: { include: { material: true } } }
  })
  if (!template) throw new Error("Plantilla no encontrada")

  const totalPrice = template.basePrice * quantity
  const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)

  // 4. Guardar en DB con Transacción
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerName, customerPhone, totalPrice, totalCost, status,
        designDetails, userId: user.id,
        deliveryDate: new Date(deliveryDate),
        items: { create: { templateId: template.id, quantity, customPrice: template.basePrice } },
        payments: deposit > 0 ? { create: { amount: deposit, method: "SEÑA" } } : undefined,
        // GUARDAR TODAS LAS URLs
        images: {
          create: uploadedUrls.map(url => ({ url }))
        }
      }
    })

    if (status !== "PRESUPUESTADO") {
      for (const item of template.materials) {
        await tx.material.update({
          where: { id: item.materialId },
          data: { stock: { decrement: item.quantity * quantity } }
        })
      }
    }
  })

  revalidatePath("/dashboard/pedidos")
  revalidatePath("/dashboard/stock")
}

export async function deleteOrder(id: string) {
    // La lógica de borrado es igual, pero Prisma borrará las imágenes 
    // automáticamente por el "onDelete: Cascade" que pusimos en el esquema.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const order = await prisma.order.findUnique({
        where: { id, userId: user.id },
        include: { images: true, items: { include: { template: { include: { materials: true } } } } }
    })
    if (!order) return

    await prisma.$transaction(async (tx) => {
        if (order.status !== "PRESUPUESTADO") {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    await tx.material.update({ where: { id: m.materialId }, data: { stock: { increment: m.quantity * item.quantity } } })
                }
            }
        }
        
        // Borrar archivos de Supabase Storage
        for (const img of order.images) {
            const path = img.url.split('/public/disenos/')[1]
            if (path) await supabase.storage.from('disenos').remove([path])
        }

        await tx.payment.deleteMany({ where: { orderId: id } })
        await tx.orderImage.deleteMany({ where: { orderId: id } })
        await tx.orderItem.deleteMany({ where: { orderId: id } })
        await tx.order.delete({ where: { id, userId: user.id } })
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}