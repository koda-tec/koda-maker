"use client"
import { useState, useTransition, useEffect } from "react"
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

    // Bloquea el scroll del fondo cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    const handleSubmit = async (formData: FormData) => {
        const amount = formData.get("amount")
        
        if (!amount || parseFloat(amount as string) <= 0) {
            toast.error("Monto inválido")
            return
        }

        startTransition(async () => {
            try {
                await addPayment(orderId, formData)
                toast.success("Pago registrado con éxito")
                setIsOpen(false)
            } catch (error) {
                toast.error("Error al registrar el pago")
            }
        })
    }

    if (!isOpen) return (
        <button 
            onClick={() => setIsOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase hover:bg-green-100 transition-all border border-green-200 active:scale-95 shadow-sm"
        >
            <DollarSign size={12} strokeWidth={3} /> Registrar Pago
        </button>
    )

    return (
        /* 
           FONDO (Backdrop): 
           - fixed inset-x-0 top-0: Cubre desde arriba hasta los lados.
           - bottom-20: Deja libre el espacio del Navbar (80px).
           - z-[80]: Suficiente para estar arriba de las tarjetas (z-0) pero debajo del Nav (z-100).
        */
        <div className="fixed inset-x-0 top-0 bottom-20 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4 overflow-hidden">
            
            {/* 
                CONTENEDOR DEL MODAL:
                - bg-white (SÓLIDO): Evita que se vea el fondo.
                - overflow-y-auto: Permite scroll si el contenido es largo.
            */}
            <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] space-y-6 animate-in zoom-in-95 duration-200 max-h-full overflow-y-auto border border-zinc-200 relative">
                
                {/* BOTÓN CERRAR */}
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                    <h3 className="font-black uppercase text-xs tracking-widest text-zinc-500 italic underline decoration-[#f13d4b] decoration-2">Nuevo Cobro</h3>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* INFO DE SALDO */}
                <div className="text-center bg-zinc-50 p-6 rounded-[30px] border border-zinc-100 shadow-inner">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                    <p className="text-4xl font-black text-black tracking-tighter italic tabular-nums">
                        ${remaining.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* FORMULARIO */}
                <form action={handleSubmit} className="space-y-5 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Monto a Entregar</label>
                        <input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            max={remaining}
                            placeholder="0.00" 
                            required
                            autoFocus
                            className="w-full p-5 bg-zinc-50 rounded-2xl outline-none font-black text-center text-3xl border-2 border-transparent focus:border-green-500 transition-all text-black shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Método</label>
                        <select 
                            name="method" 
                            className="w-full p-4 bg-zinc-50 rounded-2xl text-[11px] font-black uppercase border-none outline-none cursor-pointer text-zinc-800 shadow-sm appearance-none"
                        >
                            <option value="EFECTIVO">💵 Efectivo</option>
                            <option value="TRANSFERENCIA">🏦 Transferencia</option>
                            <option value="MERCADO PAGO">💳 Mercado Pago</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isPending}
                            className={`w-full p-5 rounded-[25px] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                                isPending 
                                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
                                : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-green-100'
                            }`}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    PROCESANDO...
                                </>
                            ) : (
                                <>
                                    <Check size={18} strokeWidth={3} />
                                    CONFIRMAR PAGO
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-[0.3em] pt-2">
                    Koda Maker System • Gestión de Caja
                </p>
            </div>
        </div>
    )
}