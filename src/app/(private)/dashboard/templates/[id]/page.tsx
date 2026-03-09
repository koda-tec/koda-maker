import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Plus, Trash2, ArrowLeft, Calculator, Info, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { addMaterialToTemplate, removeMaterialFromTemplate, updateTemplatePricing } from "./actions"

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Buscamos la plantilla con sus materiales vinculados
  const template = await prisma.productTemplate.findUnique({
    where: { id, userId: user?.id },
    include: {
      materials: {
        include: { material: true }
      }
    }
  })

  // 2. Buscamos todos los materiales disponibles para el selector
  const allMaterials = await prisma.material.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  if (!template) return (
    <div className="p-10 text-center">
        <p>Plantilla no encontrada.</p>
        <Link href="/dashboard/templates" className="text-[#f13d4b] font-bold">Volver al catálogo</Link>
    </div>
  )

  // 3. Cálculos Financieros
  const totalCost = template.materials.reduce((acc, item) => {
    return acc + (item.quantity * item.material.unitPrice)
  }, 0)

  // Precio sugerido según el % de margen deseado
  const suggestedPrice = totalCost * (1 + (template.targetMargin / 100))
  
  // Margen real actual basado en el precio de venta final
  const currentMargin = totalCost > 0 
    ? ((template.basePrice - totalCost) / totalCost) * 100 
    : 0

  return (
    <div className="space-y-8 pb-24">
      {/* HEADER CON BOTÓN VOLVER */}
      <header className="flex items-center gap-4">
        <Link href="/dashboard/templates" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all">
            <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Configurar Receta</h1>
          <h2 className="text-2xl font-black text-black uppercase tracking-tighter">{template.name}</h2>
        </div>
      </header>

      {/* SECCIÓN 1: CALCULADORA DE PRECIOS Y RENTABILIDAD */}
      <section className="bg-white p-6 rounded-32px border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-[#f13d4b] rounded-full" />
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 flex items-center gap-2">
                <Calculator size={14} /> Análisis de Precios
            </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COSTO TOTAL */}
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase">Costo Producción</p>
            <p className="text-3xl font-black text-black">${totalCost.toFixed(2)}</p>
            <p className="text-[10px] text-gray-400">Materiales + Tiempo de máquina</p>
          </div>

          {/* PRECIO SUGERIDO (BASADO EN MARGEN) */}
          <div className="space-y-1 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-[10px] font-black text-[#f13d4b] uppercase">Sugerido ({template.targetMargin}%)</p>
            <p className="text-3xl font-black text-black">${suggestedPrice.toFixed(2)}</p>
            <p className="text-[10px] text-gray-400">Lo que deberías cobrar</p>
          </div>

          {/* AJUSTE MANUAL DE PRECIO Y MARGEN */}
          <form action={async (formData) => {
              "use server"
              const price = parseFloat(formData.get("basePrice") as string)
              const margin = parseFloat(formData.get("targetMargin") as string)
              await updateTemplatePricing(template.id, price, margin)
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Margen %</label>
                    <input name="targetMargin" type="number" defaultValue={template.targetMargin} className="w-full p-3 bg-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm" />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Precio Final</label>
                    <input name="basePrice" type="number" step="0.01" defaultValue={template.basePrice} className="w-full p-3 bg-black text-white rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm" />
                </div>
            </div>
            <button type="submit" className="w-full py-3 bg-gray-200 text-black text-[10px] font-black uppercase rounded-xl hover:bg-black hover:text-white transition-all active:scale-95">
                Actualizar Precios
            </button>
          </form>
        </div>

        {/* ALERTA DE RENTABILIDAD BAJA */}
        {template.basePrice < suggestedPrice && template.basePrice > 0 && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="text-[#f13d4b]" size={20} />
                <p className="text-xs font-bold text-[#f13d4b] leading-tight">
                    ATENCIÓN: Tu precio de venta (${template.basePrice}) está por debajo del margen sugerido para este producto.
                </p>
            </div>
        )}
      </section>

      {/* SECCIÓN 2: AÑADIR MATERIAL A LA RECETA */}
      <section className="bg-black text-white p-6 rounded-32px shadow-xl">
        <h3 className="font-bold mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
            <Plus size={16} className="text-[#f13d4b]" /> Añadir Insumo
        </h3>
        <form action={async (formData) => {
            "use server"
            await addMaterialToTemplate(id, formData)
        }} className="space-y-4">
          <select name="materialId" className="w-full p-4 bg-zinc-900 border-none rounded-2xl outline-none text-sm text-gray-300" required>
            <option value="">Selecciona un material...</option>
            {allMaterials.map(m => (
              <option key={m.id} value={m.id}>{m.name} (${m.unitPrice}/{m.unit})</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input name="quantity" type="number" step="0.001" placeholder="Cantidad necesaria" className="flex-1 p-4 bg-zinc-900 border-none rounded-2xl outline-none text-sm" required />
            <button type="submit" className="px-8 bg-[#f13d4b] rounded-2xl font-bold active:scale-95 transition-all text-sm">
                Añadir
            </button>
          </div>
        </form>
      </section>

      {/* SECCIÓN 3: COMPOSICIÓN ACTUAL */}
      <section className="space-y-3">
        <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest ml-4">Desglose de la receta</h3>
        
        {template.materials.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-[28px] border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#f13d4b]">
                <Info size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">{item.material.name}</h4>
                <p className="text-[10px] uppercase font-black text-gray-400">
                    {item.quantity} {item.material.unit} x ${item.material.unitPrice} = 
                    <span className="text-black ml-1">${(item.quantity * item.material.unitPrice).toFixed(2)}</span>
                </p>
              </div>
            </div>
            
            <form action={async () => {
                "use server"
                await removeMaterialFromTemplate(item.id, id)
            }}>
                <button className="p-3 text-gray-200 hover:text-red-500 transition-colors active:scale-90">
                    <Trash2 size={18} />
                </button>
            </form>
          </div>
        ))}

        {template.materials.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-32px border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium">Esta receta aún no tiene materiales asignados.</p>
            </div>
        )}
      </section>
    </div>
  )
}