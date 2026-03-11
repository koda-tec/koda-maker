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
        /* z-[9999] para romper cualquier interferencia de las tarjetas de fondo */
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" onClick={() => setIsOpen(false)} />

            {/* Modal con fondo blanco sólido y scroll interno */}
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col relative z-10000 border border-zinc-200 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden">
                
                {/* Header fijo */}
                <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white">
                    <h3 className="font-black uppercase text-xl text-black tracking-tighter">Configuración de Pedido</h3>
                    <button onClick={() => setIsOpen(false)} className="p-3 bg-zinc-100 rounded-full text-zinc-600 hover:bg-zinc-200 transition-all"><X size={24}/></button>
                </div>

                {/* Formulario con Scroll Interno */}
                <form 
                    action={async (formData) => { await updateOrder(order.id, formData); setIsOpen(false); }} 
                    encType="multipart/form-data" 
                    className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar text-left"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Nombre del Cliente</label>
                                <input name="customerName" defaultValue={order.customerName} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-black border border-zinc-100 focus:ring-2 focus:ring-[#f13d4b]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">WhatsApp</label>
                                <input name="customerPhone" defaultValue={order.customerPhone} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-black border border-zinc-100 focus:ring-2 focus:ring-[#f13d4b]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Instrucciones de Grabado</label>
                                <textarea name="designDetails" defaultValue={order.designDetails} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm h-40 text-black border border-zinc-100 resize-none focus:ring-2 focus:ring-[#f13d4b]" />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Fecha Estimada de Entrega</label>
                                <input name="deliveryDate" type="date" defaultValue={order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : ''} className="w-full p-4 bg-zinc-100 rounded-2xl font-bold text-black border-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Estado de Producción</label>
                                <select name="status" defaultValue={order.status} className="w-full p-4 bg-zinc-100 rounded-2xl font-black text-black border-none">
                                    <option value="PRESUPUESTADO">PRESUPUESTADO</option>
                                    <option value="CONFIRMADO">CONFIRMADO</option>
                                    <option value="ENTREGADO">ENTREGADO</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-[#f13d4b] ml-2 italic">Subir Fotos Adicionales</label>
                                <input name="files" type="file" multiple className="w-full p-4 bg-red-50 rounded-2xl text-[10px] file:bg-black file:text-white file:border-0 file:rounded-full file:px-3" />
                            </div>
                        </div>
                    </div>

                    {/* Galería interna */}
                    <div className="border-t border-zinc-100 pt-8">
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest italic underline decoration-[#f13d4b]">Fotos actuales del pedido (Click para borrar)</p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                            {order.images.map((img: any) => (
                                <div key={img.id} className="relative aspect-square rounded-3xl overflow-hidden group border-2 border-zinc-100 shadow-sm">
                                    <img src={img.url} className="w-full h-full object-cover" alt="Diseño" />
                                    <button type="button" onClick={() => deleteOrderImage(img.id, img.url)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={24}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pb-6">
                        <button type="submit" className="w-full p-6 bg-black text-white rounded-[30px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-[#f13d4b] active:scale-95 transition-all">
                            <Save size={20}/> Guardar Cambios del Pedido
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}