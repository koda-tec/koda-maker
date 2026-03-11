import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Wallet, ArrowDownCircle, BarChart3, TrendingDown, Landmark, Plus, ShoppingBag } from "lucide-react"
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

  const totalInvested = purchases.reduce((acc, p) => acc + p.totalAmount, 0)
  const stockValue = materials.reduce((acc, m) => acc + (m.stock * m.unitPrice), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 pt-8 px-4">
      <header>
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1 italic">Finanzas</h1>
        <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Inversión</h2>
      </header>

      {/* FORMULARIO DE NUEVA COMPRA */}
      <section className="bg-white p-8 md:p-12 rounded-[45px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-6 bg-black rounded-full" />
            <h3 className="font-black uppercase text-sm tracking-widest text-zinc-800">Registrar Nueva Compra</h3>
        </div>

        <form action={registerPurchase} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Material Comprado</label>
                    <select name="materialId" className="w-full p-5 bg-zinc-50 border-none rounded-[25px] font-bold outline-none focus:ring-2 focus:ring-[#f13d4b] appearance-none" required>
                        <option value="">Seleccionar material...</option>
                        {materials.map(m => (
                            <option key={m.id} value={m.id}>{m.name} (Actual: ${m.unitPrice})</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Cantidad</label>
                        <input name="quantity" type="number" step="0.01" placeholder="0" className="w-full p-5 bg-zinc-50 border-none rounded-[25px] font-bold outline-none" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Nuevo Precio Unit.</label>
                        <input name="unitPrice" type="number" step="0.01" placeholder="$" className="w-full p-5 bg-zinc-50 border-none rounded-[25px] font-bold outline-none" required />
                    </div>
                </div>
            </div>
            <SubmitButton label="Registrar Inversión" />
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-black rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden">
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Total Invertido Histórico</p>
            <h3 className="text-6xl font-black tracking-tighter">${totalInvested.toLocaleString('es-AR')}</h3>
            <div className="mt-8 flex items-center gap-3 text-zinc-400 text-xs font-bold">
                <ShoppingBag size={18} /> <span>Capital total destinado a compras</span>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#f13d4b] rounded-full blur-[90px] opacity-20" />
        </div>

        <div className="bg-white rounded-[50px] p-10 border-2 border-zinc-100 shadow-sm flex flex-col justify-between">
            <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Valor Patrimonial del Stock</p>
                <h3 className="text-6xl font-black text-black tracking-tighter">${stockValue.toLocaleString('es-AR')}</h3>
            </div>
            <div className="mt-8 flex items-center gap-3 text-green-600 text-xs font-bold bg-green-50 p-4 rounded-3xl">
                <Landmark size={20} /> <span>Dinero disponible en materiales a precio de hoy</span>
            </div>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="font-black uppercase text-sm tracking-widest ml-6 italic">Últimos Movimientos</h3>
        <div className="bg-white rounded-[45px] border border-zinc-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100">
                            <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Fecha</th>
                            <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Insumo</th>
                            <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Cantidad</th>
                            <th className="p-8 text-[10px] font-black uppercase text-zinc-400 text-right">Monto Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {purchases.map((p) => (
                            <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors group">
                                <td suppressHydrationWarning className="p-8 text-sm font-bold text-zinc-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="p-8 text-sm font-black uppercase tracking-tighter text-black">{p.material.name}</td>
                                <td className="p-8 text-sm font-bold text-zinc-500">{p.quantity} {p.material.unit}</td>
                                <td className="p-8 text-lg font-black text-right text-black group-hover:text-[#f13d4b] transition-colors">${p.totalAmount.toLocaleString('es-AR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {purchases.length === 0 && (
                <div className="py-20 text-center text-zinc-300 font-bold uppercase text-xs tracking-widest">No hay compras registradas</div>
            )}
        </div>
      </section>
    </div>
  )
}