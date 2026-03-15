"use client"
import { useState, useTransition, useEffect } from "react"
import { Scissors, X, Check, Loader2, Info } from "lucide-react"
import { adjustStock } from "@/app/(private)/dashboard/stock/actions"
import { toast } from "sonner"
import Portal from "./Portal"

export function AdjustStockModal({ material }: { material: any }) {
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
            className="p-2 text-zinc-300 hover:text-accent transition-colors"
            title="Uso interno / Ajuste"
        >
            <Scissors size={18} />
        </button>
    )

    return (
        <Portal>
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" onClick={() => setIsOpen(false)} />
                
                <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 relative z-10 border border-zinc-200 animate-in zoom-in-95">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-zinc-500 italic">Uso Interno</h3>
                        <button onClick={() => setIsOpen(false)} className="p-2 bg-zinc-100 rounded-full text-zinc-600"><X size={20} /></button>
                    </div>

                    <div className="bg-zinc-50 p-6 rounded-[30px] border border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Insumo a descontar</p>
                        <p className="text-xl font-black text-black uppercase tracking-tighter">{material.name}</p>
                        <p className="text-[10px] font-bold text-accent uppercase mt-1">Stock actual: {material.stock} {material.unit}</p>
                    </div>

                    <form action={async (formData) => {
                        startTransition(async () => {
                            await adjustStock(formData)
                            toast.success("Stock actualizado")
                            setIsOpen(false)
                        })
                    }} className="space-y-4 text-left">
                        <input type="hidden" name="materialId" value={material.id} />
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Cantidad a restar</label>
                            <input name="quantity" type="number" step="0.01" placeholder="0.00" required autoFocus className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-black text-center text-2xl focus:ring-2 focus:ring-accent text-black border-none" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Motivo / Destino</label>
                            <textarea name="reason" placeholder="Ej: Prueba de grabado, Regalo, Error de corte..." required className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm font-medium h-20 border-none resize-none" />
                        </div>

                        <button type="submit" disabled={isPending} className="w-full p-5 bg-black text-white rounded-[25px] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                            Confirmar Descuento
                        </button>
                    </form>

                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <Info size={14} />
                        <p className="text-[9px] font-bold uppercase leading-tight">Esto no genera una venta, solo ajusta el inventario físico.</p>
                    </div>
                </div>
            </div>
        </Portal>
    )
}