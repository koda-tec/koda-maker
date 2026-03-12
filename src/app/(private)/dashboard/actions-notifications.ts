"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

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
}

// FUNCIÓN MAESTRA: Envía a la DB y al Celular
export async function sendGlobalNotification(userId: string, title: string, message: string, type: string) {
    // 1. Guardar en la DB (lo que ya hacíamos)
    await prisma.notification.create({
        data: { title, message, type, userId }
    })

    // 2. Buscar dispositivos suscritos
    const subs = await prisma.pushSubscription.findMany({ where: { userId } })

    // 3. Enviar Push real
    const payload = JSON.stringify({ title, message })
    
    subs.forEach(sub => {
        webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: { auth: sub.auth, p256dh: sub.p256dh }
        }, payload).catch(err => console.error("Error enviando push", err))
    })
}

export async function markAsRead(id: string) {
    await prisma.notification.update({
        where: { id },
        data: { read: true }
    })
    revalidatePath("/dashboard")
}

export async function clearAllNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await prisma.notification.deleteMany({
        where: { userId: user.id }
    })
    revalidatePath("/dashboard")
}