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
import { ExportExcel } from "@/components/ExportExcel"

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
  const monthsNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]

  // 1. CÁLCULOS HISTÓRICOS (Todo el historial)
  const totalRevenueAllTime = orders.reduce((acc, o) => acc + o.totalPrice, 0)
  const totalProfitAllTime = orders.reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)
  const globalMargin = totalRevenueAllTime > 0 ? (totalProfitAllTime / totalRevenueAllTime) * 100 : 0

  // 2. CÁLCULOS MES VIGENTE
  const currentMonthOrders = orders.filter(o => new Date(o.createdAt) >= startOfMonth)
  const totalRevenueMonth = currentMonthOrders.reduce((acc, o) => acc + o.totalPrice, 0)
  const totalProfitMonth = currentMonthOrders.reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0)

  // 3. GENERAR ÚLTIMOS 6 MESES PARA GRÁFICO
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
  });

  // 4. RANKING PRODUCTOS
  const productStatsMap = new Map<string, ProductStat>()
  orders.forEach(o => {
    o.items.forEach(item => {
      const name = item.template.name
      const current = productStatsMap.get(name) || { name, qty: 0, revenue: 0 }
      productStatsMap.set(name, { name, qty: current.qty + item.quantity, revenue: current.revenue + (item.customPrice * item.quantity) })
    })
  })
  const topProducts = Array.from(productStatsMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 4)

const dataForExcel = orders.map(o => ({
    Fecha: new Date(o.createdAt).toLocaleDateString('es-AR'),
    Cliente: o.customerName,
    Producto: o.items[0]?.template.name || 'Varios',
    Cantidad: o.items[0]?.quantity || 0,
    Total: o.totalPrice,
    Costo: o.totalCost,
    Ganancia: o.totalPrice - o.totalCost,
    Estado: o.status
}));


  return (
 <div className="space-y-12 pb-32 pt-8 px-4 max-w-6xl mx-auto">
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div>
          <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.5em] mb-1 italic">Koda Business Intelligence</h1>
          <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Analíticas</h2>
      </div>
      
      {/* BOTÓN DE EXCEL */}
      <ExportExcel 
        data={dataForExcel} 
        fileName={`Reporte-SyG-${new Date().getMonth() + 1}`} 
        sheetName="Ventas" 
      />
    </header>

      {/* BLOQUE 1: MES VIGENTE (Claridad de datos actuales) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
            <Calendar className="text-accent" size={20} />
            <h3 suppressHydrationWarning className="font-black uppercase text-sm tracking-widest text-black underline decoration-accent decoration-2 underline-offset-8">
                Rendimiento de {monthsNames[now.getMonth()]}
            </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[45px] border-2 border-zinc-100 shadow-sm flex justify-between items-center group hover:border-black transition-all">
                <div>
                    <p className="text-[11px] font-black uppercase text-zinc-700 tracking-widest mb-2 italic">Facturación del Mes</p>
                    <h4 className="text-5xl font-black text-black tracking-tighter">${totalRevenueMonth.toLocaleString('es-AR')}</h4>
                </div>
                <ArrowUpRight className="text-zinc-200 group-hover:text-black transition-colors" size={40} />
            </div>
            <div className="bg-green-50 p-10 rounded-[45px] border-2 border-green-200 flex justify-between items-center group hover:bg-green-100 transition-all">
                <div>
                    <p className="text-[11px] font-black uppercase text-green-700 tracking-widest mb-2 italic">Ganancia Neta del Mes</p>
                    <h4 className="text-5xl font-black text-green-900 tracking-tighter">${totalProfitMonth.toLocaleString('es-AR')}</h4>
                </div>
                <TrendingUp className="text-green-300 group-hover:text-green-600 transition-colors" size={40} />
            </div>
        </div>
      </section>

      {/* BLOQUE 2: HISTÓRICO TOTAL (Toda la vida del sistema) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
            <History className="text-zinc-500" size={20} />
            <h3 className="font-black uppercase text-sm tracking-widest text-black">Acumulado Histórico</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MiniStat label="Facturación Total" value={`$${totalRevenueAllTime.toLocaleString('es-AR')}`} icon={<ArrowUpRight size={14}/>} dark />
            <MiniStat label="Ganancia Total" value={`$${totalProfitAllTime.toLocaleString('es-AR')}`} icon={<TrendingUp size={14}/>} dark />
            <MiniStat label="Ticket Promedio" value={`$${(totalRevenueAllTime / (orders.length || 1)).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`} icon={<Target size={14}/>} />
            <MiniStat label="Operaciones" value={orders.length.toString()} icon={<Package size={14}/>} />
        </div>
      </section>

      {/* GRÁFICO Y RANKING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GRÁFICO: Se mantiene el contenedor que funcionaba */}
       {/* GRÁFICO DE RENDIMIENTO */}
        <section className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[50px] shadow-xl border border-zinc-100 flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter text-black">Flujo de Ganancia</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 italic">Comparativa mensual</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-accent">
                    <BarChart3 size={24} />
                </div>
            </div>
            
            {/* EL GRÁFICO (Fuera de cualquier div con scroll para que no se rompa el ancho) */}
            <div className="w-full">
                <MonthlyChart data={last6Months} />
            </div>

            {/* LA TABLA (Solo esto tiene scroll si los números se pisan) */}
            <div className="mt-8 pt-8 border-t border-gray-100 overflow-x-auto no-scrollbar">
                <div className="flex justify-between items-center min-w-100 md:min-w-full px-2">
                    {last6Months.map((m) => (
                        <div key={m.name} className="flex-1 text-center group">
                            <p suppressHydrationWarning className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter group-hover:text-accent transition-colors">
                                {m.name}
                            </p>
                            <p suppressHydrationWarning className={`text-[11px] font-black mt-1 ${m.ganancia > 0 ? 'text-black' : 'text-zinc-300'}`}>
                                ${m.ganancia > 0 ? m.ganancia.toLocaleString('es-AR') : '0'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* MÁS VENDIDOS */}
        <section className="lg:col-span-4 bg-black rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <h3 className="font-black text-xl uppercase tracking-tighter mb-10 relative z-10 italic">Top Ventas</h3>
            <div className="space-y-8 relative z-10 flex-1">
                {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-zinc-700 group-hover:text-accent">0{i+1}</span>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight leading-none text-zinc-100">{p.name}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2 tracking-widest">{p.qty} unidades</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-white">${p.revenue.toLocaleString('es-AR')}</span>
                    </div>
                ))}
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent rounded-full blur-[120px] opacity-20" />
        </section>
      </div>

      {/* SALUD FINANCIERA */}
      <section className="bg-white p-12 rounded-[60px] border-2 border-zinc-100 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-10 relative z-10">
            <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center text-accent shadow-inner shadow-red-100/50">
                <Zap size={48} strokeWidth={2.5} />
            </div>
            <div className="space-y-3">
                <h4 className="text-3xl font-black uppercase tracking-tighter text-black">Eficiencia Operativa</h4>
                <p className="text-base text-zinc-700 font-medium max-w-lg leading-relaxed">
                    Tu margen de beneficio global es del <span className="text-black font-black underline decoration-accent decoration-4 underline-offset-8">{globalMargin.toFixed(1)}%</span>.
                    {globalMargin > 40 ? " ¡El negocio es muy saludable!" : " Deberías revisar tus precios."}
                </p>
            </div>
        </div>
        <Link href="/dashboard/templates" className="w-full lg:w-auto px-12 py-6 bg-black text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-accent transition-all shadow-2xl active:scale-95 text-center relative z-10">
            Optimizar Plantillas
        </Link>
      </section>
    </div>
  )
}

function MiniStat({ label, value, icon, dark = false }: { label: string, value: string, icon: any, dark?: boolean }) {
    return (
        <div className={`p-8 rounded-[40px] border shadow-sm space-y-3 transition-all duration-500 ${dark ? 'bg-zinc-950 border-zinc-800 text-white shadow-zinc-200' : 'bg-white border-zinc-100 text-black'}`}>
            <div className={`flex items-center gap-2 ${dark ? 'text-zinc-600' : 'text-zinc-700'}`}>
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-3xl font-black tracking-tighter leading-none italic">{value}</p>
        </div>
    )
}