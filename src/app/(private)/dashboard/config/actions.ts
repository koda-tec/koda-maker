"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const name = formData.get("name") as string
    const file = formData.get("logo") as File
    let logoUrl = undefined

    // Si subió un logo nuevo
    if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/logo.${fileExt}`
        
        const arrayBuffer = await file.arrayBuffer()
        
        const { data } = await supabase.storage
            .from('branding')
            .upload(fileName, Buffer.from(arrayBuffer), { 
                contentType: file.type,
                upsert: true 
            })
        
        if (data) {
            logoUrl = supabase.storage.from('branding').getPublicUrl(fileName).data.publicUrl
        }
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { 
            name,
            ...(logoUrl && { logoUrl })
        }
    })

    revalidatePath("/dashboard/config")
    revalidatePath("/dashboard/pedidos")
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}