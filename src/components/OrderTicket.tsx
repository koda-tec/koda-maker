"use client"
import React, { useRef } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface TicketProps {
    order: any
    businessName: string
}

export function OrderTicket({ order, businessName }: TicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null)

    const exportImage = async () => {
        if (ticketRef.current === null) return

        try {
            const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 })
            const link = document.createElement('a')
            link.download = `Presupuesto-${order.customerName}.png`
            link.href = dataUrl
            link.click()
            toast.success("Imagen generada correctamente")
        } catch (err) {
            toast.error("Error al generar la imagen")
            console.error(err)
        }
    }

    return (
        <div className="flex flex-col items-center">
            {/* ESTO ES LO QUE SE CONVIERTE EN IMAGEN (Hidden but rendered) */}
            <div className="absolute -left-9999px top-0">
                <div 
                    ref={ticketRef} 
                    className="w-400px bg-white p-8 border-t-12px border-black text-black font-sans"
                >
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">{businessName}</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Presupuesto Digital</p>
                    </div>

                    <div className="border-y border-dashed border-gray-200 py-4 mb-6 space-y-1">
                        <p className="text-xs font-bold uppercase">Cliente: <span className="font-black">{order.customerName}</span></p>
                        <p className="text-[10px] text-gray-400">Fecha: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm uppercase">{item.template.name}</p>
                                    <p className="text-[10px] text-gray-500">{item.quantity} unidades x ${item.customPrice}</p>
                                </div>
                                <span className="font-black text-sm">${(item.quantity * item.customPrice).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-black text-xs uppercase">Total a Pagar</span>
                            <span className="text-2xl font-black">${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="text-[9px] text-center text-gray-400 font-medium leading-tight">
                        <p>Gracias por confiar en nosotros.</p>
                        <p className="mt-1">Presupuesto válido por 7 días.</p>
                        <p className="mt-4 font-black text-black">POWERED BY KODA TECH</p>
                    </div>
                </div>
            </div>

            {/* BOTÓN QUE ACTIVA LA DESCARGA */}
            <button 
                onClick={exportImage}
                className="w-full py-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
                <Share2 size={14} /> Generar Imagen para WhatsApp
            </button>
        </div>
    )
}