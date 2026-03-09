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
  const notes = formData.get("notes") as string
  const status = formData.get("status") as any
  const deposit = parseFloat(formData.get("deposit") as string) || 0 // La seña

  const template = await prisma.productTemplate.findUnique({
    where: { id: templateId },
    include: { materials: { include: { material: true } } }
  })

  if (!template) throw new Error("Plantilla no encontrada")

  const totalPrice = template.basePrice * quantity
  const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerName,
        customerPhone,
        totalPrice,
        totalCost,
        status,
        designDetails,
        notes,
        deliveryDate: new Date(deliveryDate),
        userId: user.id,
        items: {
          create: { templateId: template.id, quantity, customPrice: template.basePrice }
        },
        // Si dejó seña, creamos el pago automáticamente
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
}

export async function deleteOrder(id: string) {
  await prisma.payment.deleteMany({ where: { orderId: id } })
  await prisma.orderItem.deleteMany({ where: { orderId: id } })
  await prisma.order.delete({ where: { id } })
  revalidatePath("/dashboard/pedidos")
}