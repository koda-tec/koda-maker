"use client"
import { useState, useTransition } from "react"
import { DollarSign, X, Check, Loader2 } from "lucide-react"
import { addPayment } from "@/app/(private)/dashboard/pedidos/actions"
import { toast } from "sonner"

interface AddPaymentModalProps {
    orderId: string
    remaining: number
}

export function AddPaymentModal({ orderId, remaining }: AddPaymentModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Función para manejar el envío del formulario con transición inmediata
    const handleSubmit = async (formData: FormData) => {
        const amount = formData.get("amount")
        
        if (!amount || parseFloat(amount as string) <= 0) {
            toast.error("Monto inválido", { description: "Ingresa un valor mayor a 0." })
            return
        }

        // startTransition hace que la UI responda al instante
        startTransition(async () => {
            try {
                await addPayment(orderId, formData)
                toast.success("Pago registrado", { 
                    description: `Se sumaron $${parseFloat(amount as string).toLocaleString()} al pedido.` 
                })
                setIsOpen(false)
            } catch (error) {
                toast.error("Error al registrar", { description: "No se pudo guardar el pago." })
            }
        })
    }

    if (!isOpen) return (
        <button 
            onClick={() => setIsOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase hover:bg-green-100 transition-all border border-green-200 active:scale-95"
        >
            <DollarSign size={12} strokeWidth={3} /> Registrar Pago
        </button>
    )

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-110 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                
                {/* HEADER DEL MODAL */}
                <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase text-xs tracking-[0.2em] text-zinc-500">Nuevo Cobro</h3>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
                    >
                        <X size={18} className="text-zinc-500" />
                    </button>
                </div>

                {/* INFO DE SALDO (ALTO CONTRASTE) */}
                <div className="text-center bg-zinc-50 p-6 rounded-[30px] border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                    <p className="text-4xl font-black text-black tracking-tighter italic">
                        ${remaining.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* FORMULARIO */}
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Monto a Entregar</label>
                        <input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            max={remaining}
                            placeholder="0.00" 
                            required
                            autoFocus
                            className="w-full p-5 bg-zinc-50 rounded-2xl outline-none font-black text-center text-2xl border-2 border-transparent focus:border-green-500 transition-all text-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Método</label>
                        <select 
                            name="method" 
                            className="w-full p-4 bg-zinc-50 rounded-2xl text-[11px] font-black uppercase border-none outline-none cursor-pointer text-zinc-800"
                        >
                            <option value="EFECTIVO">💵 Efectivo</option>
                            <option value="TRANSFERENCIA">🏦 Transferencia</option>
                            <option value="MERCADO PAGO">💳 Mercado Pago</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isPending}
                        className={`w-full p-5 rounded-[25px] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                            isPending 
                            ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
                            : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-green-200'
                        }`}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Check size={18} strokeWidth={3} />
                                Confirmar Pago
                            </>
                        )}
                    </button>
                </form>

                <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-widest">
                    Koda Maker System • Gestión de Caja
                </p>
            </div>
        </div>
    )
}