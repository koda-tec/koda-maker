"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createTemplate(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const machineTimeMin = parseInt(formData.get("machineTimeMin") as string)

  await prisma.productTemplate.create({
    data: {
      name,
      category,
      basePrice,
      machineTimeMin,
      userId: user.id,
    },
  })

  revalidatePath("/dashboard/templates")
}