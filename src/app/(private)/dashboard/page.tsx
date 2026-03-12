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
  CheckCircle2,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // 1. Verificación de Seguridad
  if (!authUser) redirect("/login")

  // 2. Traer perfil de usuario primero (Punto crítico del error anterior)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id }
  })

  // Si el usuario no existe en Prisma, evitamos que la app explote
  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <AlertCircle size={48} className="text-accent mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tighter">Usuario no sincronizado</h2>
        <p className="text-zinc-500 text-sm mt-2">Registrate de nuevo o verifica tu conexión.</p>
      </div>
    )
  }

  // 3. Carga de datos de negocio en paralelo (Velocidad)
  const [orders, materials] = await Promise.all([
    prisma.order.findMany({
      where: { userId: authUser.id },
      include: { payments: true }
    }),
    prisma.material.findMany({
      where: { userId: authUser.id }
    })
  ])

  // --- LÓGICA DE NEGOCIO ---
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthsNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]

  // Ganancia Neta del Mes Actual
  const monthProfit = orders
    .filter(o => o.status !== 'PRESUPUESTADO' && o.status !== 'CANCELADO' && new Date(o.createdAt) >= startOfMonth)
    .reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  // Cuentas por Cobrar (Deuda total de clientes)
  const pendingCollection = orders
    .filter(o => o.status !== 'ENTREGADO' && o.status !== 'PRESUPUESTADO')
    .reduce((acc, o) => {
      const paid = o.payments?.reduce((pAcc, p) => pAcc + p.amount, 0) || 0
      return acc + (o.totalPrice - paid)
    }, 0)

  // Alertas de Stock
  const stockAlerts = materials.filter(m => m.type !== 'Máquina' && m.stock <= m.minStock).length

  // Próximas Entregas
  const upcomingOrders = orders
    .filter(o => o.status === 'CONFIRMADO' || o.status === 'EN_PROCESO')
    .sort((a, b) => {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Infinity
        const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Infinity
        return dateA - dateB
    })
    .slice(0, 3)

  // --- BANNERS DE ALERTA ---
  const alerts = []
  if (stockAlerts > 0) {
    alerts.push({
      id: 'stock',
      title: 'Reponer Insumos',
      desc: `Tenés ${stockAlerts} materiales bajo el mínimo.`,
      icon: <AlertCircle className="text-orange-500" />,
      color: 'bg-orange-50',
      href: '/dashboard/stock'
    })
  }

  return (
    <div className="space-y-12 pb-32 pt-8 px-4 max-w-6xl mx-auto">
      
      {/* HEADER CON ISOTIPO KODA */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
            <img 
              src="/icon-192x192.png" 
              alt="Koda" 
              className="w-16 h-16 rounded-3xl shadow-2xl rotate-3 border-2 border-white shrink-0" 
            />
            <div>
                <p className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Koda Maker System</p>
                <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase leading-none">
                    Panel de {dbUser.name || "Tu Negocio"}
                </h2>
            </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-zinc-100 shadow-sm">
            <CalendarDays size={18} className="text-accent" />
            <span suppressHydrationWarning className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                {now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </span>
        </div>
      </header>

      {/* ALERTAS DINÁMICAS */}
      {alerts.length > 0 && (
        <div className="space-y-3">
            {alerts.map((alert) => (
                <Link key={alert.id} href={alert.href} className={`${alert.color} p-6 rounded-[35px] flex items-center justify-between border border-white shadow-md transition-all active:scale-95`}>
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
        </div>
      )}

      {/* MÉTRICAS PRINCIPALES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GANANCIA DEL MES */}
        <div className="md:col-span-2 bg-zinc-950 rounded-[50px] p-10 text-white relative overflow-hidden shadow-2xl group">
            <div className="relative z-10 space-y-6">
                <p suppressHydrationWarning className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Ganancia {monthsNames[now.getMonth()]}</p>
                <h3 suppressHydrationWarning className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none transition-transform group-hover:scale-105 duration-700">
                    ${monthProfit.toLocaleString('es-AR')}
                </h3>
                <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase tracking-widest">
                    <TrendingUp size={16} /> <span>Calculado en tiempo real</span>
                </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent rounded-full blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity" />
        </div>

        {/* POR COBRAR */}
        <div className="bg-white rounded-[50px] p-10 border-2 border-zinc-100 shadow-xl flex flex-col justify-between hover:border-accent transition-all duration-500">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-accent">
                    <Wallet size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Por Cobrar</p>
                    <h4 suppressHydrationWarning className="text-4xl font-black text-black tracking-tighter italic">
                        ${pendingCollection.toLocaleString('es-AR')}
                    </h4>
                </div>
            </div>
            <p className="text-[9px] font-black text-zinc-300 uppercase mt-8 italic tracking-widest">Total histórico de deudas</p>
        </div>
      </section>

      {/* SECCIÓN ENTREGAS Y ACCESOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <section className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center px-4">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400">Cronograma de Entregas</h3>
                <Link href="/dashboard/pedidos" className="text-[10px] font-black text-accent uppercase border-b-2 border-accent">Ver todo</Link>
            </div>
            
            <div className="space-y-4">
                {upcomingOrders.length > 0 ? upcomingOrders.map((order) => (
                    <Link key={order.id} href={`/dashboard/pedidos?search=${order.customerName}`} className="bg-white p-6 rounded-[35px] border border-zinc-50 shadow-sm flex justify-between items-center hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-5">
                            <Clock size={24} className="text-zinc-300 group-hover:text-accent transition-colors" />
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
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Sin entregas próximas</p>
                    </div>
                )}
            </div>
          </section>

          <section className="lg:col-span-5 space-y-8">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400 px-4 italic">Accesos Rápidos</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard/pedidos" className="bg-black p-10 rounded-[45px] text-white flex flex-col items-center gap-4 hover:bg-accent transition-all shadow-xl active:scale-95 group">
                        <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-all" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">Pedido</span>
                    </Link>
                    <Link href="/dashboard/inversion" className="bg-zinc-100 p-10 rounded-[45px] text-black flex flex-col items-center gap-4 hover:bg-zinc-200 transition-all active:scale-95 shadow-sm">
                        <Landmark size={32} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">Inversión</span>
                    </Link>
                </div>
          </section>
      </div>
    </div>
  )
}