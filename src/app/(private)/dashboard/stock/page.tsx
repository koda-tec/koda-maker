import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Plus, AlertTriangle, Package, Trash2, Pencil } from "lucide-react"
import { addMaterial, deleteMaterial } from "./actions"

export default async function StockPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const materiales = await prisma.material.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-6 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inventario</h1>
          <h2 className="text-3xl font-black text-black">Materiales</h2>
        </div>
      </header>

      {/* Formulario rápido (Simple para celular) */}
      <section className="bg-white p-6 rounded-32px shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#f13d4b]" /> 
            Cargar Material
        </h3>
        <form action={addMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Nombre (Ej: MDF 3mm)" className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b]" required />
          
          <select name="type" className="p-4 bg-gray-50 rounded-2xl outline-none" required>
            <option value="Láser">Corte/Grabado Láser</option>
            <option value="3D">Impresión 3D</option>
            <option value="Insumo">Insumo/Producto Base</option>
            <option value="Máquina">Máquina (Tiempo/Uso)</option> 

          </select>

          <div className="grid grid-cols-2 gap-4">
            <input name="unitPrice" type="number" step="0.01" placeholder="Precio x Unidad" className="p-4 bg-gray-50 rounded-2xl outline-none" required />
            <input name="unit" placeholder="Unidad (gr, cm2, un)" className="p-4 bg-gray-50 rounded-2xl outline-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="stock" type="number" step="0.1" placeholder="Stock Actual" className="p-4 bg-gray-50 rounded-2xl outline-none" required />
            <input name="minStock" type="number" step="0.1" placeholder="Stock Mínimo" className="p-4 bg-gray-50 rounded-2xl outline-none" required />
          </div>

          <button type="submit" className="md:col-span-2 p-4 bg-black text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
            Guardar Material
          </button>
        </form>
      </section>

      {/* Lista de Materiales */}
      <section className="space-y-3">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest ml-2">Tus Materiales ({materiales.length})</h3>
        
        {materiales.length === 0 && (
            <p className="text-center py-10 text-gray-400 text-sm">No tienes materiales cargados.</p>
        )}

        {materiales.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-[28px] border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <form action={async () => {
                    "use server"
                    await deleteMaterial(m.id)
                }}>
                    <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </form>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                <Package size={20} />
              </div>
              <div>
                <h4 className="font-bold text-black">{m.name}</h4>
                <p className="text-[10px] uppercase font-black text-gray-400">{m.type} • ${m.unitPrice} / {m.unit}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                {m.stock <= m.minStock && <AlertTriangle size={14} className="text-[#f13d4b]" />}
                <span className={`font-black text-xl ${m.stock <= m.minStock ? "text-[#f13d4b]" : "text-black"}`}>
                    {m.stock}
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Disponibles</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}