import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  Plus, Trash2, ArrowLeft, Calculator, Info, 
  AlertTriangle, Globe, Image as ImageIcon, 
  Eye, EyeOff, LayoutPanelTop, TrendingUp, 
  DollarSign, Percent, CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { addMaterialToTemplate, removeMaterialFromTemplate, updateTemplatePricing, updatePublicSettings } from "./actions"
import { SubmitButton } from "@/components/SubmitButton"

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const template = await prisma.productTemplate.findUnique({
    where: { id, userId: user?.id },
    include: { materials: { include: { material: true } } }
  })

  const allMaterials = await prisma.material.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  if (!template) return <div className="p-20 text-center font-black uppercase tracking-widest">Plantilla no encontrada</div>

  // --- LÓGICA FINANCIERA DETALLADA ---
  const totalCost = template.materials.reduce((acc, item) => acc + (item.quantity * item.material.unitPrice), 0)
  
  // Precio sugerido según el % de margen que el usuario eligió
  const suggestedPrice = totalCost * (1 + (template.targetMargin / 100))
  
  // Ganancia real en pesos basada en el Precio Final actual
  const actualProfit = template.basePrice - totalCost
  
  // Margen real actual en porcentaje
  const actualMarginPercent = totalCost > 0 ? (actualProfit / totalCost) * 100 : 0

  const isProfitable = template.basePrice >= suggestedPrice

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto px-4 pt-6">
      
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <Link href="/dashboard/templates" className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100 hover:bg-zinc-50 transition-all active:scale-95">
            <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.4em] leading-none mb-1">Análisis de Producto</h1>
          <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase">{template.name}</h2>
        </div>
      </header>

      {/* 1. DASHBOARD FINANCIERO (Restaurado y Mejorado) */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* COSTO TOTAL */}
            <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                    <PackageOpen size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Costo Producción</span>
                </div>
                <p className="text-4xl font-black text-black tracking-tighter">
                    ${totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase italic">Suma de insumos y tiempo</p>
            </div>

            {/* PRECIO SUGERIDO POR MARGEN */}
            <div className="bg-zinc-50 p-8 rounded-[40px] border border-dashed border-zinc-200 space-y-2">
                <div className="flex items-center gap-2 text-accent">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sugerido ({template.targetMargin}%)</span>
                </div>
                <p className="text-4xl font-black text-black tracking-tighter">
                    ${suggestedPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase italic">Precio ideal para tu meta</p>
            </div>

            {/* FORMULARIO DE AJUSTE DE PRECIOS */}
            <div className="bg-zinc-950 p-8 rounded-[40px] shadow-2xl space-y-4">
                <form action={async (formData) => {
                    "use server"
                    const price = parseFloat(formData.get("basePrice") as string)
                    const margin = parseFloat(formData.get("targetMargin") as string)
                    await updateTemplatePricing(template.id, price, margin)
                }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">Meta %</label>
                            <input name="targetMargin" type="number" defaultValue={template.targetMargin} className="w-full p-3 bg-zinc-900 text-white rounded-xl font-bold border-none outline-none focus:ring-1 focus:ring-accent text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">Precio Final $</label>
                            <input name="basePrice" type="number" step="0.01" defaultValue={template.basePrice} className="w-full p-3 bg-zinc-800 text-white rounded-xl font-bold border-none outline-none focus:ring-1 focus:ring-accent text-sm" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95">
                        Actualizar Valores
                    </button>
                </form>
            </div>
        </div>

        {/* ALERTA DE RENTABILIDAD (Restaurada) */}
        {!isProfitable && template.basePrice > 0 && (
            <div className="p-5 bg-red-50 border-2 border-red-100 rounded-[30px] flex items-center gap-4 animate-in fade-in slide-in-from-top">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h4 className="font-black text-accent uppercase text-xs">Alerta de Rentabilidad</h4>
                    <p className="text-zinc-500 text-[11px] font-medium leading-tight">
                        Tu precio de venta actual (${template.basePrice}) está por debajo del sugerido (${suggestedPrice.toFixed(2)}). Estás ganando un <span className="font-black text-accent">{actualMarginPercent.toFixed(1)}%</span> en lugar del {template.targetMargin}%.
                    </p>
                </div>
            </div>
        )}
      </section>

      {/* 2. CONFIGURACIÓN DE TIENDA ONLINE */}
      <section className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-zinc-100 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-10">
            <div className={`w-3 h-3 rounded-full ${template.isPublic ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
            <h3 className="font-black uppercase text-sm tracking-widest text-black flex items-center gap-2 italic">
                <Globe size={18} className="text-accent" /> Vitrina Pública
            </h3>
        </div>

        <form action={async (formData) => {
            "use server"
            await updatePublicSettings(id, formData)
        }} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Foto de producto */}
            <div className="md:col-span-4 space-y-4 text-center md:text-left">
                <p className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest italic">Imagen para clientes</p>
                <div className="relative aspect-square rounded-[40px] bg-zinc-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group mx-auto md:mx-0">
                    {template.publicImage ? (
                        <img src={template.publicImage} className="w-full h-full object-cover" alt="Portada" />
                    ) : (
                        <ImageIcon size={48} className="text-zinc-200" />
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                        <div className="flex flex-col items-center text-white gap-2">
                            <Plus size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Cambiar Foto</span>
                        </div>
                        <input name="publicImage" type="file" accept="image/*" className="hidden" />
                    </label>
                </div>
            </div>

            {/* Datos públicos */}
            <div className="md:col-span-8 space-y-8 flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-zinc-50 rounded-[35px] border border-zinc-100">
                        <div className="flex items-center gap-3 flex-1">
                            <CheckCircle2 size={20} className={template.isPublic ? "text-green-500" : "text-zinc-300"} />
                            <p className="text-[11px] font-black uppercase tracking-tighter">¿Publicar este producto en mi web?</p>
                        </div>
                        <select name="isPublic" defaultValue={template.isPublic ? "true" : "false"} className="w-full sm:w-auto bg-white p-3 px-6 rounded-2xl font-black text-xs border-none outline-none shadow-sm cursor-pointer hover:bg-zinc-50 transition-all">
                            <option value="false">🔴 NO, MANTENER OCULTO</option>
                            <option value="true">🟢 SÍ, HACER PÚBLICO</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-6 tracking-[0.2em]">Descripción de Venta</label>
                        <textarea 
                            name="publicDescription" 
                            defaultValue={template.publicDescription || ""} 
                            placeholder="Contale a tus clientes lo especial que es este producto..."
                            className="w-full p-8 bg-zinc-50 border-none rounded-[40px] outline-none text-sm font-medium h-40 focus:ring-2 focus:ring-accent resize-none shadow-inner"
                        />
                    </div>
                </div>
                <SubmitButton label="Guardar Cambios de Tienda" />
            </div>
        </form>
      </section>

      {/* 3. COMPOSICIÓN (LA RECETA) */}
      <section className="space-y-4">
        <h3 className="font-black text-zinc-400 text-[10px] uppercase tracking-[0.4em] ml-8 flex items-center gap-2 italic">
            <LayoutPanelTop size={14} /> Ingeniería de Materiales
        </h3>
        <div className="bg-black text-white p-8 md:p-12 rounded-[60px] shadow-2xl space-y-10 relative overflow-hidden">
            <form action={async (formData) => {
                "use server"
                await addMaterialToTemplate(id, formData)
            }} className="flex flex-col md:flex-row gap-4 relative z-10">
                <select name="materialId" className="flex-1 p-5 bg-zinc-900 border-none rounded-[25px] outline-none text-sm font-bold text-zinc-400" required>
                    <option value="">Añadir insumo al producto...</option>
                    {allMaterials.map(m => (
                        <option key={m.id} value={m.id}>{m.name} (${m.unitPrice}/{m.unit})</option>
                    ))}
                </select>
                <div className="flex gap-2">
                    <input name="quantity" type="number" step="0.001" placeholder="Cant." className="w-24 md:w-32 p-5 bg-zinc-900 border-none rounded-[25px] outline-none text-sm font-black text-center" required />
                    <button type="submit" className="px-10 bg-accent rounded-[25px] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-red-900/50">Añadir</button>
                </div>
            </form>

            <div className="space-y-4 relative z-10">
                {template.materials.map((item) => (
                    <div key={item.id} className="bg-zinc-900/50 p-6 rounded-[35px] flex items-center justify-between group border border-white/5 hover:border-accent/50 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-accent border border-zinc-800 shadow-inner">
                                <Plus size={18} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tight text-white">{item.material.name}</h4>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    {item.quantity} {item.material.unit} x ${item.material.unitPrice} = 
                                    <span className="text-accent ml-2 font-black italic">${(item.quantity * item.material.unitPrice).toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                        <form action={async () => { "use server"; await removeMaterialFromTemplate(item.id, id) }}>
                            <button className="p-3 text-zinc-700 hover:text-accent transition-colors"><Trash2 size={20} /></button>
                        </form>
                    </div>
                ))}
            </div>

            {/* Marca de agua de fondo */}
            <div className="absolute -left-10 -bottom-10 opacity-5 rotate-12">
                <LayoutPanelTop size={200} />
            </div>
        </div>
      </section>
    </div>
  )
}

import { PackageOpen } from "lucide-react"