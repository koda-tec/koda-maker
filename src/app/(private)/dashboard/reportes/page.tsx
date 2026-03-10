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
  TrendingUp
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

  // 1. GENERAR MESES (Lógica ultra-segura)
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

  // 2. SUMAR PEDIDOS
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

  // 3. RANKING
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

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalCost = orders.reduce((acc, o) => acc + o.totalCost, 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const globalMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-10 pb-32 pt-6 px-4">
      <header>
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1 italic">Koda Analytics</h1>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Rendimiento</h2>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Ventas Brutas" value={`$${totalRevenue.toLocaleString('es-AR')}`} icon={<ArrowUpRight size={14}/>} />
        <MiniStat label="Promedio" value={`$${avgTicket.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`} icon={<Target size={14}/>} />
        <MiniStat label="Operaciones" value={orders.length.toString()} icon={<Package size={14}/>} />
        <MiniStat label="Clientes" value={[...new Set(orders.map(o => o.customerName))].length.toString()} icon={<Users size={14}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 bg-white p-8 rounded-[45px] shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="font-black text-lg uppercase tracking-tighter">Flujo de Ganancia</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Últimos 6 meses</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner text-[#f13d4b]">
                    <BarChart3 size={24} />
                </div>
            </div>
            {/* GRÁFICO */}
            <MonthlyChart data={last6Months} />
        </section>

        <section className="lg:col-span-4 bg-black rounded-[45px] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <h3 className="font-black text-lg uppercase tracking-tighter mb-8 relative z-10 italic">Top Ventas</h3>
            <div className="space-y-7 relative z-10 flex-1">
                {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-zinc-700">0{i+1}</span>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight leading-none">{p.name}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1.5 tracking-widest">{p.qty} un.</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-[#f13d4b]">${p.revenue.toLocaleString('es-AR')}</span>
                    </div>
                ))}
            </div>
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#f13d4b] rounded-full blur-[100px] opacity-20" />
        </section>
      </div>

      <section className="bg-white p-10 rounded-[50px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center text-[#f13d4b]">
                <Zap size={40} />
            </div>
            <div className="space-y-2 text-center md:text-left">
                <h4 className="text-2xl font-black uppercase tracking-tighter">Margen Real</h4>
                <p className="text-sm text-gray-400 font-medium max-w-md leading-relaxed">
                    Tu rentabilidad neta actual es del <span className="text-black font-black underline decoration-[#f13d4b] underline-offset-4">{globalMargin.toFixed(1)}%</span>.
                </p>
            </div>
        </div>
        <Link href="/dashboard/templates" className="w-full md:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 text-center">
            Optimizar Plantillas
        </Link>
      </section>
    </div>
  )
}

function MiniStat({ label, value, icon }: { label: string, value: string, icon: any }) {
    return (
        <div className="bg-white p-6 rounded-[35px] border border-gray-50 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-gray-300">
                {icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xl font-black text-black tracking-tighter leading-none italic">{value}</p>
        </div>
    )
}