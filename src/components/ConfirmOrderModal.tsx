"use client"
import { useState } from "react"
import { Check, X } from "lucide-react"
import { confirmOrder } from "@/app/(private)/dashboard/pedidos/actions"

export function ConfirmOrderModal({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="w-full py-3 bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2">
            <Check size={14}/> Confirmar Pedido (Resta Stock)
        </button>
    )

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase text-sm tracking-widest">Finalizar Presupuesto</h3>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={18}/></button>
                </div>
                <form action={async (formData) => { await confirmOrder(orderId, formData); setIsOpen(false); }} encType="multipart/form-data" className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2 italic">Fecha Entrega (Obligatorio)</label>
                        <input name="deliveryDate" type="date" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold border-2 border-green-100" />
                    </div>
                    <textarea name="designDetails" placeholder="Instrucciones finales..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm h-24" />
                    <input name="files" type="file" multiple accept="image/*" className="w-full p-4 bg-gray-50 rounded-2xl text-[10px]" />
                    <button type="submit" className="w-full p-5 bg-green-500 text-white rounded-3xl font-black uppercase text-xs">Confirmar y Descontar Stock</button>
                </form>
            </div>
        </div>
    )
}