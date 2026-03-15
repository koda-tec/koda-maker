import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CheckCircle2, MessageSquare, Package } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

// --- METADATA DINÁMICA PARA LA PESTAÑA ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const user = await prisma.user.findUnique({ where: { slug } })
    return {
        title: `Pedido Recibido | ${user?.name || 'Tienda'}`,
        description: "Tu solicitud ha sido enviada con éxito.",
        icons: { icon: user?.logoUrl || "/favicon.ico" }
    }
}

export default async function SuccessOrderPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ slug: string }>, 
    searchParams: Promise<{ order?: string }> 
}) {
    const { slug } = await params
    const { order: orderId } = await searchParams

    if (!orderId) notFound()

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
            user: true, 
            items: { include: { template: true } } 
        }
    })

    if (!order) notFound()

    const sellerPhone = order.user.phone?.replace(/\D/g, '') || ""
    
    // MENSAJE DE WHATSAPP LIMPIO Y CODIFICADO
    const text = `¡Hola *${order.user.name}*! 👋 Acabo de enviarte una solicitud de pedido.\n\n` +
                 `✅ *Pedido:* #00${order.orderNumber}\n` +
                 `👤 *Cliente:* ${order.customerName}\n` +
                 `🛍️ *Producto:* ${order.items[0]?.template.name}\n` +
                 `🔢 *Cantidad:* ${order.items[0]?.quantity}\n\n` +
                 `Espero tu confirmación para coordinar el pago. ¡Gracias!`;

    const whatsappLink = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(text)}`

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-black font-sans flex flex-col items-center justify-center p-6 pb-20">
            <div className="max-w-md w-full space-y-10 text-center">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-green-100 rounded-[35px] animate-ping opacity-20" />
                    <div className="relative bg-white border-2 border-green-100 rounded-[35px] w-full h-full flex items-center justify-center text-green-500 shadow-xl">
                        <CheckCircle2 size={48} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-black">
                        ¡Pedido <br /> <span className="text-green-500">Recibido!</span>
                    </h1>
                    <p className="text-zinc-500 font-medium italic">
                        Gracias {order.customerName}, tu solicitud ha sido enviada con éxito.
                    </p>
                </div>

                <div className="bg-white border border-zinc-100 rounded-[40px] p-8 shadow-2xl space-y-6 relative overflow-hidden text-left">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em]">
                        <span>Resumen de Orden</span>
                        <span>#00{order.orderNumber}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 shadow-inner">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="font-black uppercase text-sm leading-none text-black">{order.items[0]?.template.name}</p>
                            <p className="text-xs font-bold text-zinc-400 mt-1">{order.items[0]?.quantity} unidades</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-dashed border-zinc-100 flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase text-zinc-400">Total Estimado</p>
                        <p className="text-3xl font-black text-black tracking-tighter">${order.totalPrice.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-green-500 rounded-r-full" />
                </div>

                <div className="space-y-4 pt-4">
                    <p className="text-[11px] font-black uppercase text-zinc-400 tracking-widest leading-relaxed px-4">
                        Para confirmar los detalles y el pago, <br /> escribinos ahora mismo:
                    </p>
                    <a 
                        href={whatsappLink}
                        className="flex items-center justify-center gap-3 w-full py-6 bg-[#25D366] text-white rounded-[30px] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all active:scale-95 shadow-green-200"
                    >
                        <MessageSquare size={20} fill="white" />
                        Confirmar por WhatsApp
                    </a>
                    <Link href={`/v/${slug}`} className="block text-[10px] font-black text-zinc-400 uppercase hover:text-black transition-colors pt-4">
                        Volver a la tienda
                    </Link>
                </div>
            </div>
            <footer className="fixed bottom-10 text-center w-full left-0">
                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">Powered by Koda Maker</p>
            </footer>
        </div>
    )
}