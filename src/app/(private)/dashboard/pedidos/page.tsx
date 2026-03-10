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
  Image as ImageIcon, 
  ShoppingCart, 
  DownloadCloud, 
  PackageOpen,
  Info,
  DollarSign
} from "lucide-react"
import { createOrder, deleteOrder } from "./actions"
import { OrderTicket } from "@/components/OrderTicket"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener pedidos con relaciones
  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { 
      items: { include: { template: true } }, 
      payments: true,
      images: true // <--- ESTO SOLUCIONA EL ERROR 500

    },
    orderBy: { createdAt: "desc" }
  })

  // 2. Obtener plantillas para el selector
  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 pt-6 px-2 md:px-4">
      
      {/* HEADER DE SECCIÓN */}
      <header className="text-center md:text-left px-2">
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1 italic">Koda Maker System</h1>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Libro de Pedidos</h2>
      </header>

      {/* FORMULARIO DE REGISTRO - IMPORTANTE: encType="multipart/form-data" */}
      <section className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100 mx-2 md:mx-0">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-[#f13d4b] rounded-full" />
            <h3 className="font-black uppercase text-xs tracking-widest text-gray-800">Nueva Operación</h3>
        </div>

        <form action={createOrder} encType="multipart/form-data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Nombre del Cliente</label>
                <input name="customerName" placeholder="Juan Pérez" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-none focus:ring-2 focus:ring-[#f13d4b]" required />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">WhatsApp (Sin 0 ni 15)</label>
                <input name="customerPhone" placeholder="11 2233 4455" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-none focus:ring-2 focus:ring-[#f13d4b]" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Producto a vender</label>
                <select name="templateId" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-black border-none appearance-none" required>
                    <option value="">Seleccionar del catálogo...</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Sugerido: ${t.basePrice})</option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Cantidad</label>
                <input name="quantity" type="number" defaultValue="1" min="1" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-black text-center border-none" required />
            </div>
          </div>

          <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Instrucciones de Grabado / Diseño</label>
              <textarea name="designDetails" placeholder="Ej: Logo empresa en frente, nombre atrás..." className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-medium h-24 border-none resize-none" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Fotos de referencia (puedes elegir varias)</label>
                <input 
                    name="files" // CAMBIADO A PLURAL
                    type="file" 
                    accept="image/*" 
                    multiple // PROPIEDAD CLAVE
                    className="w-full p-3 bg-gray-50 rounded-2xl text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-black file:text-white" 
                />
          </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Fecha Entrega</label>
                <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-black border-none" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[#f13d4b] ml-2">Seña Recibida $</label>
                <input name="deposit" type="number" step="0.01" placeholder="0.00" className="w-full p-4 bg-red-50 text-[#f13d4b] rounded-2xl font-black border-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Estado inicial</label>
                <select name="status" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-black border-none text-[#f13d4b]">
                    <option value="CONFIRMADO">✓ CONFIRMADO</option>
                    <option value="PRESUPUESTADO">? PRESUPUESTO</option>
                </select>
            </div>
          </div>

          <button type="submit" className="w-full p-5 bg-black text-white rounded-24px font-black uppercase text-xs tracking-widest hover:bg-[#f13d4b] transition-all shadow-xl active:scale-95">
            Registrar Operación
          </button>
        </form>
      </section>

      {/* LISTADO DE PEDIDOS */}
      <div className="space-y-10">
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const isQuote = order.status === "PRESUPUESTADO";
          const product = order.items[0]?.template;

          return (
            <div key={order.id} className={`bg-white rounded-[45px] overflow-hidden border-2 transition-all ${isQuote ? 'border-dashed border-gray-200' : 'border-transparent shadow-2xl shadow-gray-100'}`}>
              
              {/* BARRA DE ESTADO SUPERIOR */}
              <div className={`py-3 px-8 flex justify-between items-center ${isQuote ? 'bg-gray-100 text-gray-500' : 'bg-green-500 text-white'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{order.status}</span>
                    <span className="text-[10px] opacity-60 font-bold">| CREADO: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                    <button className="hover:text-red-200 transition-colors p-1"><Trash2 size={18} /></button>
                </form>
              </div>

              <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* COLUMNA IZQUIERDA: CLIENTE Y PRODUCTO */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gray-50 rounded-[25px] flex items-center justify-center text-black border border-gray-100 shadow-inner">
                                <User size={30} />
                            </div>
                            <div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{order.customerName}</h4>
                                <p className="text-[10px] font-bold text-[#f13d4b] uppercase mt-2 tracking-widest">{order.customerPhone || "Sin contacto"}</p>
                            </div>
                        </div>

                        {/* CAJA DE PRODUCTO SOLICITADO */}
                        <div className="bg-black text-white p-6 rounded-[35px] flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                                    <PackageOpen size={24} className="text-[#f13d4b]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none mb-1">Item pedido</p>
                                    <h5 className="text-xl font-black uppercase tracking-tighter leading-none truncate max-w-140px md:max-w-none">{product?.name || "Producto"}</h5>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black leading-none">{order.items[0]?.quantity}</p>
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">CANT.</p>
                            </div>
                        </div>

                        {/* HOJA DE TALLER */}
                        <div className="bg-gray-50 p-6 rounded-[35px] border border-gray-100 relative">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">
                                <Paintbrush size={14} className="text-[#f13d4b]" /> Hoja de Taller
                            </div>
                            <p className="text-base font-bold text-gray-600 italic leading-relaxed">
                                "{order.designDetails || "Sin instrucciones."}"
                            </p>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: IMAGEN Y COBRO */}
                    <div className="flex flex-col justify-between space-y-8">
                                                
                        {/* GALERÍA DE IMÁGENES */}
                        <div className="relative">
                            {order.images && order.images.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                        {order.images.map((img: any) => (
                                            <div key={img.id} className="flex-none w-64 h-64 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative snap-center bg-gray-100">
                                                <img src={img.url} className="w-full h-full object-cover" alt="Diseño" />
                                                <a href={img.url} target="_blank" className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-black rounded-full shadow-lg">
                                                    <DownloadCloud size={16} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-black text-center text-gray-400 uppercase tracking-widest italic">
                                        {order.images.length} imágenes cargadas (desliza para ver)
                                    </p>
                                </div>
                            ) : (
                                <div className="h-64 rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                                    <ImageIcon size={40} />
                                    <p className="text-[10px] font-black uppercase mt-2">Sin imágenes</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Entrega</p>
                                    <p className="text-xl font-black uppercase flex items-center gap-2 mt-1">
                                        <Calendar size={18} className="text-[#f13d4b]" />
                                        {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : "S/D"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">A Cobrar</p>
                                    <p className="text-4xl font-black tracking-tighter">${order.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* PROGRESO DE PAGO */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Estado financiero</span>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${remaining <= 0 ? 'bg-green-500 text-white' : 'bg-[#f13d4b] text-white'}`}>
                                        {remaining <= 0 ? 'COBRADO TOTAL' : `FALTA $${remaining.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className="bg-green-500 h-full transition-all duration-1000"
                                        style={{ width: `${Math.min(((order.totalPrice - remaining) / order.totalPrice) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES FINALES */}
                        <div className="pt-4 flex flex-col gap-3">
                            <OrderTicket order={order} businessName={user?.user_metadata?.full_name || "SyG Creaciones"} />
                            <a 
                              href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`}
                              target="_blank"
                              className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase hover:text-black transition-all py-2"
                            >
                                <MessageSquare size={14} /> Abrir Chat de WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-[60px] border-2 border-dashed border-gray-200 mx-4 md:mx-0">
             <ShoppingCart className="text-gray-200 mx-auto mb-4" size={64} />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Aún no hay ventas registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}