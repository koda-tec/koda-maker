"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

/**
 * Crea una nueva plantilla de producto (Cabecera)
 */
export async function createTemplate(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autorizado")

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const basePrice = parseFloat(formData.get("basePrice") as string) || 0
  const targetMargin = parseFloat(formData.get("targetMargin") as string) || 50 // Por defecto 50%
  const machineTimeMin = 0

  await prisma.productTemplate.create({
    data: {
      name,
      category,
      basePrice,
      targetMargin,
      machineTimeMin,
      userId: user.id,
    },
  })

  revalidatePath("/dashboard/templates")
}

/**
 * Elimina una plantilla y todas sus relaciones de materiales
 */
export async function deleteTemplate(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autorizado")

  // 1. Borramos primero las relaciones de materiales (cascada manual)
  await prisma.templateMaterial.deleteMany({
    where: { 
        templateId: id,
        template: { userId: user.id } // Seguridad: solo si pertenece al usuario
    }
  })

  // 2. Borramos la plantilla
  await prisma.productTemplate.delete({
    where: { 
        id, 
        userId: user.id 
    }
  })

  revalidatePath("/dashboard/templates")
}

/**
 * Actualiza solo los valores financieros (Precio y Margen) desde la calculadora de la receta
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

  // Revalidamos tanto la lista como la página específica de la receta
  revalidatePath("/dashboard/templates")
  revalidatePath(`/dashboard/templates/${id}`)
}