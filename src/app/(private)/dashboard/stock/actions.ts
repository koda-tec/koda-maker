"use server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { toast } from "sonner" 

export async function addMaterial(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autorizado")

  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const unit = formData.get("unit") as string
  const unitPrice = parseFloat(formData.get("unitPrice") as string)
  const stock = parseFloat(formData.get("stock") as string)
  const minStock = parseFloat(formData.get("minStock") as string)

  await prisma.material.create({
    data: {
      name,
      type,
      unit,
      unitPrice,
      stock,
      minStock,
      userId: user.id, // Vinculamos el material al usuario actual (SaaS)
    },
  })

  revalidatePath("/dashboard/stock")
}
export async function deleteMaterial(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  await prisma.material.delete({
    where: { id, userId: user.id }
  })

  revalidatePath("/dashboard/stock")
}

// Para editar, usaremos una acción simple
export async function updateMaterial(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const unitPrice = parseFloat(formData.get("unitPrice") as string)
  const stock = parseFloat(formData.get("stock") as string)

  await prisma.material.update({
    where: { id, userId: user.id },
    data: {
      name: formData.get("name") as string,
      unitPrice,
      stock,
    }
  })

  revalidatePath("/dashboard/stock")
}