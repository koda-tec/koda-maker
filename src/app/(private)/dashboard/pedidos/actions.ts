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
  
  // LOGICA DE ARCHIVO MEJORADA
  const file = formData.get("file") as File
  let fileUrl = null

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    // Convertimos el File a Buffer para que Next.js no lo corrompa
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('disenos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error("Error al subir:", uploadError.message)
    } else {
      const { data } = supabase.storage.from('disenos').getPublicUrl(fileName)
      fileUrl = data.publicUrl
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
        customerName, customerPhone, totalPrice, totalCost, status,
        designDetails, fileUrl, userId: user.id,
        deliveryDate: new Date(deliveryDate),
        items: { create: { templateId: template.id, quantity, customPrice: template.basePrice } },
        payments: deposit > 0 ? { create: { amount: deposit, method: "SEÑA" } } : undefined
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

  if (!order) return

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
    await tx.payment.deleteMany({ where: { orderId: id } })
    await tx.orderItem.deleteMany({ where: { orderId: id } })
    await tx.order.delete({ where: { id, userId: user.id } })
  })

  revalidatePath("/dashboard/pedidos")
  revalidatePath("/dashboard/stock")
}