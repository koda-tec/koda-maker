"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import webpush from 'web-push'

// Configuramos las llaves solo si existen
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@koda.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

export async function subscribeUser(subscription: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Guardamos la suscripción del navegador en la base de datos
    await prisma.pushSubscription.upsert({
        where: { endpoint: subscription.endpoint },
        update: {},
        create: {
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            userId: user.id
        }
    })
}

export async function sendGlobalNotification(userId: string, title: string, message: string, type: string) {
    // 1. Siempre guardamos en la tabla de notificaciones interna (la campanita)
    await prisma.notification.create({
        data: { title, message, type, userId }
    })

    // 2. Intentamos enviar el Push al celular
    try {
        const subs = await prisma.pushSubscription.findMany({ where: { userId } })
        
        const payload = JSON.stringify({ title, message })

        for (const sub of subs) {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { auth: sub.auth, p256dh: sub.p256dh }
                }, payload)
            } catch (error: any) {
                // Si el token expiró o es inválido, borramos la suscripción
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } })
                }
            }
        }
    } catch (err) {
        console.error("Error silencioso en Push:", err)
        // No lanzamos error para que la App no se bloquee (Pantalla blanca)
    }
}

export async function markAsRead(id: string) {
    await prisma.notification.update({ where: { id }, data: { read: true } })
    revalidatePath("/dashboard")
}

export async function clearAllNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await prisma.notification.deleteMany({ where: { userId: user.id } })
    revalidatePath("/dashboard")
}
