"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { sendGlobalNotification } from "../actions-notifications"

export async function registerPurchase(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const materialId = formData.get("materialId") as string
    const quantity = parseFloat(formData.get("quantity") as string)
    const newUnitPrice = parseFloat(formData.get("unitPrice") as string)
    const totalAmount = quantity * newUnitPrice

    const material = await prisma.material.findUnique({ where: { id: materialId } })

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Registrar la compra física
            await tx.purchase.create({
                data: { materialId, quantity, unitPrice: newUnitPrice, totalAmount, userId: user.id }
            })

            // 2. Actualizar el precio de mercado y stock del material
            await tx.material.update({
                where: { id: materialId },
                data: { unitPrice: newUnitPrice, stock: { increment: quantity } }
            })

            // 3. RECALCULAR PEDIDOS PENDIENTES (Lógica de Inflación)
            // Traemos todos los pedidos que aún no se entregaron para actualizar sus costos internos
            const pendingOrders = await tx.order.findMany({
                where: { 
                    userId: user.id, 
                    status: { in: ['PRESUPUESTADO', 'CONFIRMADO', 'EN_PROCESO'] } 
                },
                include: { items: { include: { template: { include: { materials: true } } } } }
            })

            for (const order of pendingOrders) {
                let newTotalCost = 0
                for (const item of order.items) {
                    const itemQty = item.quantity
                    for (const tm of item.template.materials) {
                        // Buscamos el precio fresquito del material que acabamos de actualizar
                        const currentMat = await tx.material.findUnique({ where: { id: tm.materialId } })
                        newTotalCost += (tm.quantity * (currentMat?.unitPrice || 0) * itemQty)
                    }
                }
                // Guardamos el nuevo costo total del pedido basado en los nuevos precios
                await tx.order.update({
                    where: { id: order.id },
                    data: { totalCost: newTotalCost }
                })
            }
        })

        // Notificación Push de Inversión
        await sendGlobalNotification(
            user.id, 
            "🧱 Inversión Registrada", 
            `Se sumaron ${quantity} unidades de ${material?.name || 'Insumo'}`, 
            'STOCK' // <-- El 4to argumento
        )

    } catch (e) {
        console.error("Error en el proceso de inversión:", e)
    }

    revalidatePath("/dashboard/inversion")
    revalidatePath("/dashboard/stock")
    revalidatePath("/dashboard/pedidos")
    revalidatePath("/dashboard/reportes")
}