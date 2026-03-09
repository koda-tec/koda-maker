import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Plus, Calendar, User, DollarSign, Package, CheckCircle2, Clock } from "lucide-react"
import { createOrder } from "./actions"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { items: { include: { template: true } } },
    orderBy: { deliveryDate: "asc" }
  })

  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id }
  })

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Gestión de Ventas</h1>
        <h2 className="text-3xl font-black text-black">Pedidos</h2>
      </header>

      {/* Formulario Rápido de Nuevo Pedido */}
      <section className="bg-white p-6 rounded-32px shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-tighter">
            <Plus size={18} className="text-[#f13d4b]" /> Nuevo Pedido
        </h3>
        <form action={createOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="customerName" placeholder="Nombre del Cliente" className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b]" required />
            
            <select name="templateId" className="p-4 bg-gray-50 rounded-2xl outline-none" required>
              <option value="">Seleccionar Producto...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} (${t.basePrice})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input name="quantity" type="number" placeholder="Cant." className="p-4 bg-gray-50 rounded-2xl outline-none" required />
            <input name="deliveryDate" type="date" className="p-4 bg-gray-50 rounded-2xl outline-none col-span-2" required />
          </div>

          <select name="status" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-[#f13d4b]">
            <option value="CONFIRMADO">CONFIRMADO (Resta Stock)</option>
            <option value="PRESUPUESTADO">SOLO PRESUPUESTO</option>
          </select>

          <button type="submit" className="w-full p-5 bg-black text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
            Registrar Pedido
          </button>
        </form>
      </section>

      {/* Lista de Pedidos */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest ml-4">Cronograma de Entregas</h3>
        
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-32px border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${order.status === 'CONFIRMADO' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {order.status === 'CONFIRMADO' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div>
                    <h4 className="font-black text-lg leading-none uppercase tracking-tighter">{order.customerName}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> Entrega: {order.deliveryDate?.toLocaleDateString()}
                    </p>
                </div>
              </div>
              <span className="text-xl font-black text-black">${order.totalPrice.toFixed(2)}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                        <Package size={14} className="text-gray-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-600">
                        {order.items[0]?.quantity}x {order.items[0]?.template.name}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Ganancia Bruta</p>
                    <p className="text-sm font-black text-green-600 leading-none mt-1">
                        +${(order.totalPrice - order.totalCost).toFixed(2)}
                    </p>
                </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
            <p className="text-center py-20 text-gray-400 text-sm font-medium">No hay pedidos registrados.</p>
        )}
      </section>
    </div>
  )
}