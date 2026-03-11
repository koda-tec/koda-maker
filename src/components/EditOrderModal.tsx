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
        <div className="fixed inset-0 z-100">
            {/* FONDO OSCURO CASI TOTAL: Bloquea visualmente las tarjetas de fondo */}
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" onClick={() => setIsOpen(false)} />

            {/* CONTENEDOR: Se detiene en bottom-20 (antes del Navbar) */}
            <div className="absolute top-0 left-0 right-0 bottom-20 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl flex flex-col max-h-full border border-zinc-200 pointer-events-auto overflow-hidden animate-in slide-in-from-bottom duration-300">
                    
                    <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
                        <h3 className="font-black uppercase text-xl text-black tracking-tighter">Editar Pedido</h3>
                        <button onClick={() => setIsOpen(false)} className="p-3 bg-zinc-100 rounded-full text-zinc-600 hover:bg-zinc-200 transition-all"><X size={20}/></button>
                    </div>

                    {/* FORMULARIO CON SCROLL INTERNO PROPIO */}
                    <form 
                        action={async (formData) => { await updateOrder(order.id, formData); setIsOpen(false); }} 
                        encType="multipart/form-data" 
                        className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar text-left bg-white"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Cliente</label>
                                    <input name="customerName" defaultValue={order.customerName} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-black border border-zinc-100 focus:ring-2 focus:ring-[#f13d4b]" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">WhatsApp</label>
                                    <input name="customerPhone" defaultValue={order.customerPhone} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-black border border-zinc-100 focus:ring-2 focus:ring-[#f13d4b]" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Instrucciones</label>
                                    <textarea name="designDetails" defaultValue={order.designDetails} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm h-32 text-black border border-zinc-100 resize-none focus:ring-2 focus:ring-[#f13d4b]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Fecha Entrega</label>
                                    <input name="deliveryDate" type="date" defaultValue={order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : ''} className="w-full p-4 bg-zinc-50 rounded-2xl font-bold text-black border border-zinc-100" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Estado</label>
                                    <select name="status" defaultValue={order.status} className="w-full p-4 bg-zinc-50 rounded-2xl font-black text-black border border-zinc-100">
                                        <option value="PRESUPUESTADO">PRESUPUESTADO</option>
                                        <option value="CONFIRMADO">CONFIRMADO</option>
                                        <option value="ENTREGADO">ENTREGADO</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 italic">Añadir más fotos</label>
                                    <input name="files" type="file" multiple className="w-full p-3 bg-zinc-50 rounded-2xl text-[10px] file:bg-black file:text-white file:border-0 file:rounded-full file:px-3" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-6">
                            <p className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest italic underline decoration-[#f13d4b]">Fotos cargadas (Click para borrar)</p>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {order.images.map((img: any) => (
                                    <div key={img.id} className="relative flex-none w-28 h-28 rounded-3xl overflow-hidden group border-2 border-zinc-100">
                                        <img src={img.url} className="w-full h-full object-cover" alt="Diseño" />
                                        <button type="button" onClick={() => deleteOrderImage(img.id, img.url)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={24}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pb-10 pt-4">
                            <button type="submit" className="w-full p-6 bg-black text-white rounded-[30px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-[#f13d4b] active:scale-95 transition-all">
                                <Save size={20}/> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}