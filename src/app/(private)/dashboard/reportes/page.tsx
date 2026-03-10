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
  Wallet
} from "lucide-react"
import Link from "next/link"

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

  // 1. GENERAR ESTRUCTURA DE MESES (Últimos 6 meses)
  const monthsNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const last6Months: MonthData[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6Months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      name: monthsNames[d.getMonth()],
      ganancia: 0,
      ventas: 0
    });
  }

  // 2. SUMAR PEDIDOS AL GRÁFICO
  orders.forEach(order => {
    const d = new Date(order.createdAt);
    const m = d.getMonth();
    const y = d.getFullYear();
    const match = last6Months.find(item => item.month === m && item.year === y);
    if (match) {
      match.ganancia += (order.totalPrice - order.totalCost);
      match.ventas += order.totalPrice;
    }
  });

  // 3. RANKING DE PRODUCTOS
  const productStatsMap = new Map<string, ProductStat>();
  orders.forEach(o => {
    o.items.forEach(item => {
      const name = item.template.name;
      const current = productStatsMap.get(name) || { name, qty: 0, revenue: 0 };
      productStatsMap.set(name, {
        name, qty: current.qty + item.quantity,
        revenue: current.revenue + (item.customPrice * item.quantity)
      });
    });
  });
  const topProducts = Array.from(productStatsMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 4);

  // 4. MÉTRICAS GENERALES
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalProfit = orders.reduce((acc, o) => acc + (o.totalPrice - o.totalCost), 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const globalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-12 pb-32 pt-8 px-4 max-w-6xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.5em] mb-1 italic">Koda Business Intelligence</h1>
        <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Analíticas</h2>
      </header>

      {/* MÉTRICAS TOP: Ahora incluimos Ganancia Total para que no haya dudas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MiniStat label="Facturación Total" value={`$${totalRevenue.toLocaleString('es-AR')}`} icon={<ArrowUpRight size={14}/>} color="text-black" />
        <MiniStat label="Ganancia Total" value={`$${totalProfit.toLocaleString('es-AR')}`} icon={<TrendingUp size={14}/>} color="text-green-600" />
        <MiniStat label="Ticket Promedio" value={`$${avgTicket.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`} icon={<Target size={14}/>} color="text-black" />
        <MiniStat label="Operaciones" value={orders.length.toString()} icon={<Package size={14}/>} color="text-black" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GRÁFICO DE RENDIMIENTO */}
        <section className="lg:col-span-8 bg-white p-10 rounded-[50px] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter">Crecimiento Mensual</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Comparativa de ganancias netas</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner text-[#f13d4b]">
                    <BarChart3 size={24} />
                </div>
            </div>
            
            <MonthlyChart data={last6Months} />

            {/* TABLA DE RESUMEN (DEBUG CON ESTILO) */}
            <div className="mt-10 pt-8 border-t border-gray-50 grid grid-cols-6 gap-2">
                {last6Months.map((m) => (
                    <div key={m.name} className="text-center group">
                        <p className="text-[8px] font-black text-gray-300 uppercase group-hover:text-[#f13d4b] transition-colors">{m.name}</p>
                        <p className={`text-[11px] font-black mt-1 ${m.ganancia > 0 ? 'text-black' : 'text-gray-200'}`}>
                            ${m.ganancia > 0 ? m.ganancia.toLocaleString('es-AR') : '0'}
                        </p>
                    </div>
                ))}
            </div>
        </section>

        {/* RANKING DE PRODUCTOS */}
        <section className="lg:col-span-4 bg-black rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <h3 className="font-black text-xl uppercase tracking-tighter mb-10 relative z-10 italic">Más Vendidos</h3>
            <div className="space-y-8 relative z-10 flex-1">
                {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-zinc-700 group-hover:text-[#f13d4b]">0{i+1}</span>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-[#f13d4b] transition-colors">{p.name}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2 tracking-widest">{p.qty} unidades</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-[#f13d4b]">${p.revenue.toLocaleString('es-AR')}</span>
                    </div>
                ))}
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#f13d4b] rounded-full blur-[120px] opacity-20" />
            <div className="mt-10 pt-6 border-t border-zinc-900 relative z-10">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Ranking por facturación</p>
            </div>
        </section>
      </div>

      {/* SALUD FINANCIERA */}
      <section className="bg-white p-12 rounded-[60px] border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-10 relative z-10">
            <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center text-[#f13d4b] shadow-inner shadow-red-100/50">
                <Zap size={48} strokeWidth={2.5} />
            </div>
            <div className="space-y-3">
                <h4 className="text-3xl font-black uppercase tracking-tighter">Salud Financiera</h4>
                <p className="text-base text-gray-400 font-medium max-w-lg leading-relaxed">
                    Tu margen de beneficio real hoy es del <span className="text-black font-black underline decoration-[#f13d4b] decoration-4 underline-offset-8">{globalMargin.toFixed(1)}%</span>.
                    {globalMargin > 40 ? " Tu negocio es altamente rentable." : " Revisá tus costos pronto."}
                </p>
            </div>
        </div>
        <Link href="/dashboard/templates" className="w-full lg:w-auto px-12 py-6 bg-black text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#f13d4b] transition-all shadow-2xl active:scale-95 text-center relative z-10">
            Optimizar Catálogo
        </Link>
      </section>
    </div>
  )
}

function MiniStat({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm space-y-3 group hover:border-[#f13d4b] transition-all duration-500">
            <div className="flex items-center gap-2 text-gray-300 group-hover:text-[#f13d4b] transition-colors">
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className={`text-3xl font-black tracking-tighter leading-none italic ${color}`}>{value}</p>
        </div>
    )
}