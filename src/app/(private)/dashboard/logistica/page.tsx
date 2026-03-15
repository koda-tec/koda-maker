import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Truck, MapPin, Globe, Clock, Calendar, CheckCircle2, ExternalLink, Phone } from "lucide-react"
import { updateShippingInfo } from "./actions" // Crearemos esto ahora

export default async function LogisticaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const orders = await prisma.order.findMany({
    where: { 
        userId: user?.id,
        status: { in: ['CONFIRMADO', 'EN_PROCESO', 'LISTO'] }
    },
    orderBy: { deliveryDate: 'asc' }
  })

  const pickups = orders.filter(o => o.deliveryMethod === 'PICKUP')
  const localShipping = orders.filter(o => o.deliveryMethod === 'LOCAL')
  const nationalShipping = orders.filter(o => o.deliveryMethod === 'NATIONWIDE')

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 pt-6 px-4">
      <header>
        <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Logística & Despachos</h1>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Hoja de Ruta</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: RETIROS POR TALLER */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-4">
                <MapPin size={18} className="text-accent" />
                <h3 className="font-black uppercase text-xs tracking-widest text-zinc-800">Retiros ({pickups.length})</h3>
            </div>
            {pickups.map(order => (
                <LogisticsCard key={order.id} order={order} icon={<Clock size={16}/>} />
            ))}
        </section>

        {/* COLUMNA 2: ENVÍOS LOCALES */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-4">
                <Truck size={18} className="text-blue-500" />
                <h3 className="font-black uppercase text-xs tracking-widest text-zinc-800">Locales ({localShipping.length})</h3>
            </div>
            {localShipping.map(order => (
                <LogisticsCard key={order.id} order={order} icon={<Truck size={16}/>} showAddress />
            ))}
        </section>

        {/* COLUMNA 3: ENVÍOS NACIONALES */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-4">
                <Globe size={18} className="text-green-500" />
                <h3 className="font-black uppercase text-xs tracking-widest text-zinc-800">Nacionales ({nationalShipping.length})</h3>
            </div>
            {nationalShipping.map(order => (
                <LogisticsCard key={order.id} order={order} icon={<Globe size={16}/>} showShippingForm />
            ))}
        </section>
      </div>
    </div>
  )
}

function LogisticsCard({ order, icon, showAddress = false, showShippingForm = false }: any) {
    return (
        <div className="bg-white p-6 rounded-[35px] border border-zinc-100 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-black text-lg uppercase tracking-tighter leading-none">{order.customerName}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10}/> {order.deliveryDate?.toLocaleDateString()}
                    </p>
                </div>
                {order.isFromStore && (
                    <span className="bg-zinc-100 text-zinc-500 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Vía Web</span>
                )}
            </div>

            {showAddress && (
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Dirección de entrega</p>
                    <p className="text-xs font-bold text-zinc-700 leading-tight">{order.shippingAddress || "No especificada"}</p>
                </div>
            )}

            {showShippingForm && (
                <form action={updateShippingInfo} className="space-y-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input name="shippingCost" type="number" placeholder="Costo Envío $" defaultValue={order.shippingCost} className="w-full p-3 bg-zinc-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-accent" />
                    <input name="trackingUrl" placeholder="Link de seguimiento" defaultValue={order.trackingUrl || ""} className="w-full p-3 bg-zinc-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-accent" />
                    <button className="w-full py-2 bg-zinc-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Actualizar Datos</button>
                </form>
            )}

            <div className="flex gap-2">
                <a href={`https://wa.me/${order.customerPhone}`} target="_blank" className="flex-1 py-3 bg-zinc-50 text-zinc-400 rounded-xl flex items-center justify-center hover:text-black transition-colors">
                    <Phone size={16} />
                </a>
                <button className="flex-2 py-3 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-100">
                    Listo para Despacho
                </button>
            </div>
        </div>
    )
}