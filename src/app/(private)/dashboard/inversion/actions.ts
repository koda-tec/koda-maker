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
                let newTotalInternalCost = 0; // Solo para nuestra analítica
                for (const item of order.items) {
                    for (const tm of item.template.materials) {
                        const mat = await tx.material.findUnique({ where: { id: tm.materialId } });
                        newTotalInternalCost += (tm.quantity * (mat?.unitPrice || 0) * item.quantity);
                    }
                }

                // ACTUALIZAMOS SOLO EL COSTO
                await tx.order.update({
                    where: { id: order.id },
                    data: { 
                        totalCost: newTotalInternalCost 
                        // totalPrice NO se toca aquí, queda igual a lo pactado.
                    }
                });
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