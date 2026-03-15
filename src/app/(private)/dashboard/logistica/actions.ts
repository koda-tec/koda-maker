"use server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendGlobalNotification } from "../actions-notifications"

export async function updateShippingInfo(formData: FormData) {
    const orderId = formData.get("orderId") as string
    const shippingCost = parseFloat(formData.get("shippingCost") as string) || 0
    const trackingUrl = formData.get("trackingUrl") as string

    const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
            shippingCost,
            trackingUrl,
            totalPrice: { increment: shippingCost } // Sumamos el envío al total del cliente
        }
    })

    // NOTIFICACIÓN PUSH AL CLIENTE (Simulada vía WhatsApp por ahora)
    await sendGlobalNotification(
        order.userId,
        "🚚 Envío Cotizado",
        `El envío de ${order.customerName} se cotizó en $${shippingCost}`,
        "PAYMENT"
    )

    revalidatePath("/dashboard/logistica")
}

export async function dispatchOrder(orderId: string) {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'ENTREGADO' }
    })

    await sendGlobalNotification(
        order.userId,
        "📦 Pedido Despachado",
        `El pedido #${order.orderNumber} de ${order.customerName} fue marcado como entregado/enviado.`,
        "DELIVERY"
    )

    revalidatePath("/dashboard/logistica")
    revalidatePath("/dashboard/pedidos")
}

export async function updateShippingPrice(orderId: string, cost: number) {
    await prisma.order.update({
        where: { id: orderId },
        data: { 
            shippingCost: cost,
            totalPrice: { increment: cost } 
        }
    })
    revalidatePath("/dashboard/logistica")
}