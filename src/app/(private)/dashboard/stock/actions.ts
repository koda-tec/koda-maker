"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { toast } from "sonner" 
import { sendGlobalNotification } from "../actions-notifications"
export async function addMaterial(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autorizado")

  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const unit = formData.get("unit") as string
  const unitPrice = parseFloat(formData.get("unitPrice") as string)
  const stock = parseFloat(formData.get("stock") as string)
  const minStock = parseFloat(formData.get("minStock") as string)

  await prisma.material.create({
    data: {
      name,
      type,
      unit,
      unitPrice,
      stock,
      minStock,
      userId: user.id, // Vinculamos el material al usuario actual (SaaS)
    },
  })

  revalidatePath("/dashboard/stock")
}
export async function deleteMaterial(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  await prisma.material.delete({
    where: { id, userId: user.id }
  })

  revalidatePath("/dashboard/stock")
}

// Para editar, usaremos una acción simple
export async function updateMaterial(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const unitPrice = parseFloat(formData.get("unitPrice") as string)
  const stock = parseFloat(formData.get("stock") as string)

  await prisma.material.update({
    where: { id, userId: user.id },
    data: {
      name: formData.get("name") as string,
      unitPrice,
      stock,
    }
  })

  revalidatePath("/dashboard/stock")
}

export async function registerPurchase(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const materialId = formData.get("materialId") as string
    const quantity = parseFloat(formData.get("quantity") as string)
    const newUnitPrice = parseFloat(formData.get("unitPrice") as string)
    const totalAmount = quantity * newUnitPrice

    await prisma.$transaction(async (tx) => {
        // 1. Registrar la compra (Inversión)
        await tx.purchase.create({
            data: {
                materialId,
                quantity,
                unitPrice: newUnitPrice,
                totalAmount,
                userId: user.id
            }
        })

        // 2. Actualizar el material (Nuevo precio y sumar stock)
        await tx.material.update({
            where: { id: materialId },
            data: {
                unitPrice: newUnitPrice,
                stock: { increment: quantity }
            }
        })

        // 3. ACTUALIZAR COSTOS DE PEDIDOS PENDIENTES
        // Buscamos pedidos que no estén entregados
        const pendingOrders = await tx.order.findMany({
            where: { 
                userId: user.id,
                status: { in: ['PRESUPUESTADO', 'CONFIRMADO', 'EN_PROCESO'] }
            },
            include: { items: { include: { template: { include: { materials: true } } } } }
        })

        for (const order of pendingOrders) {
            // Recalculamos el costo total del pedido con los precios nuevos de los materiales
            let newTotalCost = 0
            for (const item of order.items) {
                const itemQuantity = item.quantity
                for (const tm of item.template.materials) {
                    // Buscamos el precio actualizado del material
                    const mat = await tx.material.findUnique({ where: { id: tm.materialId } })
                    newTotalCost += (tm.quantity * (mat?.unitPrice || 0) * itemQuantity)
                }
            }

            await tx.order.update({
                where: { id: order.id },
                data: { totalCost: newTotalCost }
            })
        }
    })

    revalidatePath("/dashboard/stock")
    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/reportes")
}
export async function adjustStock(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const materialId = formData.get("materialId") as string
    const quantity = parseFloat(formData.get("quantity") as string)
    const reason = formData.get("reason") as string

    if (isNaN(quantity) || quantity <= 0) return

    try {
        const updatedMaterial = await prisma.$transaction(async (tx) => {
            // 1. Restamos el stock
            const mat = await tx.material.update({
                where: { id: materialId },
                data: { stock: { decrement: quantity } }
            })

            // 2. Creamos la notificación interna
            await tx.notification.create({
                data: {
                    title: "Consumo Interno",
                    message: `${quantity} ${mat.unit} de ${mat.name} usados para: ${reason}`,
                    type: 'STOCK',
                    userId: user.id
                }
            })
            return mat
        })

        // 3. Notificación Push al celular (Opcional, para control)
        await sendGlobalNotification(
            user.id, 
            "🛠️ Ajuste de Stock", 
            `Consumo interno: ${quantity} un. de ${updatedMaterial.name}`, 
            'STOCK'
        )

    } catch (error) {
        console.error("Error al ajustar stock:", error)
    }

    revalidatePath("/dashboard/stock")
    revalidatePath("/dashboard")
}