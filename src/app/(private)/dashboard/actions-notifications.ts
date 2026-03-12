"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import webpush from 'web-push'

// Configuración de llaves VAPID
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:kodasoftwar3@gmail.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

/**
 * SUSCRIBIR DISPOSITIVO
 */
export async function subscribeUser(subscription: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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

    // Bienvenida inmediata
    await sendGlobalNotification(
        user.id, 
        "🎯 Sistema Conectado", 
        "Koda Maker ya puede enviarte alertas a este celular.", 
        'STOCK'
    )
}

/**
 * FUNCIÓN MAESTRA DE NOTIFICACIONES (4 ARGUMENTOS)
 */
export async function sendGlobalNotification(
    userId: string, 
    title: string, 
    message: string, 
    type: string // <-- Asegúrate de que este cuarto argumento exista
) {
    // 1. Guardar en la base de datos para la campanita
    await prisma.notification.create({
        data: { title, message, type, userId }
    })

    // 2. Enviar Push al celular (con try-catch para no romper la app)
    try {
        const subs = await prisma.pushSubscription.findMany({ where: { userId } })
        const payload = JSON.stringify({ title, body: message })

        for (const sub of subs) {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { auth: sub.auth, p256dh: sub.p256dh }
                }, payload)
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } })
                }
            }
        }
    } catch (err) {
        console.error("Error en Push:", err)
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

// Nueva función para pruebas
export async function sendTestPush() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await sendGlobalNotification(
        user.id, 
        "🚀 Prueba de Koda", 
        "Tu sistema de notificaciones está volando.", 
        "DELIVERY"
    )
}