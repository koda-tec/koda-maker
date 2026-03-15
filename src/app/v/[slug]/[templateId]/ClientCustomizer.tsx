"use client"
import { useState } from "react"
import { ArrowLeft, Upload, Truck, MapPin, Globe, Loader2, Send, Calendar } from "lucide-react"
import { submitOrderRequest } from "../actions"

export function ClientCustomizer({ storeUser, template, slug }: { storeUser: any, template: any, slug: string }) {
    const [loading, setLoading] = useState(false)
    
    // 1. Estados para la Calculadora y Datos
    const [quantity, setQuantity] = useState(1)
    const [deliveryMethod, setDeliveryMethod] = useState("PICKUP")
    
    // 2. Estado para la Galería de Imágenes
    const [activeImage, setActiveImage] = useState(template.images[0]?.url || template.publicImage)

    // 3. Cálculos Dinámicos
    const shippingCost = deliveryMethod === "LOCAL" ? storeUser.localShippingCost : 0
    const totalToPay = (template.basePrice * quantity) + shippingCost

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await submitOrderRequest(formData, storeUser.id, template.id)
            if (result.success) {
                window.location.href = `/v/${slug}/exito?order=${result.orderId}`
            }
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            
            {/* COLUMNA IZQUIERDA: GALERÍA */}
            <div className="space-y-6">
                <div className="w-full aspect-square rounded-[50px] overflow-hidden bg-zinc-100 shadow-sm border border-zinc-100">
                    {activeImage ? (
                        <img src={activeImage} className="w-full h-full object-cover transition-all duration-500" alt={template.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black uppercase text-xs tracking-widest">
                            Sin imagen
                        </div>
                    )}
                </div>

                {/* Miniaturas */}
                {template.images && template.images.length > 1 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2 italic">Galería de fotos</p>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {template.images.map((img: any) => (
                                <button 
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImage(img.url)}
                                    className={`flex-none w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all ${activeImage === img.url ? 'border-accent scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img.url} className="w-full h-full object-cover" alt="Miniatura" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-4 space-y-4 pt-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-black">{template.name}</h1>
                    <p className="text-zinc-500 font-medium leading-relaxed italic">
                        {template.publicDescription}
                    </p>
                </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO */}
            <section className="bg-white p-8 md:p-12 rounded-[60px] shadow-2xl border border-zinc-100 relative overflow-hidden">
                <form action={handleSubmit} encType="multipart/form-data" className="space-y-10 relative z-10">
                    
                    {/* PASO 1: DATOS */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent italic">1. Información de Contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="customerName" placeholder="Tu Nombre Completo" className="w-full p-5 bg-zinc-50 rounded-[25px] border-none outline-none focus:ring-2 focus:ring-accent font-bold" required />
                            <input name="customerPhone" placeholder="Tu WhatsApp (Ej: 1122334455)" className="w-full p-5 bg-zinc-50 rounded-[25px] border-none outline-none focus:ring-2 focus:ring-accent font-bold" required />
                        </div>
                    </div>

                    {/* PASO 2: EL PEDIDO */}
                    <div className="space-y-6">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent italic">2. Detalles del Pedido</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Input numérico de cantidad */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest italic">¿Cuántas unidades?</label>
                                <input 
                                    name="quantity" 
                                    type="number" 
                                    min="1" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full p-5 bg-zinc-50 rounded-[25px] font-black text-2xl outline-none focus:ring-2 focus:ring-accent transition-all text-black" 
                                    required 
                                />
                            </div>

                            {/* Fecha de entrega deseada */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest italic">¿Para cuándo lo necesitás?</label>
                                <div className="relative">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={18} />
                                    <input 
                                        name="deliveryDate" 
                                        type="date" 
                                        required 
                                        className="w-full p-5 pl-14 bg-zinc-50 rounded-[25px] font-black text-sm outline-none focus:ring-2 focus:ring-accent text-black" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 rounded-[40px] space-y-4 border border-zinc-100 shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Upload size={16} className="text-accent" /></div>
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Subí tu logo o imagen de referencia</label>
                            </div>
                            <input name="files" type="file" multiple accept="image/*" className="w-full text-xs file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-black file:text-white file:font-black cursor-pointer file:uppercase file:tracking-widest" />
                            <textarea name="designDetails" placeholder="Contanos los detalles del diseño (Ej: Nombre, colores, tipografía...)" className="w-full p-5 bg-white rounded-[25px] border-none outline-none text-sm font-bold h-28 resize-none shadow-sm focus:ring-2 focus:ring-accent" required />
                        </div>
                    </div>

                    {/* PASO 3: ENVÍO */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent italic">3. Método de Entrega</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <ShippingOption 
                                id="PICKUP" icon={<MapPin/>} label="Retiro por Taller" desc="Sin costo adicional" 
                                isSelected={deliveryMethod === "PICKUP"} onClick={() => setDeliveryMethod("PICKUP")} 
                            />
                            {storeUser.localShippingCost > 0 && (
                                <ShippingOption 
                                    id="LOCAL" icon={<Truck/>} label="Envío Local" desc={`Costo fijo: $${storeUser.localShippingCost.toLocaleString('es-AR')}`} 
                                    isSelected={deliveryMethod === "LOCAL"} onClick={() => setDeliveryMethod("LOCAL")} 
                                />
                            )}
                            <ShippingOption 
                                id="NATIONWIDE" icon={<Globe/>} label="Envío Nacional" desc="A convenir por WhatsApp" 
                                isSelected={deliveryMethod === "NATIONWIDE"} onClick={() => setDeliveryMethod("NATIONWIDE")} 
                            />
                        </div>
                    </div>

                    {/* CALCULADORA FINAL */}
                    <div className="pt-8 border-t border-zinc-100 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400 px-2">
                                <span>Subtotal ({quantity} un.)</span>
                                <span>${(template.basePrice * quantity).toLocaleString('es-AR')}</span>
                            </div>
                            {shippingCost > 0 && (
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-accent px-2">
                                    <span>Costo de Envío</span>
                                    <span>${shippingCost.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-4 px-2">
                                <span className="text-[14px] font-black uppercase tracking-widest text-black underline decoration-accent decoration-4 underline-offset-8">Total Estimado</span>
                                <span className="text-5xl font-black tracking-tighter text-black leading-none">
                                    ${totalToPay.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full p-6 bg-black text-white rounded-[30px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-accent transition-all active:scale-95 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {loading ? "PROCESANDO..." : "Enviar Solicitud de Pedido"}
                        </button>
                    </div>
                </form>
                
                {/* Decoración de fondo */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-[120px] opacity-10 pointer-events-none" />
            </section>
        </div>
    )
}

function ShippingOption({ id, icon, label, desc, isSelected, onClick }: any) {
    return (
        <label onClick={onClick} className={`flex items-center justify-between p-5 rounded-[30px] border-2 transition-all cursor-pointer group ${isSelected ? 'border-accent bg-red-50/30' : 'border-zinc-100 bg-zinc-50 hover:bg-white hover:border-zinc-200'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isSelected ? 'bg-accent text-white shadow-red-200' : 'bg-white text-zinc-400'}`}>{icon}</div>
                <div>
                    <p className={`text-sm font-black uppercase tracking-tight leading-none ${isSelected ? 'text-black' : 'text-zinc-600'}`}>{label}</p>
                    <p className="text-[9px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest">{desc}</p>
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-accent bg-accent' : 'border-zinc-300'}`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <input type="radio" name="deliveryMethod" value={id} className="hidden" />
        </label>
    )
}