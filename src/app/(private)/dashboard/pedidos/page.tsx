import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  Plus, Calendar, User, Phone, MessageSquare, 
  Trash2, CreditCard, Paintbrush, StickyNote, 
  AlertCircle, CheckCircle2, Clock, ChevronRight, Package, ShoppingCart // <--- AGREGÁ ESTOS DOS

} from "lucide-react"
import { createOrder, deleteOrder } from "./actions"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Traemos los pedidos con sus items (plantillas) y sus pagos (señas)
  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { 
      items: { include: { template: true } },
      payments: true 
    },
    orderBy: { deliveryDate: "asc" }
  })

  // Traemos las plantillas para el selector del formulario
  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-10 pb-24">
      <header>
        <h1 className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Operaciones</h1>
        <h2 className="text-3xl font-black text-black tracking-tighter">Libro de Pedidos</h2>
      </header>

      {/* FORMULARIO DE NUEVO PEDIDO (Diseño Compacto) */}
      <section className="bg-white p-6 rounded-32px shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-5 bg-[#f13d4b] rounded-full" />
            <h3 className="font-bold uppercase text-xs tracking-tight text-gray-800">Registrar Nueva Venta</h3>
        </div>

        <form action={createOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cliente</label>
                <input name="customerName" placeholder="Nombre completo" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">WhatsApp / Teléfono</label>
                <input name="customerPhone" placeholder="Ej: +54 9 11..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Producto del Catálogo</label>
                <select name="templateId" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-medium" required>
                <option value="">Selecciona qué vas a vender...</option>
                {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Sugerido: ${t.basePrice})</option>
                ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cantidad</label>
                <input name="quantity" type="number" defaultValue="1" min="1" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" required />
            </div>
          </div>

          <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Detalles del Diseño (Lo que vas a grabar)</label>
              <textarea name="designDetails" rows={2} placeholder="Ej: Logo empresa en frente, nombre Juan en bombilla..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Fecha Entrega</label>
                <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 text-#f13d4b">Seña / Pago ($)</label>
                <input name="deposit" type="number" placeholder="0.00" className="w-full p-4 bg-red-50 text-[#f13d4b] rounded-2xl outline-none text-sm font-black border border-red-100" />
            </div>
            <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estado Inicial</label>
                <select name="status" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold">
                    <option value="CONFIRMADO">CONFIRMADO (Resta Stock)</option>
                    <option value="PRESUPUESTADO">SOLO PRESUPUESTO (No resta)</option>
                    <option value="EN_PROCESO">EN PRODUCCIÓN</option>
                </select>
            </div>
          </div>

          <button type="submit" className="w-full p-5 bg-black text-white rounded-24px font-black shadow-xl active:scale-[0.98] transition-all uppercase tracking-widest text-xs mt-2">
            Confirmar y Registrar Pedido
          </button>
        </form>
      </section>

      {/* LISTADO DE PEDIDOS ACTVOS */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-4">
            <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Cronograma de Pedidos ({orders.length})</h3>
        </div>
        
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const profit = order.totalPrice - order.totalCost;

          return (
            <div key={order.id} className="bg-white p-6 rounded-32px border border-gray-100 shadow-sm space-y-5 relative overflow-hidden group">
              {/* Indicador Lateral de Estado */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'CONFIRMADO' ? 'bg-green-500' : 'bg-orange-400'}`} />

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-xl uppercase tracking-tighter leading-none">{order.customerName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-[#f13d4b] uppercase flex items-center gap-1">
                                <Phone size={10} /> {order.customerPhone || "Sin teléfono"}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                        <button className="p-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </form>
                </div>
              </div>

              {/* Caja de Diseño / Taller */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                    <Paintbrush size={12} className="text-[#f13d4b]" /> Instrucciones de Personalización
                </div>
                <p className="text-sm font-medium text-gray-700 leading-tight">
                    {order.designDetails || "No se especificaron detalles de grabado/impresión."}
                </p>
              </div>

              {/* Grid de Datos Rápidos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Entrega el</p>
                    <div className="flex items-center gap-2 text-xs font-black">
                        <Calendar size={14} className="text-gray-400" />
                        {order.deliveryDate?.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Producto</p>
                    <div className="flex items-center gap-2 text-xs font-black truncate">
                        <Package size={14} className="text-gray-400" />
                        {order.items[0]?.quantity}x {order.items[0]?.template.name}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Estado Pago</p>
                    <div className={`text-[10px] font-black inline-block px-2 py-0.5 rounded-full ${remaining <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-[#f13d4b]'}`}>
                        {remaining <= 0 ? '✓ TOTALMENTE PAGADO' : `FALTA: $${remaining.toFixed(2)}`}
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Ganancia Limpia</p>
                    <div className="text-sm font-black text-green-600">+${profit.toFixed(2)}</div>
                </div>
              </div>

              {/* Botonera de Acción */}
              <div className="pt-2 flex gap-2">
                <button className="flex-1 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                    Ver Ticket / Imagen
                </button>
                <button className="px-4 bg-gray-100 rounded-xl text-gray-600 active:scale-95 transition-all">
                    <MessageSquare size={18} />
                </button>
              </div>
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShoppingCart className="text-gray-300" />
             </div>
             <p className="text-gray-400 text-sm font-medium">Aún no tienes pedidos registrados.<br/>Comienza llenando el formulario de arriba.</p>
          </div>
        )}
      </section>
    </div>
  )
}

