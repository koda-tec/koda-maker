import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { MonthlyChart } from "@/components/AnalyticsCharts"
import { 
  BarChart3, 
  Target, 
  ArrowUpRight, 
  Package, 
  Users, 
  Zap,
  TrendingUp,
  History,
  Calendar
} from "lucide-react"
import Link from "next/link"

// --- INTERFACES ---
interface MonthData {
  month: number;
  year: number;
  name: string;
  ganancia: number;
  ventas: number;
}

interface ProductStat {
  name: string;
  qty: number;
  revenue: number;
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. OBTENER DATOS
  const orders = await prisma.order.findMany({
    where: { 
        userId: user?.id,
        status: { in: ['CONFIRMADO', 'ENTREGADO', 'EN_PROCESO'] }
    },
    include: { items: { include: { template: true } } }
  })

  // --- LÓGICA DE TIEMPO ---
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // 2. CÁLCULOS HISTÓRICOS (Todo el tiempo)
  const totalRevenueAllTime = orders.reduce((acc, o) => acc + o.totalPrice, 0)
  const totalProfitAllTime = orders.reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)
  const globalMargin = totalRevenueAllTime > 0 ? (totalProfitAllTime / totalRevenueAllTime) * 100 : 0

  // 3. CÁLCULOS MES ACTUAL
  const currentMonthOrders = orders.filter(o => new Date(o.createdAt) >= startOfMonth)
  const totalRevenueMonth = currentMonthOrders.reduce((acc, o) => acc + o.totalPrice, 0)
  const totalProfitMonth = currentMonthOrders.reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  // 4. PROCESAR ÚLTIMOS 6 MESES PARA GRÁFICO
  const monthsNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
  const last6Months: MonthData[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    last6Months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      name: monthsNames[d.getMonth()],
      ganancia: 0,
      ventas: 0
    })
  }

  orders.forEach(order => {
    const d = new Date(order.createdAt)
    const match = last6Months.find(m => m.month === d.getMonth() && m.year === d.getFullYear())
    if (match) {
      match.ganancia += (order.totalPrice - order.totalCost)
      match.ventas += order.totalPrice
    }
  })

  // 5. RANKING DE PRODUCTOS
  const productStatsMap = new Map<string, ProductStat>()
  orders.forEach(o => {
    o.items.forEach(item => {
      const name = item.template.name
      const current = productStatsMap.get(name) || { name, qty: 0, revenue: 0 }
      productStatsMap.set(name, { name, qty: current.qty + item.quantity, revenue: current.revenue + (item.customPrice * item.quantity) })
    })
  })
  const topProducts = Array.from(productStatsMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 4)

  return (
    <div className="space-y-12 pb-32 pt-8 px-4 max-w-6xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.5em] mb-1 italic">Koda Maker System</h1>
        <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Analíticas</h2>
      </header>

      {/* SECCIÓN: RENDIMIENTO DEL MES VIGENTE */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
            <Calendar className="text-[#f13d4b]" size={20} />
            <h3 className="font-black uppercase text-sm tracking-widest text-black underline decoration-[#f13d4b] decoration-2 underline-offset-4">Mes en Curso ({monthsNames[now.getMonth()]})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[45px] border-2 border-zinc-100 shadow-sm flex justify-between items-center group hover:border-black transition-all">
                <div>
                    <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mb-2">Facturación Mensual</p>
                    <h4 className="text-5xl font-black text-black tracking-tighter">${totalRevenueMonth.toLocaleString('es-AR')}</h4>
                </div>
                <ArrowUpRight className="text-zinc-200 group-hover:text-black transition-colors" size={40} />
            </div>
            <div className="bg-green-50 p-10 rounded-[45px] border-2 border-green-200 flex justify-between items-center group hover:bg-green-100 transition-all">
                <div>
                    <p className="text-[11px] font-black uppercase text-green-700 tracking-widest mb-2">Ganancia Neta Mensual</p>
                    <h4 className="text-5xl font-black text-green-900 tracking-tighter">${totalProfitMonth.toLocaleString('es-AR')}</h4>
                </div>
                <TrendingUp className="text-green-300 group-hover:text-green-600 transition-colors" size={40} />
            </div>
        </div>
      </section>

      {/* SECCIÓN: HISTÓRICO TOTAL ACUMULADO */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
            <History className="text-zinc-400" size={20} />
            <h3 className="font-black uppercase text-sm tracking-widest text-black">Historial Completo</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MiniStat label="Facturación Total" value={`$${totalRevenueAllTime.toLocaleString('es-AR')}`} icon={<ArrowUpRight size={14}/>} dark />
            <MiniStat label="Ganancia Total" value={`$${totalProfitAllTime.toLocaleString('es-AR')}`} icon={<TrendingUp size={14}/>} dark />
            <MiniStat label="Ticket Promedio" value={`$${(totalRevenueAllTime / (orders.length || 1)).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`} icon={<Target size={14}/>} />
            <MiniStat label="Operaciones" value={orders.length.toString()} icon={<Package size={14}/>} />
        </div>
      </section>

      {/* GRÁFICO Y PRODUCTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 bg-white p-10 rounded-[50px] shadow-xl border border-zinc-100">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter text-black">Flujo de Ganancia</h3>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Beneficio neto de los últimos 6 meses</p>
                </div>
                <BarChart3 className="text-[#f13d4b]" size={32} />
            </div>
            <MonthlyChart data={last6Months} />
        </section>

        <section className="lg:col-span-4 bg-black rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <h3 className="font-black text-xl uppercase tracking-tighter mb-10 relative z-10 italic underline decoration-[#f13d4b]">Top Productos</h3>
            <div className="space-y-8 relative z-10 flex-1">
                {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-zinc-700">0{i+1}</span>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight leading-none text-zinc-100">{p.name}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2 tracking-widest">{p.qty} unidades</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-[#f13d4b]">${p.revenue.toLocaleString('es-AR')}</span>
                    </div>
                ))}
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#f13d4b] rounded-full blur-[120px] opacity-20" />
        </section>
      </div>

      {/* SALUD FINANCIERA (RENTABILIDAD) */}
      <section className="bg-white p-12 rounded-[60px] border-4 border-zinc-50 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm">
        <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center text-[#f13d4b] shadow-inner">
                <Zap size={48} strokeWidth={2.5} />
            </div>
            <div className="space-y-3">
                <h4 className="text-3xl font-black uppercase tracking-tighter text-black">Eficiencia del Negocio</h4>
                <p className="text-lg text-zinc-500 font-medium max-w-lg leading-relaxed">
                    Tu rentabilidad global acumulada es del <span className="text-black font-black underline decoration-[#f13d4b] decoration-4 underline-offset-8">{globalMargin.toFixed(1)}%</span>. 
                    {globalMargin > 50 ? " El negocio es muy saludable." : " Revisa tus márgenes."}
                </p>
            </div>
        </div>
        <Link href="/dashboard/templates" className="w-full lg:w-auto px-12 py-6 bg-black text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#f13d4b] transition-all shadow-2xl active:scale-95 text-center">
            Ajustar Catálogo
        </Link>
      </section>
    </div>
  )
}

function MiniStat({ label, value, icon, dark = false }: { label: string, value: string, icon: any, dark?: boolean }) {
    return (
        <div className={`p-8 rounded-[40px] border shadow-sm space-y-3 transition-all duration-500 ${dark ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-zinc-100 text-black'}`}>
            <div className={`flex items-center gap-2 ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-3xl font-black tracking-tighter leading-none italic">{value}</p>
        </div>
    )
}