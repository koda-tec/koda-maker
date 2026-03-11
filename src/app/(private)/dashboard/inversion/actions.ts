"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function registerPurchase(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const materialId = formData.get("materialId") as string
    const quantity = parseFloat(formData.get("quantity") as string)
    const newUnitPrice = parseFloat(formData.get("unitPrice") as string)
    const totalAmount = quantity * newUnitPrice

    await prisma.$transaction(async (tx) => {
        // 1. Registrar la compra
        await tx.purchase.create({
            data: {
                materialId,
                quantity,
                unitPrice: newUnitPrice,
                totalAmount,
                userId: user.id
            }
        })

        // 2. Actualizar el material (Suma stock y cambia precio base)
        await tx.material.update({
            where: { id: materialId },
            data: {
                unitPrice: newUnitPrice,
                stock: { increment: quantity }
            }
        })

        // 3. RECALCULAR COSTOS DE PEDIDOS PENDIENTES
        const pendingOrders = await tx.order.findMany({
            where: { 
                userId: user.id,
                status: { in: ['PRESUPUESTADO', 'CONFIRMADO', 'EN_PROCESO'] }
            },
            include: { 
                items: { 
                    include: { 
                        template: { 
                            include: { materials: true } 
                        } 
                    } 
                } 
            }
        })

        for (const order of pendingOrders) {
            let newTotalCost = 0
            for (const item of order.items) {
                const itemQuantity = item.quantity
                for (const tm of item.template.materials) {
                    // Buscamos el precio que acabamos de actualizar u otros precios vigentes
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

    revalidatePath("/dashboard/inversion")
    revalidatePath("/dashboard/stock")
    revalidatePath("/dashboard/reportes")
}