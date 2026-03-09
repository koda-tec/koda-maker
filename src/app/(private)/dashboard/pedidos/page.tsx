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
  ChevronRight,
  Download
} from "lucide-react"
import { createOrder, deleteOrder } from "./actions"
import { OrderTicket } from "@/components/OrderTicket"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener pedidos con sus relaciones y pagos
  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { 
      items: { include: { template: true } },
      payments: true 
    },
    orderBy: { deliveryDate: "asc" }
  })

  // 2. Obtener plantillas para el selector
  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-10 pb-24 max-w-6xl mx-auto px-2 md:px-6">
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
        <div>
          <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.3em] mb-2">KODA MAKER</h1>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Libro de Pedidos</h2>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400">Total Operaciones: <span className="text-black">{orders.length}</span></p>
        </div>
      </header>

      {/* SECCIÓN: FORMULARIO DE REGISTRO */}
      <section className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-6 bg-[#f13d4b] rounded-full" />
            <h3 className="font-black uppercase text-sm tracking-tight text-gray-800">Registrar Nueva Venta</h3>
        </div>

        <form action={createOrder} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cliente</label>
                <input name="customerName" placeholder="Nombre completo" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm font-medium transition-all" required />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">WhatsApp</label>
                <input name="customerPhone" placeholder="11 1234 5678" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm font-medium transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Producto del Catálogo</label>
                <select name="templateId" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-bold appearance-none cursor-pointer" required>
                <option value="">Selecciona qué vas a vender...</option>
                {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Sugerido: ${t.basePrice})</option>
                ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cantidad</label>
                <input name="quantity" type="number" defaultValue="1" min="1" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-black" required />
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Instrucciones de Taller / Grabado</label>
              <textarea name="designDetails" rows={2} placeholder="Ej: Logo empresa en frente, nombre Carlos atrás..." className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm resize-none" />
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Foto / Referencia del diseño</label>
              <input name="file" type="file" accept="image/*" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-black file:text-white cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Fecha Entrega</label>
                <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-bold" required />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#f13d4b] ml-2">Seña Recibida ($)</label>
                <input name="deposit" type="number" step="0.01" placeholder="0.00" className="w-full p-4 bg-red-50 text-[#f13d4b] rounded-2xl outline-none text-sm font-black border border-red-100" />
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estado del Pedido</label>
                <select name="status" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-bold">
                    <option value="CONFIRMADO">CONFIRMADO (Resta Stock)</option>
                    <option value="PRESUPUESTADO">SOLO PRESUPUESTO (No resta)</option>
                    <option value="EN_PROCESO">EN PRODUCCIÓN</option>
                </select>
            </div>
          </div>

          <button type="submit" className="w-full p-5 bg-black text-white rounded-[28px] font-black shadow-2xl active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs mt-4 hover:bg-[#f13d4b]">
            Confirmar Operación
          </button>
        </form>
      </section>

      {/* LISTADO DE PEDIDOS ACTVOS */}
      <section className="space-y-6">
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.3em] ml-6">Cronograma de Pedidos</h3>
        
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const isQuote = order.status === "PRESUPUESTADO";
          const profit = order.totalPrice - order.totalCost;

          return (
            <div key={order.id} className={`
                relative bg-white rounded-[40px] transition-all p-6 md:p-10 border-2
                ${isQuote ? 'border-dashed border-gray-200' : 'border-transparent shadow-xl shadow-gray-200/50'}
            `}>
              {/* STATUS BARRA LATERAL */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${isQuote ? 'bg-gray-200' : 'bg-green-500'}`} />

              {/* CABECERA TARJETA */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-24px flex items-center justify-center text-gray-300">
                        <User size={32} />
                    </div>
                    <div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isQuote ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                            {isQuote ? 'Presupuesto' : 'Pedido Confirmado'}
                        </span>
                        <h4 className="font-black text-2xl md:text-3xl uppercase tracking-tighter mt-1">{order.customerName}</h4>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                        <button className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                            <Trash2 size={20} />
                        </button>
                    </form>
                </div>
              </div>

              {/* CONTENIDO PRINCIPAL: GRID RESPONSIVE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* COLUMNA IZQUIERDA: TALLER Y DISEÑO */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-gray-50 p-6 md:p-8 rounded-[35px] space-y-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Paintbrush size={14} className="text-[#f13d4b]" /> Hoja de Taller
                        </div>
                        <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                            "{order.designDetails || "No hay instrucciones para este trabajo."}"
                        </p>
                        
                        {order.fileUrl && (
                            <div className="mt-6 rounded-24px overflow-hidden shadow-xl border-4 border-white">
                                <img src={order.fileUrl} alt="Diseño" className="w-full h-48 object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 px-2">
                         <div className="flex items-center gap-2">
                             <Phone size={14} className="text-gray-400" />
                             <span className="text-xs font-black text-gray-500">{order.customerPhone || "Sin tel."}</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <Calendar size={14} className="text-gray-400" />
                             <span className="text-xs font-black text-gray-500">Entrega: {order.deliveryDate?.toLocaleDateString()}</span>
                         </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: FINANZAS Y ACCIÓN */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-white border-2 border-gray-50 p-8 rounded-[35px]">
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                                <p className="text-4xl font-black text-black tracking-tighter">${order.totalPrice.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-green-600 uppercase">Ganancia</p>
                                <p className="text-lg font-black text-green-600">+${profit.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Estado de pago</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${remaining <= 0 ? 'bg-green-500 text-white' : 'bg-[#f13d4b] text-white'}`}>
                                    {remaining <= 0 ? 'PAGADO COMPLETAMENTE' : `FALTA COBRAR $${remaining.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-green-500 h-full transition-all duration-500" 
                                    style={{ width: `${Math.min((totalPaid / order.totalPrice) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                        {/* COMPONENTE DE IMAGEN PARA WHATSAPP */}
                        <OrderTicket 
                            order={order} 
                            businessName={user?.user_metadata?.full_name || "KODA MAKER"} 
                        />
                        
                        <button className="w-full py-3 text-[10px] font-black text-gray-400 uppercase hover:text-[#f13d4b] transition-all flex items-center justify-center gap-2">
                            <MessageSquare size={14} /> Abrir Chat de WhatsApp
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* SI NO HAY PEDIDOS */}
        {orders.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[50px] border-2 border-dashed border-gray-200">
             <ShoppingCart className="text-gray-200 mx-auto mb-4" size={56} />
             <p className="text-gray-400 font-bold">Todavía no registraste ninguna venta.</p>
             <p className="text-gray-300 text-sm mt-1">Usa el formulario para empezar.</p>
          </div>
        )}
      </section>
    </div>
  )
}