import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Truck, MapPin, Globe, Clock, Calendar, Search, Phone, ChevronRight, PackageCheck, CheckCircle2 } from "lucide-react"
import { updateShippingInfo } from "./actions"
import Link from "next/link"

export default async function LogisticaPage({ searchParams }: { searchParams: Promise<{ search?: string, method?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const query = await searchParams
  
  const methodFilter = query.method || 'ALL'
  const searchQuery = query.search || ""
  const isNumericSearch = /^\d+$/.test(searchQuery)
  const orderNumberQuery = isNumericSearch ? parseInt(searchQuery) : undefined

  // Buscamos pedidos que estén listos para entregar o en proceso
  const orders = await prisma.order.findMany({
    where: { 
        userId: user?.id,
        status: { in: ['CONFIRMADO', 'EN_PROCESO', 'LISTO'] },
        // Filtro por método
        ...(methodFilter !== 'ALL' ? { deliveryMethod: methodFilter as any } : {}),
        // Filtro por nombre o número de pedido
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
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-6 px-4">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1">Despachos</h1>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Hoja de Ruta</h2>
        </div>

        {/* BUSCADOR Y FILTROS MÓVILES */}
        <div className="flex flex-col gap-4">
            <form className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-accent" size={18} />
                <input 
                    name="search"
                    placeholder="Buscar por #Pedido o Nombre..." 
                    defaultValue={searchQuery}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-100 rounded-[25px] outline-none focus:ring-2 focus:ring-accent shadow-sm font-bold text-sm"
                />
            </form>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <FilterTab label="Todos" value="ALL" active={methodFilter === 'ALL'} />
                <FilterTab label="Retiros" value="PICKUP" active={methodFilter === 'PICKUP'} icon={<MapPin size={12}/>} />
                <FilterTab label="Locales" value="LOCAL" active={methodFilter === 'LOCAL'} icon={<Truck size={12}/>} />
                <FilterTab label="Nacionales" value="NATIONWIDE" active={methodFilter === 'NATIONWIDE'} icon={<Globe size={12}/>} />
            </div>
        </div>
      </header>

      {/* LISTA DE TAREAS LOGÍSTICAS */}
      <div className="space-y-4">
        {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[40px] border border-zinc-100 shadow-sm space-y-5 relative overflow-hidden">
                {/* Indicador de Tipo de Envío */}
                <div className={`absolute right-0 top-12 w-1 h-12 rounded-l-full ${
                    order.deliveryMethod === 'PICKUP' ? 'bg-accent' : 
                    order.deliveryMethod === 'LOCAL' ? 'bg-blue-500' : 'bg-green-500'
                }`} />

                <div className="flex justify-between items-start pr-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-accent bg-red-50 px-2 py-0.5 rounded-lg">#00{order.orderNumber}</span>
                            {order.isFromStore && (
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                    <Globe size={10}/> Tienda
                                </span>
                            )}
                        </div>
                        <h4 className="font-black text-2xl uppercase tracking-tighter text-black">{order.customerName}</h4>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-400 uppercase">Entrega</p>
                        <p suppressHydrationWarning className="text-sm font-black text-black italic">
                            {order.deliveryDate?.toLocaleDateString('es-AR', {day:'2-digit', month:'short'})}
                        </p>
                    </div>
                </div>

                {/* DIRECCIÓN SI ES ENVÍO */}
                {order.deliveryMethod !== 'PICKUP' && (
                    <div className="bg-zinc-50 p-5 rounded-[30px] border border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 flex items-center gap-2">
                            <MapPin size={12} className="text-accent"/> Dirección de Destino
                        </p>
                        <p className="text-sm font-bold text-zinc-700 leading-relaxed italic">
                            {order.shippingAddress || "Dirección no cargada"}
                        </p>
                    </div>
                )}

                {/* FORMULARIO DE COSTO PARA NACIONALES */}
                {order.deliveryMethod === 'NATIONWIDE' && order.shippingCost === 0 && (
                    <div className="p-5 bg-red-50 rounded-[30px] border border-red-100">
                        <p className="text-[10px] font-black text-accent uppercase mb-3">Cotizar Envío Nacional</p>
                        <form action={updateShippingInfo} className="flex gap-2">
                            <input type="hidden" name="orderId" value={order.id} />
                            <input name="shippingCost" type="number" placeholder="Monto $" className="flex-1 p-3 bg-white rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-accent" />
                            <button className="bg-accent text-white px-4 rounded-xl active:scale-95 transition-all"><CheckCircle2 size={20}/></button>
                        </form>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <a href={`https://wa.me/${order.customerPhone}`} className="flex-1 py-4 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-black transition-all shadow-inner">
                        <Phone size={20} />
                    </a>
                    <button className="flex-3 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-zinc-200 active:scale-95 flex items-center justify-center gap-2">
                        <PackageCheck size={16} /> Marcar como Despachado
                    </button>
                </div>
            </div>
        ))}

        {orders.length === 0 && (
            <div className="py-20 text-center bg-zinc-50 rounded-[50px] border-2 border-dashed border-zinc-200">
                <Truck className="mx-auto text-zinc-200 mb-4" size={48} />
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No hay envíos en esta categoría</p>
            </div>
        )}
      </div>
    </div>
  )
}

function FilterTab({ label, value, active, icon }: any) {
    return (
        <Link 
            href={value === 'ALL' ? '/dashboard/logistica' : `?method=${value}`}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-black text-white shadow-xl' : 'bg-white text-zinc-400 border border-zinc-100'}`}
        >
            {icon} {label}
        </Link>
    )
}