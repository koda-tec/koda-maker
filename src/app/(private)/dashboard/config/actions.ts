"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// ACTUALIZAR PERFIL (Nombre y Logo)
export async function updateSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string // NUEVO
    const file = formData.get("logo") as File
    let logoUrl = undefined

    if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`
        const arrayBuffer = await file.arrayBuffer()
        const { data } = await supabase.storage.from('branding').upload(fileName, Buffer.from(arrayBuffer), { contentType: file.type, upsert: true })
        if (data) logoUrl = supabase.storage.from('branding').getPublicUrl(fileName).data.publicUrl
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { 
            name, 
            phone, // NUEVO
            ...(logoUrl && { logoUrl })
        }
    })
    revalidatePath("/dashboard/config")
}
// CAMBIAR CONTRASEÑA
export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get("password") as string
    const confirm = formData.get("confirm") as string

    if (password !== confirm) throw new Error("Las contraseñas no coinciden")
    if (password.length < 6) throw new Error("Mínimo 6 caracteres")

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}