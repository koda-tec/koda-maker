"use client"
import { useState, useEffect } from "react"
import { X, Save, Trash2, MapPin, Truck, Globe } from "lucide-react"
import { updateOrder, deleteOrderImage } from "@/app/(private)/dashboard/pedidos/actions"
import Portal from "./Portal"

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
        <Portal>
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-10">
                <div className="absolute inset-0 bg-zinc-950/98 backdrop-blur-md" onClick={() => setIsOpen(false)} />

                <div className="bg-white w-full max-w-4xl rounded-[50px] shadow-2xl flex flex-col relative z-10 border border-zinc-200 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden">
                    <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white">
                        <h3 className="font-black uppercase text-xl text-black tracking-tighter italic underline decoration-accent decoration-4">Configurar Pedido</h3>
                        <button onClick={() => setIsOpen(false)} className="p-3 bg-zinc-100 rounded-full text-zinc-600 hover:bg-zinc-200"><X size={24}/></button>
                    </div>

                    <form 
                        action={async (formData) => { await updateOrder(order.id, formData); setIsOpen(false); }} 
                        encType="multipart/form-data" 
                        className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 no-scrollbar text-left bg-white"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* COLUMNA 1: CLIENTE Y DISEÑO */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Nombre Cliente</label>
                                    <input name="customerName" defaultValue={order.customerName} className="w-full p-5 bg-zinc-50 rounded-[25px] outline-none font-black text-black border border-zinc-100 focus:ring-2 focus:ring-accent" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">WhatsApp</label>
                                    <input name="customerPhone" defaultValue={order.customerPhone} className="w-full p-5 bg-zinc-50 rounded-[25px] outline-none font-black text-black border border-zinc-100 focus:ring-2 focus:ring-accent" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Instrucciones de Taller</label>
                                    <textarea name="designDetails" defaultValue={order.designDetails} className="w-full p-5 bg-zinc-50 rounded-[25px] outline-none text-sm font-bold h-40 text-black border border-zinc-100 resize-none" />
                                </div>
                            </div>

                            {/* COLUMNA 2: ESTADO Y LOGÍSTICA */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Fecha Entrega</label>
                                    <input name="deliveryDate" type="date" defaultValue={order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : ''} className="w-full p-5 bg-zinc-50 rounded-[25px] font-black text-black" />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Estado</label>
                                    <select name="status" defaultValue={order.status} className="w-full p-5 bg-zinc-50 rounded-[25px] font-black text-black border-none appearance-none">
                                        <option value="PRESUPUESTADO">PRESUPUESTADO</option>
                                        <option value="CONFIRMADO">CONFIRMADO</option>
                                        <option value="EN_PROCESO">EN PRODUCCIÓN</option>
                                        <option value="LISTO">LISTO PARA ENTREGA</option>
                                        <option value="ENTREGADO">ENTREGADO</option>
                                    </select>
                                </div>

                                {/* SECCIÓN DE LOGÍSTICA DENTRO DEL MODAL */}
                                <div className="space-y-4 p-6 bg-zinc-50 rounded-[35px] border border-zinc-100">
                                    <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Truck size={14} /> Método de Envío
                                    </p>
                                    <select name="deliveryMethod" defaultValue={order.deliveryMethod} className="w-full p-3 bg-white rounded-xl font-bold text-xs border-none outline-none shadow-sm">
                                        <option value="PICKUP">RETIRO POR TALLER</option>
                                        <option value="LOCAL">ENVÍO LOCAL</option>
                                        <option value="NATIONWIDE">ENVÍO NACIONAL (CORREO)</option>
                                    </select>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Dirección de Envío</label>
                                        <textarea 
                                            name="shippingAddress" 
                                            defaultValue={order.shippingAddress || ""} 
                                            placeholder="Calle, Número, Ciudad, CP..."
                                            className="w-full p-3 bg-white rounded-xl text-xs font-medium border-none outline-none focus:ring-1 focus:ring-accent resize-none h-20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 italic">Añadir más fotos</label>
                                    <input name="files" type="file" multiple className="w-full p-4 bg-red-50 rounded-[25px] text-[10px] file:bg-black file:text-white file:border-0 file:rounded-full file:px-3" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-8">
                            <p className="text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest italic">Galería de fotos (Click para borrar)</p>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                {order.images.map((img: any) => (
                                    <div key={img.id} className="relative aspect-square rounded-[30px] overflow-hidden group border-2 border-zinc-100 shadow-sm">
                                        <img src={img.url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => deleteOrderImage(img.id, img.url)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={24}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pb-10">
                            <button type="submit" className="w-full p-6 bg-black text-white rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-accent active:scale-95 transition-all">
                                <Save size={20}/> Guardar Cambios del Pedido
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    )
}