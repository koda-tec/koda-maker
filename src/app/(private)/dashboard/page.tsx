import { createClient } from "@/lib/supabase-server" // Nota: Necesitaremos crear este pequeño helper
import { cookies } from "next/headers"

export default async function DashboardPage() {
  // En Next.js 15+, recuperamos el usuario así en Server Components
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const businessName = user?.user_metadata?.full_name || "Emprendedor"

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Panel Principal</h1>
        <h2 className="text-3xl font-black text-black">¡Hola, {businessName}! 👋</h2>
      </header>

      {/* Grid de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pedidos Activos" value="0" color="bg-black" />
        <StatCard title="Stock Bajo" value="0" color="bg-[#f13d4b]" />
        <StatCard title="Ganancia Mes" value="$0" color="bg-green-600" />
      </div>

      <div className="p-12 border-2 border-dashed border-gray-200 rounded-32px flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <Package size={32} />
        </div>
        <div>
            <h3 className="font-bold text-lg">No hay pedidos registrados</h3>
            <p className="text-gray-500 text-sm">Comienza cargando tus materiales para calcular costos.</p>
        </div>
        <button className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm">
            + Nuevo Pedido
        </button>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-1">
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{title}</p>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-2xl font-black">{value}</span>
      </div>
    </div>
  )
}
import { Package } from "lucide-react"