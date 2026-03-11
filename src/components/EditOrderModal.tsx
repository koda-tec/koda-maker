"use client"
import { useState, useEffect } from "react"
import { X, Save, Trash2 } from "lucide-react"
import { updateOrder, deleteOrderImage } from "@/app/(private)/dashboard/pedidos/actions"

export function EditOrderModal({ order }: { order: any }) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="text-[10px] font-black text-gray-400 uppercase hover:text-black transition-all px-2 py-1">Editar Pedido</button>
    )

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[40px] p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-8 no-scrollbar">
                <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase text-xl text-black">Editar Pedido</h3>
                    <button onClick={() => setIsOpen(false)} className="p-3 bg-zinc-100 rounded-full text-zinc-500"><X size={20}/></button>
                </div>

                <form action={async (formData) => { await updateOrder(order.id, formData); setIsOpen(false); }} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Cliente</label>
                            <input name="customerName" defaultValue={order.customerName} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-black border border-zinc-100" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">WhatsApp</label>
                            <input name="customerPhone" defaultValue={order.customerPhone} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-black border border-zinc-100" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Instrucciones</label>
                            <textarea name="designDetails" defaultValue={order.designDetails} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm h-32 text-black border border-zinc-100" />
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
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Subir más fotos</label>
                            <input name="files" type="file" multiple className="w-full p-3 bg-zinc-50 rounded-2xl text-[10px] file:bg-black file:text-white file:border-0 file:rounded-full file:px-3 file:mr-2" />
                        </div>
                    </div>

                    <div className="md:col-span-2 border-t border-zinc-100 pt-6">
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">Fotos cargadas (Click para borrar)</p>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {order.images.map((img: any) => (
                                <div key={img.id} className="relative flex-none w-24 h-24 rounded-2xl overflow-hidden group border-2 border-zinc-100">
                                    <img src={img.url} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => deleteOrderImage(img.id, img.url)} className="absolute inset-0 bg-red-500/90 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="md:col-span-2 p-5 bg-black text-white rounded-[25px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 hover:bg-[#f13d4b] active:scale-95 transition-all">
                        <Save size={18}/> Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    )
}