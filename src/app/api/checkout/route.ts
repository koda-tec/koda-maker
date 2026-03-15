import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase-server";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("No autorizado", { status: 401 });

    const { planType, amount } = await request.json(); // 'MONTHLY' o 'YEARLY'

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: planType,
            title: `Koda Maker - Plan ${planType === 'MONTHLY' ? 'Mensual' : 'Anual'}`,
            quantity: 1,
            unit_price: amount,
            currency_id: "ARS",
          },
        ],
        // ACA ESTÁ LA LLAVE: Guardamos quién está pagando
        external_reference: user.id, 
        notification_url: "https://koda-maker.vercel.app/api/webhooks/mercadopago",
        back_urls: {
          success: "https://koda-maker.vercel.app/dashboard",
          failure: "https://koda-maker.vercel.app/pago-requerido",
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ init_point: preference.init_point });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error al crear preferencia", { status: 500 });
  }
}