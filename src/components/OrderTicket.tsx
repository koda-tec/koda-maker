"use client"
import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function OrderTicket({ order, businessName }: { order: any, businessName: string }) {
    const ticketRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)

    const exportImage = async () => {
        if (ticketRef.current === null) return
        setLoading(true)
        try {
            // Esperamos un momento para renderizado
            await new Promise(resolve => setTimeout(resolve, 500))
            const dataUrl = await toPng(ticketRef.current, { 
                cacheBust: true, 
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            })
            const link = document.createElement('a')
            link.download = `Presupuesto-${order.customerName}.png`
            link.href = dataUrl
            link.click()
            toast.success("Imagen generada")
        } catch (err) {
            toast.error("Error al generar imagen")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {/* EL TICKET: Con 'fixed' y lejos de la vista real */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -100 }}>
                <div 
                    ref={ticketRef} 
                    className="w-500px bg-white p-12 text-black font-sans"
                    style={{ backgroundColor: 'white' }}
                >
                    <div className="text-center border-b-4 border-black pb-8 mb-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">{businessName}</h2>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Presupuesto de Trabajo</p>
                    </div>

                    <div className="flex justify-between font-black uppercase mb-10">
                        <span>Cliente: {order.customerName}</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-6 mb-10">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-end border-b border-gray-100 pb-4">
                                <div>
                                    <p className="font-black text-xl uppercase leading-none">{item.template.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1">{item.quantity} UNIDADES X ${item.customPrice}</p>
                                </div>
                                <span className="font-black text-xl">${(item.quantity * item.customPrice).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-black text-white p-8 rounded-3xl flex justify-between items-center">
                        <span className="font-bold text-xs uppercase tracking-widest">Total a Pagar</span>
                        <span className="text-4xl font-black">${order.totalPrice.toFixed(2)}</span>
                    </div>

                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase mt-12 tracking-[0.4em]">S&G CREACIONES • GESTIÓN</p>
                </div>
            </div>

            {/* EL BOTÓN QUE VÉS EN LA PANTALLA */}
            <button 
                onClick={exportImage}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#f13d4b] transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                {loading ? "Generando..." : "Descargar Presupuesto PNG"}
            </button>
        </div>
    )
}