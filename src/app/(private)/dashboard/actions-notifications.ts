"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

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