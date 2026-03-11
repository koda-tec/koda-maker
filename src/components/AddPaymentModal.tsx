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

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

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
           BACKDROP (Fondo): 
           - fixed inset-0: Cubre TODA la pantalla sin importar si es mobile o desktop.
           - z-[9999]: Un número exagerado para romper cualquier contexto de apilamiento.
           - bg-zinc-950/95: Casi opaco para que no se vea nada de fondo.
        */
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <div 
                className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" 
                onClick={() => setIsOpen(false)} 
            />
            
            {/* CONTENEDOR: bg-white SÓLIDO (sin opacidad) */}
            <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative z-10000 border border-zinc-200 overflow-y-auto max-h-[90vh]">
                
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                    <h3 className="font-black uppercase text-xs tracking-widest text-zinc-800 italic underline decoration-[#f13d4b] decoration-2">Nuevo Cobro</h3>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-zinc-100 rounded-full text-zinc-600 hover:bg-zinc-200"><X size={20} /></button>
                </div>

                <div className="text-center bg-zinc-50 p-6 rounded-[30px] border border-zinc-100 shadow-inner">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                    <p className="text-4xl font-black text-black tracking-tighter italic tabular-nums">${remaining.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                </div>

                <form action={async (formData) => {
                    startTransition(async () => {
                        await addPayment(orderId, formData)
                        toast.success("Pago registrado")
                        setIsOpen(false)
                    })
                }} className="space-y-5 text-left">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Monto a recibir</label>
                        <input name="amount" type="number" step="0.01" max={remaining} placeholder="0.00" required autoFocus className="w-full p-5 bg-zinc-100 rounded-2xl outline-none font-black text-center text-3xl focus:ring-2 focus:ring-green-500 text-black border-none" />
                    </div>
                    <button type="submit" disabled={isPending} className={`w-full p-5 rounded-[25px] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 ${isPending ? 'bg-zinc-300' : 'bg-green-500 text-white shadow-green-200 active:scale-95'}`}>
                        {isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                        Confirmar Pago
                    </button>
                </form>

                <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-[0.3em] pt-2">
                    Koda Maker System • Gestión de Caja
                </p>
            </div>
        </div>
    )
}