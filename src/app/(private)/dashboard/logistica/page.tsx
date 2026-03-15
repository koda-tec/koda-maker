import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  Truck, MapPin, Globe, Clock, Calendar, 
  Search, Phone, PackageCheck, AlertCircle,
  ExternalLink, ChevronRight
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

  // Buscamos solo pedidos que NO estén entregados ni presupuestados
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
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-6 px-4">
      <header className="space-y-6">
        <div>
          <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Operaciones Logísticas</h1>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Hoja de Ruta</h2>
        </div>

        {/* BUSCADOR INTELIGENTE */}
        <div className="flex flex-col gap-4">
            <form className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-accent transition-colors" size={20} />
                <input 
                    name="search"
                    placeholder="Buscar por #Pedido o Nombre..." 
                    defaultValue={searchQuery}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-zinc-100 rounded-[30px] outline-none focus:ring-2 focus:ring-accent shadow-sm font-bold"
                />
            </form>
            
            {/* PESTAÑAS DE FILTRO (TABS) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <FilterTab label="Todos" value="ALL" active={methodFilter === 'ALL'} />
                <FilterTab label="Retiros" value="PICKUP" active={methodFilter === 'PICKUP'} icon={<MapPin size={14}/>} />
                <FilterTab label="Locales" value="LOCAL" active={methodFilter === 'LOCAL'} icon={<Truck size={14}/>} />
                <FilterTab label="Nacionales" value="NATIONWIDE" active={methodFilter === 'NATIONWIDE'} icon={<Globe size={14}/>} />
            </div>
        </div>
      </header>

      {/* LISTADO DINÁMICO */}
      <div className="space-y-4">
        {orders.map(order => (
            <div key={order.id} className="bg-white p-6 md:p-8 rounded-[45px] border border-zinc-100 shadow-sm space-y-6 relative overflow-hidden group hover:shadow-xl transition-all">
                {/* Indicador lateral de color */}
                <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full ${
                    order.deliveryMethod === 'PICKUP' ? 'bg-accent' : 
                    order.deliveryMethod === 'LOCAL' ? 'bg-blue-500' : 'bg-green-500'
                }`} />

                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-accent bg-red-50 px-2 py-0.5 rounded-lg">#0{order.orderNumber}</span>
                            {order.isFromStore && <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1"><Globe size={10}/> Tienda</span>}
                        </div>
                        <h4 className="font-black text-2xl uppercase tracking-tighter text-black">{order.customerName}</h4>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-2xl text-center min-w-20">
                        <p className="text-[8px] font-black text-zinc-400 uppercase">Entrega</p>
                        <p suppressHydrationWarning className="text-sm font-black text-black uppercase">
                            {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-AR', {day:'2-digit', month:'short'}) : 'S/D'}
                        </p>
                    </div>
                </div>

                {/* DIRECCIÓN Y DETALLES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.deliveryMethod !== 'PICKUP' && (
                        <div className="bg-zinc-50 p-5 rounded-[30px] border border-zinc-100">
                            <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                                <MapPin size={12} className="text-accent"/> Destino
                            </p>
                            <p className="text-xs font-bold text-zinc-700 leading-relaxed italic">
                                {order.shippingAddress || "Dirección pendiente de carga"}
                            </p>
                        </div>
                    )}
                    
                    <div className="bg-zinc-50 p-5 rounded-[30px] border border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                            <Clock size={12} className="text-accent"/> Info Retiro
                        </p>
                        <p className="text-xs font-bold text-zinc-700 leading-relaxed">
                            {order.deliveryMethod === 'PICKUP' ? "Cliente retira por taller" : "Requiere despacho externo"}
                        </p>
                    </div>
                </div>

                {/* ALERTA DE COTIZACIÓN PARA NACIONALES */}
                {order.deliveryMethod === 'NATIONWIDE' && order.shippingCost === 0 && (
                    <div className="p-6 bg-red-50 rounded-[35px] border border-red-100 animate-pulse">
                        <p className="text-[10px] font-black text-accent uppercase mb-3 text-center tracking-widest">⚠️ Falta cotizar envío</p>
                        <form action={async (formData) => {
                            "use server"
                            const cost = parseFloat(formData.get("cost") as string)
                            await updateShippingPrice(order.id, cost)
                        }} className="flex gap-2">
                            <input name="cost" type="number" placeholder="Monto $" className="flex-1 p-4 bg-white rounded-2xl text-sm font-black outline-none border-none shadow-inner" required />
                            <button className="bg-accent text-white px-6 rounded-2xl font-black uppercase text-[10px] active:scale-95 transition-all">OK</button>
                        </form>
                    </div>
                )}

                {/* BOTONERA DE ACCIÓN */}
                <div className="flex gap-3 pt-2">
                    <a href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`} target="_blank" className="flex-1 py-5 bg-zinc-100 text-zinc-400 rounded-[25px] flex items-center justify-center hover:text-accent transition-all active:scale-95 shadow-inner">
                        <Phone size={22} />
                    </a>
                    <form action={async () => { "use server"; await dispatchOrder(order.id) }} className="flex-3">
                        <button className="w-full py-5 bg-black text-white rounded-[25px] font-black uppercase text-xs tracking-widest shadow-xl shadow-zinc-200 active:scale-95 flex items-center justify-center gap-3">
                            <PackageCheck size={20} /> Finalizar & Despachar
                        </button>
                    </form>
                </div>
            </div>
        ))}

        {orders.length === 0 && (
            <div className="py-24 text-center bg-zinc-50 rounded-[60px] border-2 border-dashed border-zinc-200">
                <Truck className="mx-auto text-zinc-200 mb-4" size={56} />
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No hay tareas de logística pendientes</p>
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
            className={`flex items-center gap-2 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${active ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-zinc-400 border-zinc-100 hover:text-black'}`}
        >
            {icon} {label}
        </Link>
    )
}