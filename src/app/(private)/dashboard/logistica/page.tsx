import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  Truck, MapPin, Globe, Clock, Calendar, 
  Search, Phone, PackageCheck, AlertTriangle, 
  ChevronRight, Info
} from "lucide-react"
import { dispatchOrder, updateShippingPrice } from "./actions"
import Link from "next/link"

export default async function LogisticaPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ search?: string, method?: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const query = await searchParams
  
  const methodFilter = query.method || 'ALL'
  const searchQuery = query.search || ""
  const orderNumberQuery = /^\d+$/.test(searchQuery) ? parseInt(searchQuery) : undefined

  const today = new Date()
  today.setHours(0,0,0,0)

  const orders = await prisma.order.findMany({
    where: { 
        userId: user?.id,
        status: { in: ['CONFIRMADO', 'EN_PROCESO', 'LISTO'] },
        ...(methodFilter !== 'ALL' ? { deliveryMethod: methodFilter as any } : {}),
        AND: [
            {
                OR: [
                    { customerName: { contains: searchQuery, mode: 'insensitive' } },
                    orderNumberQuery ? { orderNumber: orderNumberQuery } : {},
                ]
            }
        ]
    },
    orderBy: { deliveryDate: 'asc' }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32 pt-6 px-4">
      <header className="space-y-6">
        <div>
          <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Shipping Center</h1>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Hoja de Ruta</h2>
        </div>

        {/* BUSCADOR */}
        <div className="flex flex-col gap-4">
            <form className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-accent transition-colors" size={20} />
                <input name="search" placeholder="Buscar por #Pedido o Nombre..." defaultValue={searchQuery} className="w-full pl-14 pr-6 py-5 bg-white border border-zinc-100 rounded-[30px] outline-none focus:ring-2 focus:ring-accent shadow-sm font-bold" />
            </form>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <FilterTab label="Todos" value="ALL" active={methodFilter === 'ALL'} />
                <FilterTab label="Retiros" value="PICKUP" active={methodFilter === 'PICKUP'} icon={<MapPin size={14}/>} />
                <FilterTab label="Locales" value="LOCAL" active={methodFilter === 'LOCAL'} icon={<Truck size={14}/>} />
                <FilterTab label="Nacionales" value="NATIONWIDE" active={methodFilter === 'NATIONWIDE'} icon={<Globe size={14}/>} />
            </div>
        </div>
      </header>

      {/* LISTADO CON ALERTAS */}
      <div className="space-y-6">
        {orders.map(order => {
          const isOverdue = order.deliveryDate && new Date(order.deliveryDate) < today;
          const missingInfo = (order.deliveryMethod !== 'PICKUP' && !order.shippingAddress) || !order.customerPhone;

          return (
            <div key={order.id} className={`bg-white p-6 md:p-8 rounded-[45px] border-2 transition-all relative overflow-hidden ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-zinc-100 shadow-sm'}`}>
                
                {/* ALERTAS CRÍTICAS */}
                {isOverdue && (
                    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white py-1 text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em]">⚠️ ENVÍO ATRASADO - PRIORIDAD ALTA</p>
                    </div>
                )}

                <div className="flex justify-between items-start pt-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-accent bg-red-50 px-2 py-0.5 rounded-lg border border-accent/10">#0{order.orderNumber}</span>
                            {order.isFromStore && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">Vía Web</span>}
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter text-black">{order.customerName}</h4>
                    </div>
                    <div className={`p-3 rounded-2xl text-center min-w-90px border ${isOverdue ? 'bg-red-500 text-white border-red-400' : 'bg-zinc-50 text-zinc-400 border-zinc-100'}`}>
                        <p className="text-[8px] font-black uppercase opacity-80">{isOverdue ? 'Expiró' : 'Fecha'}</p>
                        <p suppressHydrationWarning className="text-sm font-black uppercase">
                            {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-AR', {day:'2-digit', month:'short'}) : 'S/D'}
                        </p>
                    </div>
                </div>

                {/* ALERTA DE DATOS FALTANTES */}
                {missingInfo && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-600">
                        <AlertTriangle size={18} />
                        <p className="text-[10px] font-bold uppercase leading-tight">Faltan datos de contacto o dirección para despachar.</p>
                    </div>
                )}

                {/* DIRECCIÓN */}
                {order.deliveryMethod !== 'PICKUP' && (
                    <div className="bg-zinc-50 p-5 rounded-[30px] border border-zinc-100 flex items-start gap-3">
                        <MapPin size={16} className="text-accent shrink-0 mt-1"/>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dirección de Entrega</p>
                            <p className="text-sm font-bold text-zinc-700 italic leading-snug">{order.shippingAddress || "DIRECCIÓN PENDIENTE DE CARGA"}</p>
                        </div>
                    </div>
                )}

                {/* BOTONERA */}
                <div className="flex gap-3 pt-4">
                    <a href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`} className="flex-1 py-5 bg-zinc-100 text-zinc-400 rounded-[25px] flex items-center justify-center hover:text-accent transition-all shadow-inner">
                        <Phone size={22} />
                    </a>
                    <form action={async () => { "use server"; await dispatchOrder(order.id) }} className="flex-3">
                        <button className="w-full py-5 bg-black text-white rounded-[25px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3">
                            <PackageCheck size={20} /> Finalizar & Despachar
                        </button>
                    </form>
                </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FilterTab({ label, value, active, icon }: any) {
    return (
        <Link 
            href={value === 'ALL' ? '/dashboard/logistica' : `?method=${value}`}
            className={`flex items-center gap-2 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${active ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-zinc-400 border-zinc-100 hover:text-black'}`}
        >
            {icon} {label}
        </Link>
    )
}