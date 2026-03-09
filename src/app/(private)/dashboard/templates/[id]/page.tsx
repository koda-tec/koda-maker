import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Plus, Trash2, ArrowLeft, Calculator, Info } from "lucide-react"
import Link from "next/link"
import { addMaterialToTemplate, removeMaterialFromTemplate } from "./actions"

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Buscamos la plantilla con sus materiales ya asignados
  const template = await prisma.productTemplate.findUnique({
    where: { id, userId: user?.id },
    include: {
      materials: {
        include: { material: true }
      }
    }
  })

  // 2. Buscamos todos los materiales disponibles para el dropdown
  const allMaterials = await prisma.material.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  if (!template) return <p>Plantilla no encontrada.</p>

  // 3. Calculamos el costo total automáticamente
  const totalCost = template.materials.reduce((acc, item) => {
    return acc + (item.quantity * item.material.unitPrice)
  }, 0)

  const profit = template.basePrice - totalCost

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <Link href="/dashboard/templates" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Configurar Receta</h1>
          <h2 className="text-2xl font-black text-black uppercase tracking-tighter">{template.name}</h2>
        </div>
      </header>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-32px border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400">Costo Producción</p>
            <span className="text-2xl font-black text-black">${totalCost.toFixed(2)}</span>
        </div>
        <div className="bg-white p-6 rounded-32px border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400">Ganancia Est. ({((profit/template.basePrice)*100).toFixed(0)}%)</p>
            <span className={`text-2xl font-black ${profit > 0 ? "text-green-600" : "text-[#f13d4b]"}`}>
                ${profit.toFixed(2)}
            </span>
        </div>
      </div>

      {/* Formulario para Añadir Material a la Receta */}
      <section className="bg-black text-white p-6 rounded-32px shadow-xl">
        <h3 className="font-bold mb-4 text-sm uppercase tracking-widest">Añadir Insumo a la Receta</h3>
        <form action={async (formData) => {
            "use server"
            await addMaterialToTemplate(id, formData)
        }} className="space-y-4">
          <select name="materialId" className="w-full p-4 bg-zinc-900 border-none rounded-2xl outline-none text-sm" required>
            <option value="">Selecciona un material...</option>
            {allMaterials.map(m => (
              <option key={m.id} value={m.id}>{m.name} (${m.unitPrice}/{m.unit})</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input name="quantity" type="number" step="0.001" placeholder="Cantidad" className="flex-1 p-4 bg-zinc-900 border-none rounded-2xl outline-none text-sm" required />
            <button type="submit" className="px-6 bg-[#f13d4b] rounded-2xl font-bold active:scale-95 transition-all">
                Añadir
            </button>
          </div>
        </form>
      </section>

      {/* Lista de Materiales en la Receta */}
      <section className="space-y-3">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest ml-2 italic underline decoration-[#f13d4b]">Composición del Producto</h3>
        {template.materials.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-[28px] border border-gray-100 flex items-center justify-between shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#f13d4b]">
                <Info size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">{item.material.name}</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400">
                    {item.quantity} {item.material.unit} x ${item.material.unitPrice} = <span className="text-black font-black">${(item.quantity * item.material.unitPrice).toFixed(2)}</span>
                </p>
              </div>
            </div>
            
            <form action={async () => {
                "use server"
                await removeMaterialFromTemplate(item.id, id)
            }}>
                <button className="p-3 text-gray-200 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                </button>
            </form>
          </div>
        ))}

        {template.materials.length === 0 && (
            <p className="text-center py-10 text-gray-400 text-sm">Esta receta está vacía. Agrega materiales arriba.</p>
        )}
      </section>
    </div>
  )
}