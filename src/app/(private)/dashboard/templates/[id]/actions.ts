"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

/**
 * 1. AÑADIR MATERIAL A LA RECETA
 */
export async function addMaterialToTemplate(templateId: string, formData: FormData) {
  const materialId = formData.get("materialId") as string
  const quantity = parseFloat(formData.get("quantity") as string)

  await prisma.templateMaterial.create({
    data: {
      templateId,
      materialId,
      quantity,
    },
  })

  revalidatePath(`/dashboard/templates/${templateId}`)
}

/**
 * 2. QUITAR MATERIAL DE LA RECETA
 */
export async function removeMaterialFromTemplate(id: string, templateId: string) {
  await prisma.templateMaterial.delete({
    where: { id }
  })
  revalidatePath(`/dashboard/templates/${templateId}`)
}

/**
 * 3. ACTUALIZAR PRECIOS Y MARGEN
 */
export async function updateTemplatePricing(id: string, basePrice: number, targetMargin: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  await prisma.productTemplate.update({
    where: { id, userId: user.id },
    data: { basePrice, targetMargin }
  })

  revalidatePath(`/dashboard/templates/${id}`)
  revalidatePath("/dashboard/templates")
}

/**
 * 4. ACTUALIZAR CONFIGURACIÓN DE TIENDA (SOPORTE MULTI-IMAGEN)
 */
export async function updatePublicSettings(templateId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isPublic = formData.get("isPublic") === "true"
    const publicDescription = formData.get("publicDescription") as string
    const files = formData.getAll("publicImages") as File[]
    const uploadedUrls: string[] = []

    // Subida de múltiples imágenes
    for (const file of files) {
        if (file && file.size > 0) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/catalog/${templateId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            
            const arrayBuffer = await file.arrayBuffer()
            const { data } = await supabase.storage
                .from('productos')
                .upload(fileName, Buffer.from(arrayBuffer), { 
                    contentType: file.type,
                    upsert: true 
                })
            
            if (data) {
                const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName)
                uploadedUrls.push(urlData.publicUrl)
            }
        }
    }

    // Actualizamos datos y creamos las nuevas relaciones de imágenes
    await prisma.productTemplate.update({
        where: { id: templateId, userId: user.id },
        data: {
            isPublic,
            publicDescription,
            images: {
                create: uploadedUrls.map(url => ({ url }))
            }
        }
    })

    revalidatePath(`/dashboard/templates/${templateId}`)
}

/**
 * 5. BORRAR IMAGEN INDIVIDUAL DEL CATÁLOGO
 */
export async function deleteTemplateImage(imageId: string, imageUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Extraer el path para borrar del storage
    // Ejemplo de URL: .../storage/v1/object/public/productos/user_id/catalog/file.png
    const pathParts = imageUrl.split('/productos/')
    const path = pathParts[1]
    
    if (path) {
        await supabase.storage.from('productos').remove([path])
    }

    // Borramos de la base de datos
    await prisma.templateImage.delete({
        where: { id: imageId }
    })

    // No necesitamos el ID de la plantilla porque ya estamos en la ruta
    // Pero forzamos revalidate para que desaparezca de la UI
    revalidatePath(`/dashboard/templates`, 'layout')
}