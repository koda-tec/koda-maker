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

    // EFECTO: Bloquea el scroll de la página de fondo cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        // Limpieza por si el componente se desmonta inesperadamente
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    const handleSubmit = async (formData: FormData) => {
        const amount = formData.get("amount")
        
        if (!amount || parseFloat(amount as string) <= 0) {
            toast.error("Monto inválido", { description: "Ingresá un valor mayor a 0." })
            return
        }

        // startTransition permite que la UI responda instantáneamente
        startTransition(async () => {
            try {
                await addPayment(orderId, formData)
                toast.success("Pago registrado", { 
                    description: `Se sumaron $${parseFloat(amount as string).toLocaleString()} al pedido.` 
                })
                setIsOpen(false)
            } catch (error) {
                toast.error("Error al registrar", { description: "No se pudo conectar con el servidor." })
            }
        })
    }

    // BOTÓN QUE SE VE EN LA TARJETA DEL PEDIDO
    if (!isOpen) return (
        <button 
            onClick={() => setIsOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase hover:bg-green-100 transition-all border border-green-200 active:scale-95 shadow-sm"
        >
            <DollarSign size={12} strokeWidth={3} /> Registrar Pago
        </button>
    )

    return (
        /* FONDO OSCURO: z-[999] para que esté arriba de la navegación. bg-black/95 para cero transparencia */
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-999 flex items-center justify-center p-4 overflow-hidden">
            
            {/* CONTENEDOR BLANCO DEL MODAL: max-h-[90vh] para que no se salga de la pantalla en móviles chicos */}
            <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-zinc-200">
                
                {/* CABECERA */}
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                    <h3 className="font-black uppercase text-xs tracking-widest text-zinc-500 italic underline decoration-[#f13d4b] decoration-2">Nuevo Cobro</h3>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* VISUALIZACIÓN DE SALDO ACTUAL */}
                <div className="text-center bg-zinc-50 p-6 rounded-[30px] border border-zinc-100 shadow-inner">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Saldo pendiente por cobrar</p>
                    <p className="text-4xl font-black text-black tracking-tighter italic tabular-nums">
                        ${remaining.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* FORMULARIO DE PAGO */}
                <form action={handleSubmit} className="space-y-5 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Monto a Entregar ($)</label>
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
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Método utilizado</label>
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
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Check size={18} strokeWidth={3} />
                                    Confirmar Pago
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