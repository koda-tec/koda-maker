import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
    const body = await request.json()
    const { type, data } = body

    // Mercado Pago envía notificaciones de varios tipos. 
    // Nos interesa 'subscription_preapproval' (Suscripciones)
    if (type === "subscription_preapproval") {
        try {
            // Buscamos el detalle de la suscripción en la API de MP
            const res = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
                }
            })
            const subscription = await res.json()

            // Si el pago fue aprobado
            if (subscription.status === "authorized") {
                const userId = subscription.external_reference // El ID que mandamos antes

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        plan: "PRO",
                        subscriptionId: subscription.id,
                        validUntil: new Date(subscription.next_payment_date)
                    }
                })
                console.log(`✅ Usuario ${userId} activado como PRO`)
            }
        } catch (error) {
            console.error("Error procesando Webhook MP:", error)
        }
    }

    return new NextResponse("OK", { status: 200 })
}