"use client"
import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface OrderTicketProps {
    order: any
    businessName: string
    logoUrl?: string | null
}

export function OrderTicket({ order, businessName, logoUrl }: OrderTicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)

    const exportImage = async () => {
        if (ticketRef.current === null) return
        setLoading(true)
        
        try {
            // Damos un pequeño respiro para que el navegador renderice bien las imágenes externas
            await new Promise(resolve => setTimeout(resolve, 600))
            
            const dataUrl = await toPng(ticketRef.current, { 
                cacheBust: true, 
                pixelRatio: 3, // Alta calidad
                backgroundColor: '#ffffff',
            })
            
            const link = document.createElement('a')
            link.download = `Presupuesto-${order.customerName}.png`
            link.href = dataUrl
            link.click()
            toast.success("Imagen generada correctamente")
        } catch (err) {
            toast.error("Error al generar imagen")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {/* ÁREA DE CAPTURA (OCULTA TOTALMENTE) */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', pointerEvents: 'none' }}>
                <div 
                    ref={ticketRef} 
                    className="w-125 bg-white p-12 text-black font-sans border-16 border-black"
                >
                    {/* CABECERA CON LOGO DINÁMICO */}
                    <div className="text-center mb-10 pb-8 border-b-2 border-dashed border-gray-200 flex flex-col items-center">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt="Logo" 
                                className="w-24 h-24 object-contain mb-4 rounded-xl"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4">
                                <span className="text-white font-black text-2xl">K</span>
                            </div>
                        )}
                        <h2 className="text-4xl font-black uppercase tracking-tighter">{businessName}</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">Presupuesto Digital</p>
                    </div>

                    {/* DATOS DEL CLIENTE */}
                    <div className="flex justify-between text-sm mb-10 font-black uppercase italic">
                        <span>Cliente: {order.customerName}</span>
                        <span>{new Date().toLocaleDateString('es-AR')}</span>
                    </div>

                    {/* DETALLE DE PRODUCTOS */}
                    <div className="space-y-6 mb-12">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-end border-b border-gray-100 pb-4">
                                <div>
                                    <p className="font-black text-2xl uppercase leading-none">{item.template.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-2">
                                        {item.quantity} UNIDADES X ${item.customPrice.toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <span className="font-black text-2xl">
                                    ${(item.quantity * item.customPrice).toLocaleString('es-AR')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* TOTAL FINAL DESTACADO */}
                    <div className="bg-black text-white p-8 rounded-[30px] flex justify-between items-center shadow-xl">
                        <span className="font-bold text-xs uppercase tracking-widest text-zinc-400">Total a Pagar</span>
                        <span className="text-5xl font-black">${order.totalPrice.toLocaleString('es-AR')}</span>
                    </div>

                    {/* PIE DE TICKET */}
                    <div className="mt-12 pt-6 border-t border-zinc-100 flex items-center justify-center gap-2">
                        <img src="/icon-192x192.png" className="w-4 h-4 grayscale opacity-50" />
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">KODA MAKER SYSTEM</p>
                    </div>
                </div>
            </div>

            {/* BOTÓN VISIBLE EN LA APLICACIÓN */}
            <button 
                onClick={exportImage}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-accent transition-all disabled:opacity-50 active:scale-95"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={16} />
                        Procesando imagen...
                    </>
                ) : (
                    <>
                        <Download size={16} strokeWidth={3} />
                        Descargar Presupuesto PNG
                    </>
                )}
            </button>
        </div>
    )
}