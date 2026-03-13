"use server"
import { createClient } from "@/lib/supabase-server"

export async function getSubscriptionLink() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Usamos el init_point que te dio el script, 
    // pero le agregamos el email para que el cliente no tenga que escribirlo
    const planId = process.env.NEXT_PUBLIC_MP_PLAN_ID
    const baseUrl = "https://www.mercadopago.com.ar/subscriptions/checkout"
    
    // El 'external_reference' es clave: es el ID del usuario en tu base de datos
    const checkoutUrl = `${baseUrl}?preapproval_plan_id=${planId}&prefill_email=${user.email}&external_reference=${user.id}`
    
    return checkoutUrl
}