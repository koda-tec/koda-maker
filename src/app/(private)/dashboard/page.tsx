import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  TrendingUp, Wallet, AlertCircle, Clock, Package, 
  ChevronRight, Plus, CalendarDays, ArrowRight, 
  CheckCircle2, Landmark 
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return null

  // Consultas secuenciales para evitar fallos de paralelismo
  const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } })
  if (!dbUser) return <div className="p-20 text-center font-black uppercase">Error: Usuario no sincronizado en DB</div>

  const orders = await prisma.order.findMany({
    where: { userId: authUser.id },
    include: { payments: true }
  }) || []

  const materials = await prisma.material.findMany({
    where: { userId: authUser.id }
  }) || []

  // Lógica de fechas
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthsNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]

  // Cálculos protegidos con default 0
  const monthProfit = orders
    .filter(o => o.status !== 'PRESUPUESTADO' && o.status !== 'CANCELADO' && new Date(o.createdAt) >= startOfMonth)
    .reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  const pendingCollection = orders
    .filter(o => o.status !== 'ENTREGADO' && o.status !== 'PRESUPUESTADO')
    .reduce((acc, o) => {
      const paid = o.payments?.reduce((pAcc, p) => pAcc + p.amount, 0) || 0
      return acc + (o.totalPrice - paid)
    }, 0)

  const stockAlerts = materials.filter(m => m.type !== 'Máquina' && m.stock <= m.minStock).length

  const upcomingOrders = orders
    .filter(o => o.status === 'CONFIRMADO' || o.status === 'EN_PROCESO')
    .slice(0, 4)

  return (
    <div className="space-y-12 pb-32 pt-8 px-4 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
                <span className="text-white font-black text-3xl italic">K</span>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Koda Maker System</p>
                <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase leading-none">
                    Panel de {dbUser.name || "Tu Negocio"}
                </h2>
            </div>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
            <CalendarDays size={18} className="text-accent" />
            <span suppressHydrationWarning className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                {now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </span>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-zinc-950 rounded-[50px] p-10 text-white relative overflow-hidden shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4">Ganancia Neta {monthsNames[now.getMonth()]}</p>
            <h3 suppressHydrationWarning className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none relative z-10">
                ${monthProfit.toLocaleString('es-AR')}
            </h3>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent rounded-full blur-[120px] opacity-20" />
        </div>
        <div className="bg-white rounded-[50px] p-10 border-2 border-zinc-100 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
                <Wallet size={24} className="text-accent" />
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Por Cobrar</p>
                <h4 suppressHydrationWarning className="text-4xl font-black text-black tracking-tighter italic">
                    ${pendingCollection.toLocaleString('es-AR')}
                </h4>
            </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400 px-4 italic">Próximas Entregas</h3>
            <div className="space-y-4">
                {upcomingOrders.map((order) => (
                    <Link key={order.id} href={`/dashboard/pedidos?search=${order.customerName}`} className="bg-white p-6 rounded-[35px] border border-zinc-50 shadow-sm flex justify-between items-center hover:scale-[1.02] transition-all group">
                        <div className="flex items-center gap-5">
                            <Clock size={24} className="text-zinc-300 group-hover:text-black transition-colors" />
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tighter leading-none">{order.customerName}</h4>
                                <p suppressHydrationWarning className="text-[10px] font-bold text-zinc-400 uppercase italic">
                                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "S/D"}
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={20} className="text-zinc-200 group-hover:text-black transition-all" />
                    </Link>
                ))}
                {upcomingOrders.length === 0 && <p className="text-center py-10 text-zinc-300 uppercase text-[10px] font-black tracking-widest">Sin entregas pendientes</p>}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/pedidos" className="bg-black p-10 rounded-[45px] text-white flex flex-col items-center gap-4 shadow-xl active:scale-95">
                    <Plus size={32} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Pedido</span>
                </Link>
                <Link href="/dashboard/stock" className="bg-zinc-100 p-10 rounded-[45px] text-black flex flex-col items-center gap-4 active:scale-95">
                    <Package size={32} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Stock</span>
                </Link>
          </section>
      </div>
    </div>
  )
}