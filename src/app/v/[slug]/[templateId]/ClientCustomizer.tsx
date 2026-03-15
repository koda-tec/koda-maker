"use client"
import { useState, useTransition } from "react"
import { 
  ArrowLeft, 
  Upload, 
  Truck, 
  MapPin, 
  Globe, 
  Loader2, 
  Send, 
  Clock, 
  CheckCircle2,
  Info
} from "lucide-react"
import { submitOrderRequest } from "../actions"

interface ClientCustomizerProps {
    storeUser: any
    template: any
    slug: string
}

export function ClientCustomizer({ storeUser, template, slug }: ClientCustomizerProps) {
    const [isPending, startTransition] = useTransition()
    
    // 1. ESTADOS PARA LA CALCULADORA Y DATOS
    // Usamos string para la cantidad para permitir que el usuario borre el input totalmente al escribir
    const [quantity, setQuantity] = useState<string>("1") 
    const [deliveryMethod, setDeliveryMethod] = useState("PICKUP")
    
    // 2. ESTADO PARA LA GALERÍA DE IMÁGENES
    // Iniciamos con la primera imagen de la galería o la de portada
    const [activeImage, setActiveImage] = useState(
        template.images && template.images.length > 0 
        ? template.images[0].url 
        : template.publicImage
    )

    // 3. CÁLCULOS DINÁMICOS
    const qtyNum = parseInt(quantity) || 0
    const shippingCost = deliveryMethod === "LOCAL" ? storeUser.localShippingCost : 0
    const totalToPay = (template.basePrice * qtyNum) + shippingCost

    const handleSubmit = async (formData: FormData) => {
        if (qtyNum <= 0) {
            alert("Por favor, ingresá una cantidad válida.")
            return
        }

        startTransition(async () => {
            try {
                const result = await submitOrderRequest(formData, storeUser.id, template.id)
                if (result.success) {
                    window.location.href = `/v/${slug}/exito?order=${result.orderId}`
                }
            } catch (error) {
                console.error("Error al enviar pedido:", error)
            }
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            
            {/* COLUMNA IZQUIERDA: GALERÍA Y DESCRIPCIÓN */}
            <div className="space-y-8">
                {/* Imagen Principal Grande */}
                <div className="w-full aspect-square rounded-[50px] overflow-hidden bg-zinc-100 shadow-sm border border-zinc-100">
                    {activeImage ? (
                        <img 
                            src={activeImage} 
                            className="w-full h-full object-cover transition-all duration-500 animate-in fade-in" 
                            alt={template.name} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black uppercase text-xs tracking-widest">
                            Sin imagen disponible
                        </div>
                    )}
                </div>

                {/* Galería de Miniaturas (Thumbnails) */}
                {template.images && template.images.length > 1 && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2 italic">
                            Tocá para ampliar
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {template.images.map((img: any) => (
                                <button 
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImage(img.url)}
                                    className={`flex-none w-24 h-24 rounded-3xl overflow-hidden border-4 transition-all duration-300 ${
                                        activeImage === img.url 
                                        ? 'border-accent scale-105 shadow-lg' 
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img.url} className="w-full h-full object-cover" alt="Miniatura" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Título y Descripción del Producto */}
                <div className="px-4 space-y-6">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-black">
                            {template.name}
                        </h1>
                        <div className="w-20 h-2 bg-accent mt-4 rounded-full" />
                    </div>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed italic border-l-4 border-zinc-100 pl-6">
                        {template.publicDescription || "Este producto se fabrica a pedido con los mejores materiales y personalización exclusiva."}
                    </p>
                </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO DE PEDIDO */}
            <section className="bg-white p-8 md:p-12 rounded-[60px] shadow-2xl border border-zinc-100 relative overflow-hidden">
                <form action={handleSubmit} encType="multipart/form-data" className="space-y-10 relative z-10">
                    
                    {/* PASO 1: CONTACTO */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent italic">1. Información de Contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="customerName" placeholder="Tu Nombre y Apellido" className="w-full p-5 bg-zinc-50 rounded-[25px] border-none outline-none focus:ring-2 focus:ring-accent font-bold text-black" required />
                            <input name="customerPhone" placeholder="Tu WhatsApp" className="w-full p-5 bg-zinc-50 rounded-[25px] border-none outline-none focus:ring-2 focus:ring-accent font-bold text-black" required />
                        </div>
                    </div>

                    {/* PASO 2: EL PEDIDO */}
                    <div className="space-y-6">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent italic">2. Detalles del Pedido</h3>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {/* Input de cantidad corregido */}
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">¿Cuántas unidades necesitás?</label>
                                <input 
                                    name="quantity" 
                                    type="number" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(e.target.value)}
                                    onBlur={() => {
                                        if (!quantity || parseInt(quantity) < 1) setQuantity("1")
                                    }}
                                    className="w-full p-6 bg-zinc-50 rounded-[30px] font-black text-4xl outline-none focus:ring-2 focus:ring-accent transition-all text-black shadow-inner" 
                                    required 
                                />
                            </div>

                            {/* Mensaje de Entrega */}
                            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 p-6 rounded-[35px] flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black uppercase text-[10px] tracking-widest text-black">Fecha de Entrega</h4>
                                    <p className="text-xs font-bold text-zinc-500 leading-snug">
                                        La fecha final de entrega se coordinará por WhatsApp una vez que confirmemos la complejidad de tu diseño.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Notas y Archivos */}
                        <div className="p-6 bg-zinc-50 rounded-[40px] space-y-4 border border-zinc-100 shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Upload size={16} className="text-accent" /></div>
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Logo o imagen de referencia</label>
                            </div>
                            <input name="files" type="file" multiple accept="image/*" className="w-full text-xs file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-black file:text-white file:font-black cursor-pointer file:uppercase file:tracking-widest" />
                            <textarea name="designDetails" placeholder="Contanos qué te gustaría grabar o imprimir..." className="w-full p-6 bg-white rounded-[30px] border-none outline-none text-sm font-bold h-32 resize-none shadow-sm focus:ring-2 focus:ring-accent text-black" required />
                        </div>
                    </div>

                    {/* PASO 3: LOGÍSTICA */}
                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-accent italic">3. Método de Entrega</h3>
                        <div className="grid grid-cols-1 gap-3 text-left">
                            <ShippingOption 
                                id="PICKUP" icon={<MapPin/>} label="Retiro por Taller" desc="Gratis" 
                                isSelected={deliveryMethod === "PICKUP"} onClick={() => setDeliveryMethod("PICKUP")} 
                            />
                            {storeUser.localShippingCost > 0 && (
                                <ShippingOption 
                                    id="LOCAL" icon={<Truck/>} label="Envío a Domicilio" desc={`Costo fijo: $${storeUser.localShippingCost.toLocaleString('es-AR')}`} 
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
                        <div className="space-y-3 px-2">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                <span>Subtotal ({qtyNum} un.)</span>
                                <span>${(template.basePrice * qtyNum).toLocaleString('es-AR')}</span>
                            </div>
                            {shippingCost > 0 && (
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-accent italic">
                                    <span>Costo de Envío</span>
                                    <span>${shippingCost.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-4">
                                <span className="text-[14px] font-black uppercase tracking-[0.2em] text-black underline decoration-accent decoration-4 underline-offset-8">Total Estimado</span>
                                <span suppressHydrationWarning className="text-5xl font-black tracking-tighter text-black leading-none">
                                    ${totalToPay.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        {/* BOTÓN DE ENVÍO */}
                        <button 
                            type="submit" 
                            disabled={isPending} 
                            className="w-full p-7 bg-black text-white rounded-[35px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                            {isPending ? "PROCESANDO SOLICITUD..." : "Enviar Pedido a Fabricación"}
                        </button>
                    </div>
                </form>
                
                {/* Decoración de fondo */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent/5 rounded-full blur-[120px] opacity-20 pointer-events-none" />
            </section>
        </div>
    )
}

// Sub-componente para las opciones de envío
function ShippingOption({ id, icon, label, desc, isSelected, onClick }: any) {
    return (
        <label onClick={onClick} className={`flex items-center justify-between p-5 rounded-[30px] border-2 transition-all cursor-pointer group ${isSelected ? 'border-accent bg-red-50/30' : 'border-zinc-100 bg-zinc-50 hover:bg-white hover:border-zinc-200'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isSelected ? 'bg-accent text-white shadow-red-200' : 'bg-white text-zinc-400'}`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-sm font-black uppercase tracking-tight leading-none ${isSelected ? 'text-accent' : 'text-black'}`}>{label}</p>
                    <p className="text-[9px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest">{desc}</p>
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-accent bg-accent' : 'border-zinc-300'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
            </div>
            {/* Input radio oculto para el FormData */}
            <input type="radio" name="deliveryMethod" value={id} className="hidden" readOnly checked={isSelected} />
        </label>
    )
}