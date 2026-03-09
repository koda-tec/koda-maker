"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

/**
 * 1. Añade un material de la lista de stock a la receta de esta plantilla
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
 * 2. Quita un material de la receta
 */
export async function removeMaterialFromTemplate(id: string, templateId: string) {
  await prisma.templateMaterial.delete({
    where: { id }
  })
  revalidatePath(`/dashboard/templates/${templateId}`)
}

/**
 * 3. Actualiza el precio de venta final y el margen de ganancia deseado
 */
export async function updateTemplatePricing(id: string, basePrice: number, targetMargin: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autorizado")

  await prisma.productTemplate.update({
    where: { 
        id,
        userId: user.id 
    },
    data: {
      basePrice,
      targetMargin,
    }
  })

  // Refrescamos ambas páginas para que los cambios se vean en todos lados
  revalidatePath(`/dashboard/templates/${id}`)
  revalidatePath("/dashboard/templates")
}