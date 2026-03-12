import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { sendGlobalNotification } from "@/app/(private)/dashboard/actions-notifications"

export async function GET(req: Request) {
  // Verificamos que sea Vercel quien llama (Seguridad)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('No autorizado', { status: 401 })
  }

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA') // Formato YYYY-MM-DD

  // 1. BUSCAR ENTREGAS PARA MAÑANA
  const pendingDeliveries = await prisma.order.findMany({
    where: {
      status: { in: ['CONFIRMADO', 'EN_PROCESO'] },
      deliveryDate: {
        gte: new Date(tomorrowStr + "T00:00:00Z"),
        lt: new Date(tomorrowStr + "T23:59:59Z")
      }
    }
  })

  // Enviamos recordatorios
  for (const order of pendingDeliveries) {
    await sendGlobalNotification(
        order.userId, 
        "⏰ Recordatorio de Entrega", 
        `Mañana debes entregar el pedido de ${order.customerName}`, 
        'DELIVERY'
    )
  }

  // 2. RESUMEN DE VENTAS DE AYER
  // (Opcional: podrías sumar lo vendido el día anterior y avisar a primera hora)

  return NextResponse.json({ processed: pendingDeliveries.length })
}