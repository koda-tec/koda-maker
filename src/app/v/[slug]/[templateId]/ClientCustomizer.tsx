"use client"
import { useState } from "react"
import { ArrowLeft, Upload, Truck, MapPin, Globe, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { submitOrderRequest } from "../actions"

export function ClientCustomizer({ storeUser, template, slug }: { storeUser: any, template: any, slug: string }) {
    const [loading, setLoading] = useState(false)
    
    // 1. Estados para la Calculadora en Vivo
    const[quantity, setQuantity] = useState(1)
    const [deliveryMethod, setDeliveryMethod] = useState("PICKUP")
    
    // 2. Estado para la Galería de Imágenes
    // Empezamos mostrando la primera imagen, o una imagen vacía si no hay
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
            
            {/* COLUMNA IZQUIERDA: GALERÍA INTUITIVA */}
            <div className="space-y-6">
                {/* Imagen Principal */}
                <div className="w-full aspect-square rounded-[50px] overflow-hidden bg-zinc-100 shadow-sm border border-zinc-100">
                    {activeImage ? (
                        <img src={activeImage} className="w-full h-full object-cover transition-all duration-500" alt={template.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black uppercase text-xs tracking-widest">
                            Sin imagen
                        </div>
                    )}
                </div>

                {/* Miniaturas (Thumbnails) - Solo se muestran si hay más de 1 foto */}
                {template.images && template.images.length > 1 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Galería de fotos</p>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {template.images.map((img: any) => (
                                <button 
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImage(img.url)}
                                    className={`flex-none w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all ${activeImage === img.url ? 'border-accent scale-105 shadow-md' : 'border-transparent hover:border-zinc-200 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img.url} className="w-full h-full object-cover" alt="Miniatura" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-4 space-y-4 pt-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{template.name}</h1>
                    <p className="text-zinc-500 font-medium leading-relaxed italic">
                        {template.publicDescription}
                    </p>
                </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO Y CALCULADORA */}
            <section className="bg-white p-8 md:p-12 rounded-[60px] shadow-2xl border border-zinc-100 relative overflow-hidden">
                <form action={handleSubmit} encType="multipart/form-data" className="space-y-10 relative z-10">
                    
                    {/* PASO 1: DATOS */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent">1. Tus Datos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="customerName" placeholder="Tu Nombre y Apellido" className="w-full p-5 bg-zinc-50 rounded-[25px] border-none outline-none focus:ring-2 focus:ring-accent font-bold" required />
                            <input name="customerPhone" placeholder="Tu WhatsApp (Sin 0 ni 15)" className="w-full p-5 bg-zinc-50 rounded-[25px] border-none outline-none focus:ring-2 focus:ring-accent font-bold" required />
                        </div>
                    </div>

                    {/* PASO 2: PERSONALIZACIÓN Y CANTIDAD */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent flex justify-between items-end">
                            2. El Pedido
                            <span className="text-[10px] text-zinc-400">Precio Unitario: ${template.basePrice.toLocaleString('es-AR')}</span>
                        </h3>
                        
                        <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-[25px]">
                            <span className="font-black uppercase text-xs tracking-widest text-zinc-500">Cantidad a comprar</span>
                            <div className="flex items-center gap-4 bg-white px-2 py-1 rounded-2xl shadow-sm border border-zinc-100">
                                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center font-black text-xl text-zinc-400 hover:text-accent">-</button>
                                <input name="quantity" type="number" value={quantity} readOnly className="w-12 text-center font-black text-xl bg-transparent outline-none pointer-events-none" />
                                <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center font-black text-xl text-zinc-400 hover:text-accent">+</button>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 rounded-[35px] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Upload size={16} className="text-accent" /></div>
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Subí tu logo o referencia</label>
                            </div>
                            <input name="files" type="file" multiple accept="image/*" className="w-full text-xs file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-black file:text-white file:font-black cursor-pointer file:uppercase file:tracking-widest" />
                            <textarea name="designDetails" placeholder="Contanos qué te gustaría grabar o imprimir..." className="w-full p-5 bg-white rounded-[25px] border-none outline-none text-sm font-bold h-24 resize-none shadow-sm" required />
                        </div>
                    </div>

                    {/* PASO 3: ENVÍO */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent">3. Método de Entrega</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <ShippingOption 
                                id="PICKUP" icon={<MapPin/>} label="Retiro por Taller" desc="Gratis" 
                                isSelected={deliveryMethod === "PICKUP"} onClick={() => setDeliveryMethod("PICKUP")} 
                            />
                            {storeUser.localShippingCost > 0 && (
                                <ShippingOption 
                                    id="LOCAL" icon={<Truck/>} label="Envío a Domicilio (Local)" desc={`Costo: $${storeUser.localShippingCost.toLocaleString('es-AR')}`} 
                                    isSelected={deliveryMethod === "LOCAL"} onClick={() => setDeliveryMethod("LOCAL")} 
                                />
                            )}
                            <ShippingOption 
                                id="NATIONWIDE" icon={<Globe/>} label="Envío Nacional" desc="A convenir por WhatsApp" 
                                isSelected={deliveryMethod === "NATIONWIDE"} onClick={() => setDeliveryMethod("NATIONWIDE")} 
                            />
                        </div>
                    </div>

                    {/* CALCULADORA FINAL EN VIVO */}
                    <div className="pt-8 border-t border-zinc-100 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                <span>Subtotal ({quantity} un.)</span>
                                <span>${(template.basePrice * quantity).toLocaleString('es-AR')}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                <span>Costo de Envío</span>
                                <span>{shippingCost > 0 ? `$${shippingCost.toLocaleString('es-AR')}` : "GRATIS"}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4">
                                <span className="text-[14px] font-black uppercase tracking-widest text-black">Total del Pedido</span>
                                <span className="text-5xl font-black tracking-tighter text-accent leading-none">
                                    ${totalToPay.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full p-6 bg-black text-white rounded-[30px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-accent transition-all active:scale-95 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {loading ? "PROCESANDO..." : "Enviar Pedido a Fabricación"}
                        </button>
                    </div>
                </form>
                {/* Decoración */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent rounded-full blur-[120px] opacity-10 pointer-events-none" />
            </section>
        </div>
    )
}

function ShippingOption({ id, icon, label, desc, isSelected, onClick }: any) {
    return (
        <label onClick={onClick} className={`flex items-center justify-between p-5 rounded-[25px] border-2 transition-all cursor-pointer group ${isSelected ? 'border-accent bg-red-50' : 'border-zinc-100 bg-zinc-50 hover:bg-white hover:border-zinc-200'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isSelected ? 'bg-accent text-white' : 'bg-white text-zinc-400'}`}>{icon}</div>
                <div>
                    <p className={`text-sm font-black uppercase tracking-tight leading-none ${isSelected ? 'text-accent' : 'text-black'}`}>{label}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1.5 uppercase">{desc}</p>
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-accent bg-accent' : 'border-zinc-300'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
            <input type="radio" name="deliveryMethod" value={id} className="hidden" />
        </label>
    )
}