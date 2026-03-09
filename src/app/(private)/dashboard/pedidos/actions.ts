"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const customerName = formData.get("customerName") as string
  const templateId = formData.get("templateId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const deliveryDate = formData.get("deliveryDate") as string
  const status = formData.get("status") as any // CONFIRMADO, PRESUPUESTADO, etc.

  // 1. Buscamos la plantilla para saber el precio y los materiales
  const template = await prisma.productTemplate.findUnique({
    where: { id: templateId },
    include: { materials: { include: { material: true } } }
  })

  if (!template) throw new Error("Plantilla no encontrada")

  const totalPrice = template.basePrice * quantity
  const totalCost = template.materials.reduce((acc, m) => acc + (m.quantity * m.material.unitPrice * quantity), 0)

  // 2. Usamos una TRANSACCIÓN para asegurar que si algo falla, no se guarde nada a medias
  await prisma.$transaction(async (tx) => {
    // A. Creamos el pedido
    const order = await tx.order.create({
      data: {
        customerName,
        totalPrice,
        totalCost,
        status,
        deliveryDate: new Date(deliveryDate),
        userId: user.id,
        items: {
          create: {
            templateId: template.id,
            quantity,
            customPrice: template.basePrice,
          }
        }
      }
    })

    // B. Si el pedido está CONFIRMADO o EN_PROCESO, restamos el stock
    if (status !== "PRESUPUESTADO") {
      for (const item of template.materials) {
        await tx.material.update({
          where: { id: item.materialId },
          data: {
            stock: { decrement: item.quantity * quantity }
          }
        })
      }
    }
  })

  revalidatePath("/dashboard/pedidos")
  revalidatePath("/dashboard/stock")
}