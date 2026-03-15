"use client"
import { useState, useEffect } from "react"
import { Check, X, Calendar, Paintbrush, ImageIcon } from "lucide-react"
import { confirmOrder } from "@/app/(private)/dashboard/pedidos/actions"
import Portal from "./Portal"

export function ConfirmOrderModal({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="w-full py-3 bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Check size={14}/> Confirmar Pedido (Resta Stock)
        </button>
    )

    return (
        <Portal>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" onClick={() => setIsOpen(false)} />
                <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl space-y-6 relative z-10 border border-zinc-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-black">Finalizar Presupuesto</h3>
                        <button onClick={() => setIsOpen(false)} className="p-2 bg-zinc-100 rounded-full text-zinc-600"><X size={20}/></button>
                    </div>

                    <form action={async (formData) => {
                        await confirmOrder(orderId, formData);
                        setIsOpen(false);
                    }} encType="multipart/form-data" className="space-y-6 text-left">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 italic">Fecha Entrega (Obligatorio)</label>
                            <input name="deliveryDate" type="date" required className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-black border-2 border-green-100 focus:border-green-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Instrucciones finales</label>
                            <textarea name="designDetails" placeholder="Detalles de grabado, tipografía, etc..." className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm font-medium h-24 border-none resize-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Subir Diseños Finales</label>
                            <input name="files" type="file" multiple accept="image/*" className="w-full p-4 bg-zinc-100 rounded-2xl text-[10px] file:bg-black file:text-white file:border-0 file:rounded-full file:px-3" />
                        </div>
                        <button type="submit" className="w-full p-5 bg-green-500 text-white rounded-[25px] font-black uppercase text-xs shadow-xl shadow-green-200 active:scale-95 transition-all">
                            Confirmar y Descontar Stock
                        </button>
                    </form>
                </div>
            </div>
        </Portal>
    )
}