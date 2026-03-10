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
  const deliveryDateRaw = formData.get("deliveryDate") as string
  const designDetails = formData.get("designDetails") as string
  const status = formData.get("status") as any
  const deposit = parseFloat(formData.get("deposit") as string) || 0
  
  const files = formData.getAll("files") as File[]
  const uploadedUrls: string[] = []

  // Subida de imágenes
  for (const file of files) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const arrayBuffer = await file.arrayBuffer()
      const { data: uploadData } = await supabase.storage
        .from('disenos').upload(fileName, Buffer.from(arrayBuffer), { contentType: file.type })
      if (uploadData) {
        const { data } = supabase.storage.from('disenos').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }
    }
  }

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
        items: { create: { templateId: template.id, quantity, customPrice: template.basePrice } },
        payments: deposit > 0 ? { create: { amount: deposit, method: "SEÑA" } } : undefined,
        images: { create: uploadedUrls.map(url => ({ url })) }
      }
    })

    // Solo descontamos stock si entra directamente como Confirmado o En Proceso
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

export async function updateOrderStatus(orderId: string, newStatus: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const order = await prisma.order.findUnique({
        where: { id: orderId, userId: user.id },
        include: { items: { include: { template: { include: { materials: true } } } } }
    })

    if (!order) return

    await prisma.$transaction(async (tx) => {
        // LÓGICA DE STOCK AL CAMBIAR DE ESTADO
        // Si pasamos de PRESUPUESTADO a un estado de producción -> DESCONTAMOS stock
        if (order.status === "PRESUPUESTADO" && newStatus !== "PRESUPUESTADO") {
            for (const item of order.items) {
                for (const m of item.template.materials) {
                    await tx.material.update({
                        where: { id: m.materialId },
                        data: { stock: { decrement: m.quantity * item.quantity } }
                    })
                }
            }
        }

        await tx.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        })
    })

    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/stock")
}

export async function deleteOrder(id: string) {
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