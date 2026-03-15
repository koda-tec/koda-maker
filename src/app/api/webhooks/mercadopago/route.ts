import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

  if (paymentId) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      });
      
      const payment = await response.json();

      if (payment.status === "approved") {
        const userId = payment.external_reference;
        const amount = payment.transaction_amount;

        // Calculamos el vencimiento (30 días o 365 días)
        const daysToAdd = amount > 50000 ? 365 : 30;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + daysToAdd);

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            validUntil: validUntil,
          },
        });
        
        console.log(`✅ Plan activado para usuario ${userId}`);
      }
    } catch (error) {
      console.error("Error Webhook:", error);
    }
  }

  // SIEMPRE responder 200 a Mercado Pago
  return new NextResponse("OK", { status: 200 });
}