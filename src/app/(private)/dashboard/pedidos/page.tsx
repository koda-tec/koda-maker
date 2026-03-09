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
  DollarSign,
  AlertCircle,
  ChevronRight,
  Download,
  Info
} from "lucide-react"
import { createOrder, deleteOrder } from "./actions"
import { OrderTicket } from "@/components/OrderTicket"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Cargamos pedidos con items (plantillas) y pagos (señas)
  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { 
      items: { include: { template: true } }, 
      payments: true 
    },
    orderBy: { deliveryDate: "asc" }
  })

  // 2. Cargamos plantillas para el selector
  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto px-4">
      
      {/* CABECERA DE SECCIÓN */}
      <header className="flex flex-col gap-2 pt-6">
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em]">Management System</h1>
        <div className="flex justify-between items-end">
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase leading-none">Pedidos</h2>
            <div className="hidden md:block bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase">Activos: {orders.length}</span>
            </div>
        </div>
      </header>

      {/* REGISTRO DE NUEVA VENTA */}
      <section className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-[#f13d4b] rounded-full" />
            <h3 className="font-black uppercase text-xs tracking-widest text-gray-800">Nueva Operación</h3>
        </div>

        <form action={createOrder} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cliente</label>
                <input name="customerName" placeholder="Nombre completo" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm font-bold" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">WhatsApp</label>
                <input name="customerPhone" placeholder="Ej: 11 2233 4455" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] text-sm font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Producto</label>
                <select name="templateId" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-black appearance-none" required>
                    <option value="">Seleccionar del catálogo...</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Ref: ${t.basePrice})</option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cantidad</label>
                <input name="quantity" type="number" defaultValue="1" min="1" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-black" required />
            </div>
          </div>

          <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Instrucciones de Grabado / Diseño</label>
              <textarea name="designDetails" rows={2} placeholder="Detalla aquí lo que el cliente pidió..." className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-medium resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Foto / Referencia</label>
                <input name="file" type="file" accept="image/*" className="w-full p-3 bg-gray-50 rounded-2xl text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-black file:text-white file:font-black" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Fecha de Entrega</label>
                <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-black" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#f13d4b] ml-2 italic">Seña / Entrega inicial ($)</label>
                <input name="deposit" type="number" step="0.01" placeholder="0.00" className="w-full p-4 bg-red-50 text-[#f13d4b] border border-red-100 rounded-2xl outline-none text-sm font-black" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estado</label>
                <select name="status" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-black">
                    <option value="CONFIRMADO">CONFIRMADO (Resta Stock)</option>
                    <option value="PRESUPUESTADO">SOLO PRESUPUESTO</option>
                    <option value="EN_PROCESO">EN PRODUCCIÓN</option>
                </select>
            </div>
          </div>

          <button type="submit" className="w-full p-6 bg-black text-white rounded-[28px] font-black shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs hover:bg-[#f13d4b]">
            Confirmar y Registrar Pedido
          </button>
        </form>
      </section>

      {/* LISTADO DE PEDIDOS */}
      <div className="grid grid-cols-1 gap-8">
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const isQuote = order.status === "PRESUPUESTADO";
          const profit = order.totalPrice - order.totalCost;

          return (
            <div key={order.id} className={`
                relative bg-white rounded-[45px] border-2 transition-all overflow-hidden
                ${isQuote ? 'border-dashed border-gray-200 opacity-90' : 'border-transparent shadow-xl shadow-gray-200/40'}
            `}>
              {/* STATUS BARRA SUPERIOR */}
              <div className={`w-full py-3 px-8 flex justify-between items-center ${isQuote ? 'bg-gray-100 text-gray-500' : 'bg-green-500 text-white'}`}>
                <div className="flex items-center gap-2">
                    {isQuote ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {isQuote ? 'Documento de Presupuesto' : 'Pedido en Firme'}
                    </span>
                </div>
                <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                    <button className="p-1 hover:text-red-200 transition-colors"><Trash2 size={18} /></button>
                </form>
              </div>

              {/* CUERPO DE LA TARJETA (RESPONSIVE GRID) */}
              <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* COLUMNA IZQUIERDA: DISEÑO */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-black shadow-inner border border-gray-100">
                            <User size={24} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{order.customerName}</h4>
                            <p className="text-xs font-bold text-gray-400 mt-2 tracking-widest">{order.customerPhone || "Sin teléfono"}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 relative">
                            <div className="flex items-center gap-2 text-[10px] font-black text-[#f13d4b] uppercase mb-3 tracking-widest">
                                <Paintbrush size={14} /> Hoja de Taller
                            </div>
                            <p className="text-base font-bold text-gray-600 italic leading-relaxed">
                                "{order.designDetails || "No hay notas de diseño."}"
                            </p>
                        </div>

                        {order.fileUrl && (
                            <div className="rounded-[35px] overflow-hidden border-8 border-white shadow-2xl rotate-1 max-w-sm mx-auto lg:mx-0">
                                <img src={order.fileUrl} className="w-full h-64 object-cover" alt="Diseño" />
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: FINANZAS */}
                <div className="flex flex-col justify-between space-y-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrega</p>
                            <p className="text-sm font-black mt-1 uppercase">{order.deliveryDate?.toLocaleDateString('es-AR', {day:'2-digit', month:'short'})}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Ganancia</p>
                            <p className="text-sm font-black mt-1 text-green-600 leading-none">+${profit.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total a cobrar</p>
                        <p className="text-6xl font-black tracking-tighter leading-none text-black">${order.totalPrice.toFixed(2)}</p>
                        
                        {/* ESTADO DE PAGO */}
                        <div className="pt-8">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-[9px] font-black uppercase text-gray-400">Progreso de cobro</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${remaining <= 0 ? 'bg-green-500 text-white' : 'bg-[#f13d4b] text-white'}`}>
                                    {remaining <= 0 ? '✓ COBRADO' : `DEBE $${remaining.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="bg-green-500 h-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(((order.totalPrice - remaining) / order.totalPrice) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 space-y-4">
                        {/* El componente OrderTicket tiene su propia lógica de botón negro */}
                        <OrderTicket 
                            order={order} 
                            businessName={user?.user_metadata?.full_name || "KODA MAKER"} 
                        />
                        
                        <a 
                          href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`}
                          target="_blank"
                          className="flex items-center justify-center gap-2 w-full py-2 text-[10px] font-black text-gray-400 uppercase hover:text-black transition-all"
                        >
                            <MessageSquare size={14} /> Contactar por WhatsApp
                        </a>
                    </div>
                </div>
              </div>
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-[60px] border-2 border-dashed border-gray-200">
             <ShoppingCart className="text-gray-200 mx-auto mb-4" size={64} />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay pedidos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}