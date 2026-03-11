"use client"
import { useState, useEffect } from "react"
import { X, Save, Trash2 } from "lucide-react"
import { updateOrder, deleteOrderImage } from "@/app/(private)/dashboard/pedidos/actions"

export function EditOrderModal({ order }: { order: any }) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="text-[10px] font-black text-gray-400 uppercase hover:text-black transition-all">Editar Pedido</button>
    )

    return (
        /* El bottom-20 asegura que el modal termine antes que el Navbar */
        <div className="fixed top-0 left-0 right-0 bottom-20 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            {/* max-h-[85vh] para que el modal no sea tan alto y bg-white sólido para evitar transparencias */}
            <div className="bg-white w-full max-w-2xl rounded-[40px] p-6 md:p-10 shadow-2xl flex flex-col max-h-full border border-zinc-200">
                
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-6">
                    <h3 className="font-black uppercase text-xl text-black">Editar Pedido</h3>
                    <button onClick={() => setIsOpen(false)} className="p-3 bg-zinc-100 rounded-full"><X size={20}/></button>
                </div>

                {/* Contenedor del Formulario con SCROLL INTERNO */}
                <form action={async (formData) => { await updateOrder(order.id, formData); setIsOpen(false); }} encType="multipart/form-data" className="flex-1 overflow-y-auto pr-2 space-y-8 no-scrollbar text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Cliente</label>
                                <input name="customerName" defaultValue={order.customerName} className="w-full p-4 bg-zinc-100 rounded-2xl outline-none font-bold text-black border-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">WhatsApp</label>
                                <input name="customerPhone" defaultValue={order.customerPhone} className="w-full p-4 bg-zinc-100 rounded-2xl outline-none font-bold text-black border-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Instrucciones</label>
                                <textarea name="designDetails" defaultValue={order.designDetails} className="w-full p-4 bg-zinc-100 rounded-2xl outline-none text-sm h-32 text-black border-none resize-none" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Fecha Entrega</label>
                                <input name="deliveryDate" type="date" defaultValue={order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : ''} className="w-full p-4 bg-zinc-100 rounded-2xl font-bold text-black border-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Estado</label>
                                <select name="status" defaultValue={order.status} className="w-full p-4 bg-zinc-100 rounded-2xl font-black text-black border-none">
                                    <option value="PRESUPUESTADO">PRESUPUESTADO</option>
                                    <option value="CONFIRMADO">CONFIRMADO</option>
                                    <option value="ENTREGADO">ENTREGADO</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 italic">Añadir más fotos</label>
                                <input name="files" type="file" multiple className="w-full p-3 bg-zinc-100 rounded-2xl text-[10px] file:bg-black file:text-white file:border-0 file:rounded-full file:px-3" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-6">
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">Fotos (Toca para borrar)</p>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {order.images.map((img: any) => (
                                <div key={img.id} className="relative flex-none w-24 h-24 rounded-2xl overflow-hidden group border-2 border-zinc-100">
                                    <img src={img.url} className="w-full h-full object-cover" alt="Diseño" />
                                    <button type="button" onClick={() => deleteOrderImage(img.id, img.url)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Botón Guardar siempre visible al pie del modal */}
                <div className="pt-6 border-t border-zinc-100">
                    <button type="submit" onClick={(e) => {
                        const form = e.currentTarget.closest('div')?.parentElement?.querySelector('form');
                        if (form) form.requestSubmit();
                    }} className="w-full p-5 bg-black text-white rounded-[25px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                        <Save size={18}/> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    )
}