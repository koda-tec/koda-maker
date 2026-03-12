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
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Seguridad: Si no hay usuario autenticado, no procesamos nada
  if (!authUser) return null;

  // 1. Datos de tiempo
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthsNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]

  // 2. Carga de datos con protección
  const [orders, materials, dbUser] = await Promise.all([
    prisma.order.findMany({
      where: { userId: authUser.id },
      include: { payments: true }
    }),
    prisma.material.findMany({
      where: { userId: authUser.id }
    }),
    prisma.user.findUnique({
      where: { id: authUser.id }
    })
  ])

  // 3. Lógica de Negocio segura
  const monthProfit = orders
    .filter(o => o.status !== 'PRESUPUESTADO' && o.status !== 'CANCELADO' && new Date(o.createdAt) >= startOfMonth)
    .reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  const pendingCollection = orders
    .filter(o => o.status !== 'ENTREGADO' && o.status !== 'PRESUPUESTADO' && o.status !== 'CANCELADO')
    .reduce((acc, o) => {
      const paid = o.payments.reduce((pAcc, p) => pAcc + p.amount, 0)
      return acc + (o.totalPrice - paid)
    }, 0)

  const upcomingOrders = orders
    .filter(o => o.status === 'CONFIRMADO' || o.status === 'EN_PROCESO')
    .sort((a, b) => {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Infinity
        const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Infinity
        return dateA - dateB
    })
    .slice(0, 4)

  const stockAlertsCount = materials.filter(m => m.type !== 'Máquina' && m.stock <= m.minStock).length

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
    o.status !== 'ENTREGADO' && o.deliveryDate && new Date(o.deliveryDate).toLocaleDateString() === todayStr
  ).length

  if (deliveriesToday > 0) {
    alerts.push({
      title: 'Entregas para Hoy',
      desc: `Tenés ${deliveriesToday} pedido(s) pendientes hoy.`,
      icon: <BellRing size={20} className="text-accent" />,
      color: 'bg-red-50',
      href: '/dashboard/pedidos'
    })
  }

  return (
    <div className="space-y-12 pb-32 pt-8 px-2 md:px-0 max-w-6xl mx-auto">
      
      {/* HEADER CON LOGO DINÁMICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-5">
            <img 
              src="/icon-192x192.png" 
              alt="Koda" 
              className="w-16 h-16 rounded-3xl shadow-2xl rotate-3 border-2 border-white shrink-0" 
              onError={(e) => (e.currentTarget.style.display = 'none')} // Protección si la imagen no existe
            />
            <div>
                <p className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Koda Maker System</p>
                <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase leading-none">
                    Panel de {dbUser?.name || "Tu Negocio"}
                </h2>
            </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm text-zinc-500">
            <CalendarDays size={18} />
            <span suppressHydrationWarning className="text-[10px] font-black uppercase tracking-widest">
                {now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </span>
        </div>
      </header>

      {/* ALERTAS */}
      {alerts.length > 0 && (
        <section className="px-4 space-y-3">
            {alerts.map((alert, i) => (
                <Link key={i} href={alert.href} className={`${alert.color} p-6 rounded-[35px] flex items-center justify-between border border-white shadow-md transition-transform active:scale-95`}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm">{alert.icon}</div>
                        <div>
                            <p className="text-xs font-black uppercase text-zinc-800">{alert.title}</p>
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
                <p suppressHydrationWarning className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Ganancia {monthsNames[now.getMonth()]}</p>
                <h3 suppressHydrationWarning className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none">
                    ${monthProfit.toLocaleString('es-AR')}
                </h3>
                <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase tracking-widest">
                    <TrendingUp size={16} /> <span>Calculado en tiempo real</span>
                </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent rounded-full blur-[120px] opacity-20" />
        </div>

        <div className="bg-white rounded-[50px] p-10 border-2 border-zinc-100 shadow-xl flex flex-col justify-between hover:border-accent transition-all">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-accent">
                    <Wallet size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Cuentas por Cobrar</p>
                    <h4 suppressHydrationWarning className="text-4xl font-black text-black tracking-tighter italic">
                        ${pendingCollection.toLocaleString('es-AR')}
                    </h4>
                </div>
            </div>
            <p className="text-[9px] font-black text-zinc-300 uppercase mt-8 italic tracking-widest text-right w-full">Total deudores</p>
        </div>
      </section>

      {/* ENTREGAS Y ACCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
          <section className="lg:col-span-7 space-y-6">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400 px-4">Cronograma Próximo</h3>
            <div className="space-y-4">
                {upcomingOrders.length > 0 ? upcomingOrders.map((order) => (
                    <Link key={order.id} href={`/dashboard/pedidos?search=${order.customerName}`} className="bg-white p-6 rounded-[35px] border border-zinc-50 shadow-sm flex justify-between items-center hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:text-black transition-colors">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tighter mb-1 leading-none">{order.customerName}</h4>
                                <p suppressHydrationWarning className="text-[10px] font-bold text-zinc-400 uppercase italic">
                                    Entrega: {order.deliveryDate?.toLocaleDateString('es-AR', {day: '2-digit', month: 'long'})}
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={20} className="text-zinc-200 group-hover:text-black transition-all" />
                    </Link>
                )) : (
                    <div className="bg-zinc-50/50 p-16 rounded-[50px] border-2 border-dashed border-zinc-100 text-center space-y-3">
                        <CheckCircle2 className="mx-auto text-zinc-200" size={40} />
                        <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest italic">Nada pendiente por ahora</p>
                    </div>
                )}
            </div>
          </section>

          <section className="lg:col-span-5 space-y-10">
             <div className="space-y-4">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400 px-2">Accesos Directos</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard/pedidos" className="bg-black p-10 rounded-[45px] text-white flex flex-col items-center gap-4 hover:bg-accent transition-all shadow-xl group active:scale-95">
                        <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-all" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">Nuevo Pedido</span>
                    </Link>
                    <Link href="/dashboard/inversion" className="bg-white p-10 rounded-[45px] text-black flex flex-col items-center gap-4 hover:bg-zinc-100 transition-all shadow-md border border-zinc-100 active:scale-95">
                        <Landmark size={30} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">Inversión</span>
                    </Link>
                </div>
             </div>
          </section>
      </div>
    </div>
  )
}