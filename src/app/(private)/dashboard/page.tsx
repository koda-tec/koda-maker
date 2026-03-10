import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  Clock, 
  Package, 
  ChevronRight,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Cálculos de Dinero y Estados
  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { payments: true }
  })

  // Ganancia Total (Venta - Costo) de pedidos que NO son presupuestos
  const totalProfit = orders
    .filter(o => o.status !== 'PRESUPUESTADO')
    .reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  // Cuentas por Cobrar (Saldos pendientes de pedidos no entregados)
  const pendingCollection = orders
    .filter(o => o.status !== 'ENTREGADO' && o.status !== 'PRESUPUESTADO')
    .reduce((acc, o) => {
      const paid = o.payments.reduce((pAcc, p) => pAcc + p.amount, 0)
      return acc + (o.totalPrice - paid)
    }, 0)

  // 2. Alertas de Stock
  const stockAlerts = await prisma.material.count({
    where: { 
      userId: user?.id,
      stock: { lte: prisma.material.fields.minStock } // Stock menor o igual al mínimo
    }
  })

  // 3. Próximas Entregas (Top 3)
  const upcomingOrders = await prisma.order.findMany({
    where: { 
      userId: user?.id, 
      status: { in: ['CONFIRMADO', 'EN_PROCESO'] } 
    },
    orderBy: { deliveryDate: 'asc' },
    take: 3
  })

  const businessName = user?.user_metadata?.full_name || "Emprendedor"

  return (
    <div className="space-y-10 pb-20 pt-4">
      <header className="px-2">
        <h1 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] mb-1">Resumen General</h1>
        <h2 className="text-3xl font-black text-black tracking-tighter">¡Hola, {businessName}! 👋</h2>
      </header>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title="Ganancia Acumulada" 
            value={`$${totalProfit.toLocaleString()}`} 
            icon={<TrendingUp size={20}/>} 
            color="text-green-600"
            desc="Basado en pedidos confirmados"
        />
        <StatCard 
            title="Por Cobrar" 
            value={`$${pendingCollection.toLocaleString()}`} 
            icon={<Wallet size={20}/>} 
            color="text-[#f13d4b]"
            desc="Dinero pendiente de clientes"
        />
        <Link href="/dashboard/stock">
            <StatCard 
                title="Alertas de Stock" 
                value={stockAlerts.toString()} 
                icon={<AlertCircle size={20}/>} 
                color={stockAlerts > 0 ? "text-orange-500" : "text-gray-400"}
                desc="Insumos por debajo del mínimo"
            />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* PRÓXIMAS ENTREGAS */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Próximas Entregas</h3>
                <Link href="/dashboard/pedidos" className="text-[10px] font-black text-[#f13d4b] uppercase">Ver todo</Link>
            </div>
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                {upcomingOrders.length > 0 ? upcomingOrders.map((order) => (
                    <div key={order.id} className="p-6 border-b border-gray-50 last:border-0 flex justify-between items-center hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#f13d4b]">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase tracking-tighter">{order.customerName}</p>
                                <p className="text-[10px] font-bold text-gray-400">Entrega: {order.deliveryDate?.toLocaleDateString()}</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </div>
                )) : (
                    <div className="p-10 text-center text-gray-400 text-sm italic">No hay entregas pendientes.</div>
                )}
            </div>
          </section>

          {/* ACCESOS RÁPIDOS */}
          <section className="space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 px-2">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
                <QuickActionLink href="/dashboard/pedidos" label="Nuevo Pedido" icon={<Plus size={20}/>} color="bg-black" />
                <QuickActionLink href="/dashboard/stock" label="Cargar Stock" icon={<Package size={20}/>} color="bg-[#f13d4b]" />
            </div>
          </section>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-3 relative overflow-hidden group">
      <div className={`${color} bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-black tracking-tighter">{value}</h4>
      </div>
      <p className="text-[9px] font-bold text-gray-300 uppercase">{desc}</p>
    </div>
  )
}

function QuickActionLink({ href, label, icon, color }: any) {
    return (
        <Link href={href} className={`${color} p-8 rounded-[40px] text-white flex flex-col items-center justify-center gap-3 shadow-xl active:scale-95 transition-all`}>
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </Link>
    )
}
import { Plus } from "lucide-react"