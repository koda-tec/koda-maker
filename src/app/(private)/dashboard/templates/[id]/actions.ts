"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

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

export async function removeMaterialFromTemplate(id: string, templateId: string) {
  await prisma.templateMaterial.delete({
    where: { id }
  })
  revalidatePath(`/dashboard/templates/${templateId}`)
}