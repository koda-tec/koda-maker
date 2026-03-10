"use client"
import { useState } from "react"
import { X, Save, Trash2, Calendar, Paintbrush, ImageIcon, Plus } from "lucide-react"
import { updateOrder, deleteOrderImage } from "@/app/(private)/dashboard/pedidos/actions"

export function EditOrderModal({ order }: { order: any }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="text-[10px] font-black text-gray-400 uppercase hover:text-black transition-all">Editar Pedido</button>
    )

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[40px] p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase text-xl">Editar Pedido</h3>
                    <button onClick={() => setIsOpen(false)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>

                <form action={async (formData) => { await updateOrder(order.id, formData); setIsOpen(false); }} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <input name="customerName" defaultValue={order.customerName} placeholder="Cliente" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                        <input name="customerPhone" defaultValue={order.customerPhone} placeholder="WhatsApp" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                        <textarea name="designDetails" defaultValue={order.designDetails} placeholder="Instrucciones..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm h-32" />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Fecha Entrega</label>
                            <input name="deliveryDate" type="date" defaultValue={order.deliveryDate?.toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estado</label>
                            <select name="status" defaultValue={order.status} className="w-full p-4 bg-gray-50 rounded-2xl font-black">
                                <option value="PRESUPUESTADO">PRESUPUESTADO</option>
                                <option value="CONFIRMADO">CONFIRMADO</option>
                                <option value="ENTREGADO">ENTREGADO</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Añadir más fotos</label>
                            <input name="files" type="file" multiple className="w-full p-3 bg-gray-50 rounded-2xl text-[10px]" />
                        </div>
                    </div>

                    <div className="md:col-span-2 border-t pt-6">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-4">Fotos actuales (toca para borrar)</p>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {order.images.map((img: any) => (
                                <div key={img.id} className="relative flex-none w-24 h-24 rounded-xl overflow-hidden group">
                                    <img src={img.url} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => deleteOrderImage(img.id, img.url)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="md:col-span-2 p-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-[#f13d4b]">
                        <Save size={18}/> Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    )
}