"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateStoreSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = formData.get("slug") as string
    const isStoreActive = formData.get("isStoreActive") === "true"
    const localShippingCost = parseFloat(formData.get("localShippingCost") as string) || 0
    const allowPickup = formData.get("allowPickup") === "on"
    const allowNationwide = formData.get("allowNationwide") === "on"

    // Validar que el slug no esté usado por otro (opcional pero recomendado)
    
    await prisma.user.update({
        where: { id: user.id },
        data: {
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
            isStoreActive,
            localShippingCost,
            allowPickup,
            allowNationwide
        }
    })

    revalidatePath("/dashboard/tienda")
}