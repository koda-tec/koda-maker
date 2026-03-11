import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Wallet, ArrowDownCircle, BarChart3, Landmark, ShoppingBag, History } from "lucide-react"
import { registerPurchase } from "./actions"
import { SubmitButton } from "@/components/SubmitButton"

export default async function InversionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [purchases, materials] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: user?.id },
      include: { material: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.material.findMany({ 
        where: { userId: user?.id },
        orderBy: { name: 'asc' }
    })
  ])

  // 1. TOTAL INVERTIDO: Suma de todas las compras realizadas
  const totalInvested = purchases.reduce((acc, p) => acc + p.totalAmount, 0)

  // 2. VALOR DEL STOCK: Filtramos para EXCLUIR "Máquina"
  // Solo sumamos lo que es tangible (Insumos, 3D, Láser)
  const stockValue = materials
    .filter(m => m.type !== 'Máquina') 
    .reduce((acc, m) => acc + (m.stock * m.unitPrice), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32 pt-6 px-2 md:px-4">
      <header className="px-2">
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1 italic">Capital y Compras</h1>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Inversión</h2>
      </header>

      {/* FORMULARIO DE COMPRA */}
      <section className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100 mx-2 md:mx-0">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-black rounded-full" />
            <h3 className="font-black uppercase text-xs tracking-widest text-zinc-800 italic">Registrar Nueva Compra</h3>
        </div>

        <form action={registerPurchase} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Insumo adquirido</label>
                    <select name="materialId" className="w-full p-4 bg-zinc-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#f13d4b] appearance-none cursor-pointer" required>
                        <option value="">Seleccionar...</option>
                        {materials.filter(m => m.type !== 'Máquina').map(m => (
                            <option key={m.id} value={m.id}>{m.name} (Actual: ${m.unitPrice})</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Cantidad</label>
                        <input name="quantity" type="number" step="0.01" placeholder="0" className="w-full p-4 bg-zinc-50 border-none rounded-2xl font-bold outline-none" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Precio Unit. $</label>
                        <input name="unitPrice" type="number" step="0.01" placeholder="$" className="w-full p-4 bg-zinc-50 border-none rounded-2xl font-bold outline-none" required />
                    </div>
                </div>
            </div>
            <SubmitButton label="Registrar Compra" />
        </form>
      </section>

      {/* CARDS DE TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2 md:px-0">
        <div className="bg-black rounded-[45px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Inversión Total Acumulada</p>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none break-all">
                ${totalInvested.toLocaleString('es-AR')}
            </h3>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#f13d4b] rounded-full blur-[80px] opacity-20" />
        </div>

        <div className="bg-white rounded-[45px] p-8 md:p-10 border-2 border-zinc-100 shadow-sm flex flex-col justify-between">
            <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Valor Físico del Stock</p>
                <h3 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none break-all">
                    ${stockValue.toLocaleString('es-AR')}
                </h3>
            </div>
            <div className="mt-6 flex items-center gap-2 text-green-600 text-[10px] font-black uppercase bg-green-50 p-3 rounded-2xl w-fit">
                <Landmark size={14} /> <span>Excluye horas de máquina</span>
            </div>
        </div>
      </div>

      {/* HISTORIAL */}
      <section className="space-y-6">
        <h3 className="font-black uppercase text-xs tracking-widest ml-6 flex items-center gap-2">
            <History size={16} className="text-[#f13d4b]" /> Registro de Movimientos
        </h3>
        
        {/* VISTA MÓVIL */}
        <div className="md:hidden space-y-4 px-2">
            {purchases.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-[35px] border border-zinc-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                        <span suppressHydrationWarning className="text-[10px] font-black text-zinc-300 uppercase">{new Date(p.createdAt).toLocaleDateString()}</span>
                        <span className="text-lg font-black text-black">${p.totalAmount.toLocaleString('es-AR')}</span>
                    </div>
                    <p className="font-black uppercase text-sm tracking-tight">{p.material.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400">COMPRA: {p.quantity} {p.material.unit} x ${p.unitPrice}</p>
                </div>
            ))}
        </div>

        {/* VISTA DESKTOP */}
        <div className="hidden md:block bg-white rounded-[45px] border border-zinc-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Fecha</th>
                        <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Material</th>
                        <th className="p-8 text-[10px] font-black uppercase text-zinc-400 text-center">Cantidad</th>
                        <th className="p-8 text-[10px] font-black uppercase text-zinc-400 text-right">Monto Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors group">
                            <td suppressHydrationWarning className="p-8 text-sm font-bold text-zinc-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="p-8 text-sm font-black uppercase text-black">{p.material.name}</td>
                            <td className="p-8 text-sm font-bold text-zinc-500 text-center">{p.quantity} {p.material.unit}</td>
                            <td className="p-8 text-lg font-black text-right text-black group-hover:text-[#f13d4b] transition-colors">${p.totalAmount.toLocaleString('es-AR')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {purchases.length === 0 && (
            <div className="py-20 text-center text-zinc-300 font-bold uppercase text-xs tracking-widest italic">No se registraron compras todavía.</div>
        )}
      </section>
    </div>
  )
}