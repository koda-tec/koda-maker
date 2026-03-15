import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  Plus, Trash2, ArrowLeft, Calculator, Info, 
  AlertTriangle, Globe, Image as ImageIcon, 
  Eye, EyeOff, LayoutPanelTop
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

  if (!template) return <p className="p-20 text-center font-black">Plantilla no encontrada.</p>

  const totalCost = template.materials.reduce((acc, item) => acc + (item.quantity * item.material.unitPrice), 0)
  const suggestedPrice = totalCost * (1 + (template.targetMargin / 100))

  return (
    <div className="space-y-10 pb-32 max-w-5xl mx-auto px-4 pt-6">
      <header className="flex items-center gap-4">
        <Link href="/dashboard/templates" className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100 hover:bg-zinc-50 transition-all">
            <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.4em] leading-none">Catálogo Pro</h1>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">{template.name}</h2>
        </div>
      </header>

      {/* 1. ANÁLISIS FINANCIERO (Ya lo teníamos) */}
      <section className="bg-white p-8 rounded-[45px] border border-zinc-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Costo Producción</p>
            <p className="text-4xl font-black text-black tracking-tighter">${totalCost.toFixed(2)}</p>
          </div>
          <div className="space-y-1 p-6 bg-zinc-50 rounded-[30px] border border-dashed border-zinc-200">
            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Sugerido ({template.targetMargin}%)</p>
            <p className="text-4xl font-black text-black tracking-tighter">${suggestedPrice.toFixed(2)}</p>
          </div>
          <form action={async (formData) => {
              "use server"
              const price = parseFloat(formData.get("basePrice") as string)
              const margin = parseFloat(formData.get("targetMargin") as string)
              await updateTemplatePricing(template.id, price, margin)
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <input name="targetMargin" type="number" defaultValue={template.targetMargin} className="p-3 bg-zinc-100 rounded-xl font-bold text-center border-none outline-none focus:ring-2 focus:ring-accent" title="Margen deseado %" />
                <input name="basePrice" type="number" step="0.01" defaultValue={template.basePrice} className="p-3 bg-black text-white rounded-xl font-bold text-center border-none outline-none focus:ring-2 focus:ring-accent" title="Precio final $" />
            </div>
            <button type="submit" className="w-full py-2 bg-zinc-200 text-black text-[10px] font-black uppercase rounded-xl hover:bg-black hover:text-white transition-all">Actualizar Precios</button>
          </form>
      </section>

      {/* 2. CONFIGURACIÓN DE TIENDA ONLINE (NUEVO) */}
      <section className="bg-white p-8 md:p-12 rounded-[50px] shadow-xl border-2 border-zinc-50 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-10">
            <div className={`w-3 h-3 rounded-full animate-pulse ${template.isPublic ? 'bg-green-500' : 'bg-zinc-300'}`} />
            <h3 className="font-black uppercase text-sm tracking-widest text-black flex items-center gap-2 italic">
                <Globe size={18} className="text-accent" /> Configuración E-commerce
            </h3>
        </div>

        <form action={async (formData) => {
            "use server"
            await updatePublicSettings(id, formData)
        }} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* Foto de producto */}
            <div className="md:col-span-4 space-y-4">
                <p className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Imagen de Portada</p>
                <div className="relative aspect-square rounded-[40px] bg-zinc-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group">
                    {template.publicImage ? (
                        <img src={template.publicImage} className="w-full h-full object-cover" alt="Portada" />
                    ) : (
                        <ImageIcon size={48} className="text-zinc-200" />
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                        <Plus className="text-white" size={32} />
                        <input name="publicImage" type="file" accept="image/*" className="hidden" />
                    </label>
                </div>
            </div>

            {/* Datos públicos */}
            <div className="md:col-span-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-3xl">
                        <p className="text-xs font-black uppercase flex-1">¿Visible en mi tienda pública?</p>
                        <select name="isPublic" defaultValue={template.isPublic ? "true" : "false"} className="bg-white p-3 rounded-xl font-black text-xs border-none outline-none shadow-sm">
                            <option value="false">🔴 OCULTO</option>
                            <option value="true">🟢 PÚBLICO</option>
                        </select>
                    </div>
                    <textarea 
                        name="publicDescription" 
                        defaultValue={template.publicDescription || ""} 
                        placeholder="Escribí una descripción atractiva para tus clientes... (Ej: Mates de madera seleccionada grabados a fuego con el diseño que quieras)"
                        className="w-full p-6 bg-zinc-50 border-none rounded-[35px] outline-none text-sm font-medium h-32 focus:ring-2 focus:ring-accent resize-none"
                    />
                </div>
                <SubmitButton label="Guardar en Catálogo Público" />
            </div>
        </form>
      </section>

      {/* 3. LISTA DE MATERIALES (RECETA) */}
      <section className="space-y-4">
        <h3 className="font-black text-zinc-400 text-[10px] uppercase tracking-[0.4em] ml-6">Composición del Producto</h3>
        <div className="bg-black text-white p-8 rounded-[45px] shadow-2xl space-y-8">
            <form action={async (formData) => {
                "use server"
                await addMaterialToTemplate(id, formData)
            }} className="flex flex-col md:flex-row gap-4">
                <select name="materialId" className="flex-1 p-4 bg-zinc-900 border-none rounded-2xl outline-none text-sm font-bold text-zinc-400" required>
                    <option value="">Seleccionar insumo...</option>
                    {allMaterials.map(m => (
                        <option key={m.id} value={m.id}>{m.name} (${m.unitPrice}/{m.unit})</option>
                    ))}
                </select>
                <input name="quantity" type="number" step="0.001" placeholder="Cant." className="w-full md:w-32 p-4 bg-zinc-900 border-none rounded-2xl outline-none text-sm font-black text-center" required />
                <button type="submit" className="px-8 py-4 bg-accent rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Añadir</button>
            </form>

            <div className="space-y-3">
                {template.materials.map((item) => (
                    <div key={item.id} className="bg-zinc-900 p-5 rounded-[30px] flex items-center justify-between group border border-transparent hover:border-zinc-800 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-accent shadow-inner">
                                <LayoutPanelTop size={18} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tight">{item.material.name}</h4>
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                    {item.quantity} {item.material.unit} x ${item.material.unitPrice} = 
                                    <span className="text-white ml-1 font-bold">${(item.quantity * item.material.unitPrice).toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                        <form action={async () => { "use server"; await removeMaterialFromTemplate(item.id, id) }}>
                            <button className="p-2 text-zinc-700 hover:text-accent transition-colors"><Trash2 size={18} /></button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  )
}