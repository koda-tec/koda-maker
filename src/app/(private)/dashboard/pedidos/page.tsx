import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  Plus, 
  Calendar, 
  User, 
  Phone, 
  MessageSquare, 
  Trash2, 
  Paintbrush, 
  CheckCircle2, 
  Clock,
  Package,
  ShoppingCart,
  Image as ImageIcon,
  AlertCircle,
  ChevronRight
} from "lucide-react"
import { createOrder, deleteOrder } from "./actions"
import { OrderTicket } from "@/components/OrderTicket"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener los pedidos con sus relaciones
  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { 
      items: { include: { template: true } },
      payments: true 
    },
    orderBy: { deliveryDate: "asc" }
  })

  // 2. Obtener las plantillas para el selector
  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-10 pb-24">
      {/* TÍTULO DE LA SECCIÓN */}
      <header>
        <h1 className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Operaciones</h1>
        <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Libro de Pedidos</h2>
      </header>

      {/* SECCIÓN: FORMULARIO DE REGISTRO */}
      <section className="bg-white p-6 rounded-32px shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-5 bg-[#f13d4b] rounded-full" />
            <h3 className="font-bold uppercase text-xs tracking-tight text-gray-800">Nueva Venta</h3>
        </div>

        <form action={createOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nombre del Cliente</label>
                <input name="customerName" placeholder="Ej: Juan Pérez" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">WhatsApp</label>
                <input name="customerPhone" placeholder="Ej: 11 1234 5678" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm" />
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
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Detalles del Diseño (Instrucciones taller)</label>
              <textarea name="designDetails" rows={2} placeholder="Ej: Grabar logo de club en el frente..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm resize-none" />
          </div>

          <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Imagen de Referencia</label>
              <input name="file" type="file" accept="image/*" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-black file:text-white" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Fecha Entrega</label>
                <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#f13d4b] ml-2">Seña / Pago ($)</label>
                <input name="deposit" type="number" placeholder="0.00" className="w-full p-4 bg-red-50 text-[#f13d4b] rounded-2xl outline-none text-sm font-black border border-red-100" />
            </div>
            <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estado Inicial</label>
                <select name="status" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold">
                    <option value="CONFIRMADO">CONFIRMADO (Resta Stock)</option>
                    <option value="PRESUPUESTADO">SOLO PRESUPUESTO</option>
                    <option value="EN_PROCESO">EN PRODUCCIÓN</option>
                </select>
            </div>
          </div>

          <button type="submit" className="w-full p-5 bg-black text-white rounded-24px font-black shadow-xl active:scale-[0.98] transition-all uppercase tracking-widest text-xs">
            Confirmar y Registrar Pedido
          </button>
        </form>
      </section>

      {/* SECCIÓN: LISTADO DE PEDIDOS */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest ml-4">Cronograma de Pedidos</h3>
        
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const profit = order.totalPrice - order.totalCost;

          return (
            <div key={order.id} className="bg-white p-6 rounded-32px border border-gray-100 shadow-sm space-y-5 relative overflow-hidden">
              {/* Barra de Estado Lateral */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'CONFIRMADO' ? 'bg-green-500' : 'bg-orange-400'}`} />

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-xl uppercase tracking-tighter leading-none">{order.customerName}</h4>
                        <p className="text-[10px] font-bold text-[#f13d4b] uppercase mt-1 tracking-widest flex items-center gap-1">
                            <Phone size={10} /> {order.customerPhone || "Sin contacto"}
                        </p>
                    </div>
                </div>
                <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                    <button className="p-2 text-gray-200 hover:text-red-500 transition-colors active:scale-90"><Trash2 size={18} /></button>
                </form>
              </div>

              {/* IMAGEN DEL DISEÑO (Si existe) */}
              {order.fileUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                  <div className="bg-gray-50 py-1.5 px-3 border-b flex items-center gap-2">
                    <ImageIcon size={10} className="text-[#f13d4b]" />
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Diseño de referencia</span>
                  </div>
                  <img src={order.fileUrl} alt="Diseño" className="w-full h-48 object-cover" />
                </div>
              )}

              {/* DETALLES PARA EL TALLER */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                    <Paintbrush size={12} className="text-[#f13d4b]" /> Hoja de Taller
                </div>
                <p className="text-sm font-medium text-gray-700 leading-tight">
                    {order.designDetails || "No hay instrucciones específicas de grabado."}
                </p>
              </div>

              {/* RESUMEN DE DATOS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-50 pt-4">
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Entrega</p>
                    <div className="flex items-center gap-1 text-xs font-black">
                        <Calendar size={12} className="text-gray-400" /> {order.deliveryDate?.toLocaleDateString()}
                    </div>
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Total</p>
                    <div className="text-sm font-black text-black">${order.totalPrice.toFixed(2)}</div>
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Estado Pago</p>
                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block ${remaining <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-[#f13d4b]'}`}>
                        {remaining <= 0 ? 'COBRADO' : `DEBE $${remaining.toFixed(2)}`}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Ganancia</p>
                    <div className="text-sm font-black text-green-600">+${profit.toFixed(2)}</div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="pt-2 flex gap-2">
                <div className="flex-1">
                    <OrderTicket order={order} businessName={user?.user_metadata?.full_name || "KODA Maker"} />
                </div>
                <button className="px-5 bg-gray-100 rounded-xl text-gray-600 active:scale-95 transition-all">
                    <MessageSquare size={18} />
                </button>
              </div>
            </div>
          )
        })}

        {/* ESTADO VACÍO */}
        {orders.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
             <ShoppingCart className="text-gray-200 mx-auto mb-3" size={48} />
             <p className="text-gray-400 text-sm font-medium">No hay pedidos registrados.<br/>Usa el formulario para empezar.</p>
          </div>
        )}
      </section>
    </div>
  )
}