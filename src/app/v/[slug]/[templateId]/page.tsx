import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { 
  ArrowLeft, CheckCircle2, MessageSquare, 
  Upload, Truck, MapPin, Globe, ShoppingCart 
} from "lucide-react"
import Link from "next/link"
import { submitOrderRequest } from "../actions"
import { SubmitButton } from "@/components/SubmitButton"

export default async function CustomizationPage({ params }: { params: Promise<{ slug: string, templateId: string }> }) {
    const { slug, templateId } = await params

    const [storeUser, template] = await Promise.all([
        prisma.user.findUnique({ where: { slug } }),
        prisma.productTemplate.findUnique({ 
            where: { id: templateId },
            include: { images: true }
        })
    ])

    if (!storeUser || !template || !template.isPublic) notFound()

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-black font-sans pb-20">
            {/* Nav de producto */}
            <nav className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link href={`/v/${slug}`} className="p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="font-black uppercase text-[10px] tracking-[0.3em]">{storeUser.name}</span>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
                    
                    {/* COLUMNA IZQUIERDA: GALERÍA */}
                    <div className="space-y-6">
                        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
                            {template.images.map((img) => (
                                <div key={img.id} className="flex-none w-full md:w- aspect-square rounded-[50px] overflow-hidden bg-zinc-100 snap-center shadow-sm">
                                    <img src={img.url} className="w-full h-full object-cover" alt={template.name} />
                                </div>
                            ))}
                        </div>
                        <div className="px-4 space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{template.name}</h1>
                            <p className="text-zinc-500 font-medium leading-relaxed italic">
                                {template.publicDescription}
                            </p>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FORMULARIO */}
                    <section className="bg-white p-8 md:p-12 rounded-[60px] shadow-2xl border border-zinc-100 relative overflow-hidden">
                        <form action={async (formData) => {
                            "use server"
                            const result = await submitOrderRequest(formData, storeUser.id, template.id)
                            if (result.success) {
                                // Redirigimos a una página de éxito con el link de WhatsApp
                                redirect(`/v/${slug}/exito?order=${result.orderId}`)
                            }
                        }} encType="multipart/form-data" className="space-y-8 relative z-10">
                            
                            {/* PASO 1: DATOS */}
                            <div className="space-y-4">
                                <h3 className="font-black uppercase text-xs tracking-widest text-accent">1. Tus Datos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="customerName" placeholder="Tu Nombre" className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-accent font-bold" required />
                                    <input name="customerPhone" placeholder="Tu WhatsApp" className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-accent font-bold" required />
                                </div>
                            </div>

                            {/* PASO 2: PERSONALIZACIÓN */}
                            <div className="space-y-4">
                                <h3 className="font-black uppercase text-xs tracking-widest text-accent">2. Personalización</h3>
                                <div className="p-6 bg-zinc-50 rounded-[35px] space-y-4 border border-zinc-100">
                                    <div className="flex items-center gap-2">
                                        <Upload size={16} className="text-zinc-400" />
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Subí tu logo o referencia</label>
                                    </div>
                                    <input name="files" type="file" multiple className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-black file:text-white file:font-black cursor-pointer" />
                                    <textarea name="designDetails" placeholder="Contanos qué te gustaría grabar o imprimir..." className="w-full p-4 bg-white rounded-2xl border-none outline-none text-sm font-medium h-24 resize-none" />
                                </div>
                            </div>

                            {/* PASO 3: ENVÍO */}
                            <div className="space-y-4">
                                <h3 className="font-black uppercase text-xs tracking-widest text-accent">3. Método de Entrega</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <ShippingOption id="PICKUP" icon={<MapPin/>} label="Retiro por Taller" desc="Gratis" defaultChecked />
                                    {storeUser.localShippingCost > 0 && (
                                        <ShippingOption id="LOCAL" icon={<Truck/>} label="Envío Local" desc={`$${storeUser.localShippingCost}`} />
                                    )}
                                    <ShippingOption id="NATIONWIDE" icon={<Globe/>} label="Envío Nacional" desc="A convenir" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-100 space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Cantidad</p>
                                        <input name="quantity" type="number" defaultValue="1" min="1" className="w-20 p-2 bg-zinc-100 rounded-xl font-black text-xl text-center border-none outline-none" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Precio Unitario</p>
                                        <p className="text-4xl font-black tracking-tighter">${template.basePrice.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                                <SubmitButton label="Enviar Solicitud de Pedido" />
                            </div>
                        </form>
                        {/* Decoración */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />
                    </section>
                </div>
            </main>
        </div>
    )
}

function ShippingOption({ id, icon, label, desc, defaultChecked = false }: any) {
    return (
        <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border-2 border-transparent has-checked:border-accent has-checked:bg-white transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-300 group-has-checked:text-accent transition-colors shadow-sm">{icon}</div>
                <div>
                    <p className="text-xs font-black uppercase tracking-tight leading-none">{label}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">{desc}</p>
                </div>
            </div>
            <input type="radio" name="deliveryMethod" value={id} defaultChecked={defaultChecked} className="w-5 h-5 accent-accent" />
        </label>
    )
}