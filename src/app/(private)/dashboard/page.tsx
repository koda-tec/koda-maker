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
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Lógica de fechas para el Mes Actual
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { payments: true }
  })

  // Ganancia del MES ACTUAL (Venta - Costo) de pedidos confirmados/entregados
  const monthProfit = orders
    .filter(o => o.status !== 'PRESUPUESTADO' && new Date(o.createdAt) >= startOfMonth)
    .reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  // Total Histórico por cobrar (Deuda de clientes)
  const pendingCollection = orders
    .filter(o => o.status !== 'ENTREGADO' && o.status !== 'PRESUPUESTADO')
    .reduce((acc, o) => {
      const paid = o.payments.reduce((pAcc, p) => pAcc + p.amount, 0)
      return acc + (o.totalPrice - paid)
    }, 0)

  // Alertas de Stock
  const stockAlerts = await prisma.material.count({
    where: { 
      userId: user?.id,
      stock: { lte: prisma.material.fields.minStock } 
    }
  })

  // Próximas Entregas (Top 4)
  const upcomingOrders = await prisma.order.findMany({
    where: { 
      userId: user?.id, 
      status: { in: ['CONFIRMADO', 'EN_PROCESO'] } 
    },
    orderBy: { deliveryDate: 'asc' },
    take: 4
  })

  const businessName = user?.user_metadata?.full_name || "Emprendedor"

  return (
    <div className="space-y-12 pb-32 pt-8 px-2 md:px-0">
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em]">
                <div className="w-2 h-2 bg-[#f13d4b] rounded-full animate-pulse" />
                Sistema En Línea
            </div>
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Panel de {businessName}</h2>
        </div>
        <div className="flex items-center gap-2 bg-gray-100/50 p-2 rounded-2xl border border-gray-100">
            <CalendarDays size={16} className="text-gray-400" />
        <span suppressHydrationWarning className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
            {now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </span>
        </div>
      </header>

      {/* MÉTRICAS PRINCIPALES (BENTO GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-black rounded-[45px] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-6">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Ganancia Neta del Mes</p>
                <h3 className="text-7xl font-black tracking-tighter leading-none italic">${monthProfit.toLocaleString('es-AR')}</h3>
                <div className="flex items-center gap-2 text-green-400 font-bold text-xs">
                    <TrendingUp size={16} />
                    <span>Calculado tras descontar materiales y tiempo de máquina</span>
                </div>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#f13d4b] rounded-full blur-[100px] opacity-20" />
        </div>

        <div className="bg-white rounded-[45px] p-10 border border-gray-100 shadow-xl flex flex-col justify-between group hover:border-[#f13d4b] transition-all duration-500">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#f13d4b]">
                    <Wallet size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Cuentas por Cobrar</p>
                    <h4 className="text-3xl font-black text-black tracking-tighter">${pendingCollection.toLocaleString('es-AR')}</h4>
                </div>
            </div>
            <p className="text-[10px] font-bold text-gray-300 uppercase mt-4 italic">Plata en la calle de pedidos activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* PRÓXIMAS ENTREGAS MEJORADO */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center px-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-black">Próximas Entregas</h3>
                <Link href="/dashboard/pedidos" className="text-[10px] font-black text-gray-400 hover:text-black uppercase underline decoration-[#f13d4b]">Ver todo</Link>
            </div>
            <div className="space-y-4">
                {upcomingOrders.length > 0 ? upcomingOrders.map((order) => (
                    <Link 
                        key={order.id} 
                        href={`/dashboard/pedidos?search=${order.customerName}`} // CORRECCIÓN: Ahora envía al pedido
                        className="bg-white p-6 rounded-32px border border-gray-50 shadow-sm flex justify-between items-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:text-black transition-colors">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tighter leading-none mb-1">{order.customerName}</h4>
                                <p suppressHydrationWarning className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic flex items-center gap-1">
                                    <CalendarDays size={10} /> Entrega: {order.deliveryDate?.toLocaleDateString('es-AR', {day: '2-digit', month: 'long'})}
                                </p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-full text-gray-300 group-hover:bg-black group-hover:text-white transition-all">
                            <ArrowRight size={16} />
                        </div>
                    </Link>
                )) : (
                    <div className="bg-gray-50 p-12 rounded-[40px] border-2 border-dashed border-gray-200 text-center text-gray-400 font-medium">
                        Cero entregas pendientes para hoy.
                    </div>
                )}
            </div>
          </section>

          {/* STOCK Y ACCIONES */}
          <section className="lg:col-span-5 space-y-10">
             {/* ALERTA DE STOCK TIPO APPLE */}
             <Link href="/dashboard/stock" className={`block p-8 rounded-[40px] border-2 transition-all duration-500 ${stockAlerts > 0 ? 'bg-orange-50 border-orange-100 animate-pulse' : 'bg-white border-gray-50'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stockAlerts > 0 ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-300'}`}>
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <h5 className="font-black text-xl tracking-tighter uppercase leading-none">{stockAlerts} Alertas</h5>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Materiales bajo el mínimo</p>
                    </div>
                </div>
             </Link>

             {/* ACCIONES RÁPIDAS */}
             <div className="space-y-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-black px-4 italic">Accesos Directos</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard/pedidos" className="bg-black p-10 rounded-[40px] text-white flex flex-col items-center gap-4 hover:bg-[#f13d4b] transition-all shadow-xl active:scale-95 group">
                        <Plus size={32} className="group-hover:rotate-90 transition-all duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nuevo Pedido</span>
                    </Link>
                    <Link href="/dashboard/stock" className="bg-zinc-100 p-10 rounded-[40px] text-black flex flex-col items-center gap-4 hover:bg-zinc-200 transition-all active:scale-95">
                        <Package size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ver Stock</span>
                    </Link>
                </div>
             </div>
          </section>
      </div>
    </div>
  )
}