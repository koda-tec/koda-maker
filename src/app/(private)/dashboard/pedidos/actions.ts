"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

/**
 * CREAR PEDIDO: Registra la venta, sube imagen de diseño y descuenta stock
 */
export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  // 1. Extraer datos del formulario
  const customerName = formData.get("customerName") as string
  const customerPhone = formData.get("customerPhone") as string
  const templateId = formData.get("templateId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const deliveryDate = formData.get("deliveryDate") as string
  const designDetails = formData.get("designDetails") as string
  const notes = formData.get("notes") as string
  const status = formData.get("status") as any
  const deposit = parseFloat(formData.get("deposit") as string) || 0
  const file = formData.get("file") as File

  // 2. Subida de imagen a Supabase Storage (Bucket: disenos)
  let fileUrl = null
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.${fileExt}` // Carpeta por usuario
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('disenos')
      .upload(fileName, file)

    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from('disenos').getPublicUrl(fileName)
      fileUrl = publicUrl
    } else {
      console.error("Error al subir imagen:", uploadError)
    }
  }

  // 3. Buscar la plantilla para calcular costos y precios
  const template = await prisma.productTemplate.findUnique({
    where: { id: templateId, userId: user.id },
    include: { materials: { include: { material: true } } }
  })

  if (!template) throw new Error("Plantilla no encontrada")

  const totalPrice = template.basePrice * quantity
  const totalCost = template.materials.reduce((acc, m) => 
    acc + (m.quantity * m.material.unitPrice * quantity), 0
  )

  // 4. Ejecutar Transacción en la Base de Datos
  await prisma.$transaction(async (tx) => {
    // A. Crear el Pedido
    const order = await tx.order.create({
      data: {
        customerName,
        customerPhone,
        totalPrice,
        totalCost,
        status,
        designDetails,
        notes,
        fileUrl, // Guardamos la URL de la imagen
        deliveryDate: new Date(deliveryDate),
        userId: user.id,
        items: {
          create: {
            templateId: template.id,
            quantity,
            customPrice: template.basePrice,
          }
        },
        // B. Si dejó seña, registrar el pago inicial
        payments: deposit > 0 ? {
          create: { amount: deposit, method: "SEÑA" }
        } : undefined
      }
    })

    // C. DESCONTAR STOCK (Solo si no es un simple presupuesto)
    if (status !== "PRESUPUESTADO") {
      for (const item of template.materials) {
        await tx.material.update({
          where: { id: item.materialId },
          data: {
            stock: { decrement: item.quantity * quantity }
          }
        })
      }
    }
  })

  // 5. Refrescar datos
  revalidatePath("/dashboard/pedidos")
  revalidatePath("/dashboard/stock")
}

/**
 * ELIMINAR PEDIDO: Borra el registro y DEVUELVE los materiales al stock
 */
export async function deleteOrder(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  // 1. Buscamos el pedido para saber qué materiales devolver al estante
  const order = await prisma.order.findUnique({
    where: { id, userId: user.id },
    include: { 
      items: { 
        include: { 
          template: { 
            include: { 
                materials: { include: { material: true } } 
            } 
          } 
        } 
      } 
    }
  })

  if (!order) throw new Error("Pedido no encontrado")

  // 2. Transacción de borrado y devolución
  await prisma.$transaction(async (tx) => {
    // A. DEVOLVER STOCK (Si el pedido ya había restado stock)
    if (order.status !== "PRESUPUESTADO") {
      for (const item of order.items) {
        for (const m of item.template.materials) {
          await tx.material.update({
            where: { id: m.materialId },
            data: {
              stock: { increment: m.quantity * item.quantity }
            }
          })
        }
      }
    }

    // B. Borrar imagen del Storage si existe (Opcional, para ahorrar espacio)
    if (order.fileUrl) {
        const fileName = order.fileUrl.split('/').pop()
        if (fileName) {
            await supabase.storage.from('disenos').remove([`${user.id}/${fileName}`])
        }
    }

    // C. Borrar de la DB en orden de relación
    await tx.payment.deleteMany({ where: { orderId: id } })
    await tx.orderItem.deleteMany({ where: { orderId: id } })
    await tx.order.delete({ where: { id, userId: user.id } })
  })

  revalidatePath("/dashboard/pedidos")
  revalidatePath("/dashboard/stock")
}