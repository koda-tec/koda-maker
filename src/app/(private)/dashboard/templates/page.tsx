import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Plus, Ruler, Clock, Tag, Trash2  } from "lucide-react"
import { createTemplate, deleteTemplate  } from "./actions"
import Link from "next/link";

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id },
    include: { materials: true }, // Para saber cuántos materiales tiene asignados
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Catálogo</h1>
        <h2 className="text-3xl font-black text-black">Plantillas</h2>
      </header>

      {/* Formulario de Nueva Plantilla */}
      <section className="bg-white p-6 rounded-32px shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#f13d4b]" /> 
            Nuevo Producto Base
        </h3>
        <form action={createTemplate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Nombre (Ej: Mate Camionero Grabado)" className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b]" required />
          
          <select name="category" className="p-4 bg-gray-50 rounded-2xl outline-none" required>
            <option value="Grabado Láser">Grabado Láser</option>
            <option value="Corte MDF">Corte MDF</option>
            <option value="Impresión 3D">Impresión 3D</option>
            <option value="Souvenirs">Souvenirs / Varios</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input name="basePrice" type="number" step="0.01" placeholder="Precio Sugerido ($)" className="p-4 bg-gray-50 rounded-2xl outline-none" required />
          </div>

          <button type="submit" className="md:col-span-2 p-4 bg-[#f13d4b] text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
            Crear Plantilla
          </button>
        </form>
      </section>

      {/* Lista de Plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-32px border border-gray-100 shadow-sm space-y-4 hover:border-[#f13d4b] transition-colors group">
           <div className="flex justify-between items-start">
            <div>
                <span className="text-[10px] font-black uppercase text-[#f13d4b] bg-red-50 px-2 py-1 rounded-full">{t.category}</span>
                <h4 className="text-xl font-black text-black mt-1 uppercase tracking-tighter">{t.name}</h4>
            </div>
            <div className="flex gap-2">
                <form action={async () => {
                    "use server"
                    await deleteTemplate(t.id)
                }}>
                    <button className="p-2 text-gray-200 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </form>
                <Tag size={20} className="text-gray-300" />
            </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={14} />
                <span className="text-xs font-bold">{t.machineTimeMin} min</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Ruler size={14} />
                <span className="text-xs font-bold">{t.materials.length} materiales</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-2xl font-black text-black">${t.basePrice}</span>
                <Link 
                    href={`/dashboard/templates/${t.id}`}
                    className="text-[10px] font-black uppercase bg-black text-white px-4 py-2 rounded-xl active:scale-95 transition-all"
                >
                    Configurar Receta
                </Link>
            </div>
          </div>
        ))}
      </div>
      
      {templates.length === 0 && (
          <p className="text-center py-10 text-gray-400 text-sm">No tienes plantillas creadas. Define tu primer producto arriba.</p>
      )}
    </div>
  )
}