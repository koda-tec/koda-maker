import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  Clock, 
  Package, 
  ChevronRight, 
  Plus, 
  CalendarDays, 
  ArrowRight, 
  BellRing, 
  Landmark,
  ShoppingCart,
  CheckCircle2 // <-- Icono que faltaba
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // 1. Datos de tiempo y constantes de visualización
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthsNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]

  // 2. Carga de datos en paralelo
  const [orders, materials, dbUser] = await Promise.all([
    prisma.order.findMany({
      where: { userId: authUser?.id },
      include: { payments: true }
    }),
    prisma.material.findMany({
      where: { userId: authUser?.id }
    }),
    prisma.user.findUnique({
      where: { id: authUser?.id }
    })
  ])

  // 3. Lógica de Negocio
  
  // Ganancia Neta del Mes Actual
  const monthProfit = orders
    .filter(o => 
        o.status !== 'PRESUPUESTADO' && 
        o.status !== 'CANCELADO' && 
        new Date(o.createdAt) >= startOfMonth
    )
    .reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  // Cuentas por Cobrar
  const pendingCollection = orders
    .filter(o => o.status !== 'ENTREGADO' && o.status !== 'PRESUPUESTADO' && o.status !== 'CANCELADO')
    .reduce((acc, o) => {
      const paid = o.payments.reduce((pAcc, p) => pAcc + p.amount, 0)
      return acc + (o.totalPrice - paid)
    }, 0)

  // Alertas de Stock
  const lowStockMaterials = materials.filter(m => m.type !== 'Máquina' && m.stock <= m.minStock)
  const stockAlertsCount = lowStockMaterials.length

  // Próximas Entregas
  const upcomingOrders = orders
    .filter(o => o.status === 'CONFIRMADO' || o.status === 'EN_PROCESO')
    .sort((a, b) => {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Infinity
        const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Infinity
        return dateA - dateB
    })
    .slice(0, 4)

  // 4. Banners de Alerta
  const alerts = []
  
  if (stockAlertsCount > 0) {
    alerts.push({
      title: 'Reponer Stock',
      desc: `Hay ${stockAlertsCount} materiales bajo el mínimo.`,
      icon: <AlertCircle size={20} className="text-orange-500" />,
      color: 'bg-orange-50',
      href: '/dashboard/stock'
    })
  }

  const todayStr = now.toLocaleDateString()
  const deliveriesToday = orders.filter(o => 
    o.status !== 'ENTREGADO' && 
    o.deliveryDate && 
    new Date(o.deliveryDate).toLocaleDateString() === todayStr
  ).length

  if (deliveriesToday > 0) {
    alerts.push({
      title: 'Entregas para Hoy',
      desc: `Tenés ${deliveriesToday} pedido(s) pendientes para hoy.`,
      icon: <BellRing size={20} className="text-[#f13d4b]" />,
      color: 'bg-red-50',
      href: '/dashboard/pedidos'
    })
  }

  return (
    <div className="space-y-12 pb-32 pt-8 px-2 md:px-0 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center shadow-2xl rotate-3 shrink-0">
                <span className="text-white font-black text-3xl italic">K</span>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1 italic">Koda Maker System</p>
                <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase leading-none">
                    Panel de {dbUser?.name || "Tu Negocio"}
                </h2>
            </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <CalendarDays size={18} className="text-[#f13d4b]" />
            <span suppressHydrationWarning className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                {now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </span>
        </div>
      </header>

      {/* ALERTAS */}
      {alerts.length > 0 && (
        <section className="px-4 space-y-3">
            {alerts.map((alert, i) => (
                <Link key={i} href={alert.href} className={`${alert.color} p-6 rounded-[35px] flex items-center justify-between border border-white shadow-md animate-in fade-in slide-in-from-left duration-500`}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm">{alert.icon}</div>
                        <div>
                            <p className="text-xs font-black uppercase text-zinc-800 tracking-tight">{alert.title}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">{alert.desc}</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300" />
                </Link>
            ))}
        </section>
      )}

      {/* MÉTRICAS (BENTO GRID) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <div className="md:col-span-2 bg-zinc-950 rounded-[50px] p-10 text-white relative overflow-hidden shadow-2xl group">
            <div className="relative z-10 space-y-6">
                <p suppressHydrationWarning className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Ganancia Neta {monthsNames[now.getMonth()]}</p>
                <h3 suppressHydrationWarning className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none transition-transform group-hover:scale-105 duration-700">
                    ${monthProfit.toLocaleString('es-AR')}
                </h3>
                <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase tracking-widest">
                    <TrendingUp size={16} /> <span>Calculado en tiempo real</span>
                </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#f13d4b] rounded-full blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity" />
        </div>

        <div className="bg-white rounded-[50px] p-10 border-2 border-zinc-100 shadow-xl flex flex-col justify-between hover:border-[#f13d4b] transition-all duration-500">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#f13d4b]">
                    <Wallet size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Cuentas por Cobrar</p>
                    <h4 suppressHydrationWarning className="text-4xl font-black text-black tracking-tighter italic">
                        ${pendingCollection.toLocaleString('es-AR')}
                    </h4>
                </div>
            </div>
            <p className="text-[9px] font-black text-zinc-300 uppercase mt-8 italic tracking-widest">Saldos pendientes de clientes</p>
        </div>
      </section>

      {/* ENTREGAS Y ACCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
          <section className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center px-2">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400">Próximas Entregas</h3>
                <Link href="/dashboard/pedidos" className="text-[10px] font-black text-[#f13d4b] uppercase border-b-2 border-[#f13d4b]">Ver todo</Link>
            </div>
            
            <div className="space-y-4">
                {upcomingOrders.length > 0 ? upcomingOrders.map((order) => (
                    <Link key={order.id} href={`/dashboard/pedidos?search=${order.customerName}`} className="bg-white p-6 rounded-[35px] border border-zinc-50 shadow-sm flex justify-between items-center hover:shadow-xl hover:scale-[1.02] transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:text-black transition-colors shadow-inner">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tighter mb-1 leading-none">{order.customerName}</h4>
                                <p suppressHydrationWarning className="text-[10px] font-bold text-zinc-400 uppercase italic tracking-widest">
                                    Entrega: {order.deliveryDate?.toLocaleDateString('es-AR', {day: '2-digit', month: 'long'})}
                                </p>
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-50 rounded-full text-zinc-300 group-hover:bg-black group-hover:text-white transition-all">
                            <ArrowRight size={18} />
                        </div>
                    </Link>
                )) : (
                    <div className="bg-zinc-50/50 p-16 rounded-[50px] border-2 border-dashed border-zinc-100 text-center space-y-3">
                        <CheckCircle2 className="mx-auto text-zinc-200" size={40} />
                        <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest">No hay entregas pendientes</p>
                    </div>
                )}
            </div>
          </section>

          <section className="lg:col-span-5 space-y-10">
             <div className="space-y-4">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Accesos Directos</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard/pedidos" className="bg-black p-10 rounded-[45px] text-white flex flex-col items-center gap-4 hover:bg-[#f13d4b] transition-all shadow-xl active:scale-95 group">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            <Plus size={32} strokeWidth={3} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">Nuevo Pedido</span>
                    </Link>
                    <Link href="/dashboard/inversion" className="bg-white p-10 rounded-[45px] text-black flex flex-col items-center gap-4 hover:bg-zinc-100 transition-all shadow-md border border-zinc-100 active:scale-95">
                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center">
                            <Landmark size={30} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">Inversión</span>
                    </Link>
                </div>
             </div>

             <Link href="/dashboard/stock" className="flex items-center justify-between p-8 bg-zinc-50 rounded-[40px] hover:bg-zinc-100 transition-all group border border-zinc-100 shadow-inner">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-black transition-all">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-zinc-400">Inventario</p>
                        <h5 className="font-black text-lg tracking-tighter uppercase leading-none">Ver Materiales</h5>
                    </div>
                </div>
                <ChevronRight size={20} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
             </Link>
          </section>
      </div>
    </div>
  )
}