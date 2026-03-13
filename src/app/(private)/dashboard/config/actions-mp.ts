"use server"
import { createClient } from "@/lib/supabase-server"

export async function getSubscriptionLink(planType: 'MONTHLY' | 'YEARLY') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // El ID del plan mensual que creamos antes
    const MONTHLY_PLAN_ID = process.env.NEXT_PUBLIC_MP_PLAN_ID
    // ID del plan anual (deberías crear uno similar al mensual pero con monto 200.000)
    const YEARLY_PLAN_ID = process.env.YEARLY_PLAN_ID || MONTHLY_PLAN_ID 

    const planId = planType === 'MONTHLY' ? MONTHLY_PLAN_ID : YEARLY_PLAN_ID
    const baseUrl = "https://www.mercadopago.com.ar/subscriptions/checkout"
    
    // Construimos la URL pasando el external_reference (ID del usuario)
    // Esto es lo que el Webhook usará para saber a quién activar.
    const checkoutUrl = `${baseUrl}?preapproval_plan_id=${planId}&prefill_email=${user.email}&external_reference=${user.id}`
    
    return checkoutUrl
}