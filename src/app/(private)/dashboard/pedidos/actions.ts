"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const customerName = formData.get("customerName") as string
  const customerPhone = formData.get("customerPhone") as string
  const templateId = formData.get("templateId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const deliveryDate = formData.get("deliveryDate") as string
  const designDetails = formData.get("designDetails") as string
  const status = formData.get("status") as any
  const deposit = parseFloat(formData.get("deposit") as string) || 0
  const file = formData.get("file") as File

  let fileUrl = null

  // SUBIDA DE IMAGEN MEJORADA
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}` // Usamos Date.now() para que sea único
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('disenos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from('disenos').getPublicUrl(fileName)
      fileUrl = publicUrl
    } else if (uploadError) {
      console.error("Error Supabase Storage:", uploadError.message)
    }
  }

  const template = await prisma.productTemplate.findUnique({
    where: { id: templateId, userId: user.id },
    include: { materials: { include: { material: true } } }
  })

  if (!template) throw new Error("Plantilla no encontrada")

  const totalPrice = template.basePrice * quantity
  const totalCost = template.materials.reduce((acc, m) => 
    acc + (m.quantity * m.material.unitPrice * quantity), 0
  )

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        customerName,
        customerPhone,
        totalPrice,
        totalCost,
        status,
        designDetails,
        fileUrl, 
        deliveryDate: new Date(deliveryDate),
        userId: user.id,
        items: {
          create: {
            templateId: template.id,
            quantity,
            customPrice: template.basePrice,
          }
        },
        payments: deposit > 0 ? {
          create: { amount: deposit, method: "SEÑA" }
        } : undefined
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const order = await prisma.order.findUnique({
    where: { id, userId: user.id },
    include: { items: { include: { template: { include: { materials: true } } } } }
  })

  if (!order) throw new Error("Pedido no encontrado")

  await prisma.$transaction(async (tx) => {
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

    // BORRADO FÍSICO DE LA IMAGEN EN STORAGE
    if (order.fileUrl) {
        const path = order.fileUrl.split('/public/disenos/')[1]
        if (path) {
            await supabase.storage.from('disenos').remove([path])
        }
    }

    await tx.payment.deleteMany({ where: { orderId: id } })
    await tx.orderItem.deleteMany({ where: { orderId: id } })
    await tx.order.delete({ where: { id, userId: user.id } })
  })

  revalidatePath("/dashboard/pedidos")
  revalidatePath("/dashboard/stock")
}