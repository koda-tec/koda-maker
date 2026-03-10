"use client"
import { useState } from "react"
import { DollarSign, X, Check } from "lucide-react"
import { addPayment } from "@/app/(private)/dashboard/pedidos/actions"
import { toast } from "sonner"

export function AddPaymentModal({ orderId, remaining }: { orderId: string, remaining: number }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!isOpen) return (
        <button 
            onClick={() => setIsOpen(true)} 
            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[9px] font-black uppercase hover:bg-green-100 transition-all border border-green-100"
        >
            <DollarSign size={10} /> Registrar Pago
        </button>
    )

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-110 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-[30px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">Nuevo Pago</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 bg-gray-100 rounded-full"><X size={14}/></button>
                </div>

                <div className="text-center py-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Saldo Pendiente</p>
                    <p className="text-2xl font-black text-black">${remaining.toFixed(2)}</p>
                </div>

                <form action={async (formData) => {
                    await addPayment(orderId, formData)
                    toast.success("Pago registrado con éxito")
                    setIsOpen(false)
                }} className="space-y-3">
                    <input 
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        max={remaining}
                        placeholder="Monto a pagar" 
                        required
                        autoFocus
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-black text-center text-xl border-2 border-green-100 focus:border-green-500 transition-all"
                    />
                    <select name="method" className="w-full p-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase border-none outline-none">
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="MERCADO PAGO">Mercado Pago</option>
                    </select>
                    <button type="submit" className="w-full p-4 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                        <Check size={14}/> Confirmar Pago
                    </button>
                </form>
            </div>
        </div>
    )
}