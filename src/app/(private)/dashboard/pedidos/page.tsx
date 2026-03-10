import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { 
  Plus, Calendar, User, Phone, MessageSquare, 
  Trash2, Paintbrush, CheckCircle2, Clock, 
  Image as ImageIcon, ShoppingCart, DownloadCloud, 
  PackageOpen, Search, Filter, Check, Truck, Play
} from "lucide-react"
import { createOrder, deleteOrder, updateOrderStatus } from "./actions"
import { OrderTicket } from "@/components/OrderTicket"

// Definimos la interfaz para recibir los parámetros de búsqueda de la URL
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Resolvemos los parámetros de búsqueda (Filtros)
  const filters = await searchParams
  const statusFilter = filters.status as string | undefined
  const searchQuery = filters.search as string | undefined

  // 1. OBTENER PEDIDOS CON FILTROS APLICADOS
  const orders = await prisma.order.findMany({
    where: { 
      userId: user?.id,
      // Filtro por estado si existe
      ...(statusFilter ? { status: statusFilter as any } : {}),
      // Filtro por nombre si existe
      ...(searchQuery ? { customerName: { contains: searchQuery, mode: 'insensitive' } } : {}),
    },
    include: { 
      items: { include: { template: true } }, 
      payments: true,
      images: true 
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
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="text-center md:text-left">
            <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1 italic">Koda Maker System</h1>
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Libro de Pedidos</h2>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
            <form className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f13d4b] transition-colors" size={16} />
                <input 
                    name="search"
                    placeholder="Buscar cliente..." 
                    defaultValue={searchQuery}
                    className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] shadow-sm text-sm font-bold"
                />
            </form>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <FilterButton label="Todos" value="" active={!statusFilter} />
                <FilterButton label="Presupuestos" value="PRESUPUESTADO" active={statusFilter === "PRESUPUESTADO"} />
                <FilterButton label="Confirmados" value="CONFIRMADO" active={statusFilter === "CONFIRMADO"} />
                <FilterButton label="Entregados" value="ENTREGADO" active={statusFilter === "ENTREGADO"} />
            </div>
        </div>
      </header>

      {/* FORMULARIO DE REGISTRO */}
      <section className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100 mx-2 md:mx-0">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-[#f13d4b] rounded-full" />
            <h3 className="font-black uppercase text-xs tracking-widest text-gray-800">Nueva Operación</h3>
        </div>

        <form action={createOrder} encType="multipart/form-data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="customerName" placeholder="Nombre Cliente" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-none focus:ring-2 focus:ring-[#f13d4b]" required />
            <input name="customerPhone" placeholder="WhatsApp (Ej: 11 2233 4455)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-none focus:ring-2 focus:ring-[#f13d4b]" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <select name="templateId" className="col-span-2 md:col-span-2 p-4 bg-gray-50 rounded-2xl text-sm font-black border-none" required>
                <option value="">Producto...</option>
                {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (${t.basePrice})</option>
                ))}
            </select>
            <input name="quantity" type="number" defaultValue="1" className="p-4 bg-gray-50 rounded-2xl text-sm font-black text-center border-none" required />
          </div>

          <textarea name="designDetails" placeholder="Instrucciones de diseño/grabado..." className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-medium h-24 border-none resize-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Fotos de referencia</label>
                <input name="files" type="file" accept="image/*" multiple className="w-full p-3 bg-gray-50 rounded-2xl text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-black file:text-white" />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Entrega (Opcional si es presupuesto)</label>
                <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-black border-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="deposit" type="number" step="0.01" placeholder="Seña $" className="p-4 bg-red-50 text-[#f13d4b] rounded-2xl font-black border-none" />
            <select name="status" className="p-4 bg-gray-50 rounded-2xl text-sm font-black border-none text-[#f13d4b]">
                <option value="PRESUPUESTADO">? PRESUPUESTO</option>
                <option value="CONFIRMADO">✓ CONFIRMADO</option>
            </select>
          </div>

          <button type="submit" className="w-full p-5 bg-black text-white rounded-24px font-black uppercase text-xs shadow-xl active:scale-95 transition-all">
            Registrar Venta
          </button>
        </form>
      </section>

      {/* LISTADO DE PEDIDOS */}
      <div className="space-y-8">
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const isQuote = order.status === "PRESUPUESTADO";
          const isDelivered = order.status === "ENTREGADO";
          const product = order.items[0]?.template;

          return (
            <div key={order.id} className={`bg-white rounded-[45px] overflow-hidden border-2 transition-all ${isQuote ? 'border-dashed border-gray-200 opacity-90' : 'border-transparent shadow-2xl shadow-gray-100'}`}>
              
              {/* STATUS BAR */}
              <div className={`py-3 px-8 flex justify-between items-center ${isQuote ? 'bg-gray-100 text-gray-500' : isDelivered ? 'bg-zinc-800 text-white' : 'bg-green-500 text-white'}`}>
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
                    
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gray-50 rounded-[25px] flex items-center justify-center text-black border border-gray-100 shadow-inner"><User size={30} /></div>
                            <div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{order.customerName}</h4>
                                <p className="text-[10px] font-bold text-[#f13d4b] uppercase mt-2 tracking-widest">{order.customerPhone || "Sin contacto"}</p>
                            </div>
                        </div>

                        <div className="bg-black text-white p-6 rounded-[35px] flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center"><PackageOpen size={24} className="text-[#f13d4b]" /></div>
                                <div><p className="text-[10px] font-black uppercase text-zinc-500">Item pedido</p><h5 className="text-xl font-black uppercase leading-none truncate max-w-150px md:max-w-none">{product?.name || "Producto"}</h5></div>
                            </div>
                            <div className="text-right"><p className="text-2xl font-black leading-none">{order.items[0]?.quantity}</p><p className="text-[10px] font-black text-zinc-500 uppercase">CANT.</p></div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-[35px] border border-gray-100 italic font-bold text-gray-600">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 not-italic tracking-widest"><Paintbrush size={14} className="inline mr-2" />Hoja de Taller</p>
                            "{order.designDetails || "Sin instrucciones."}"
                        </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-8">
                        {/* GALERÍA DE IMÁGENES */}
                        <div className="relative">
                            {order.images && order.images.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                                        {order.images.map((img: any) => (
                                            <div key={img.id} className="flex-none w-64 h-64 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative snap-center bg-gray-100">
                                                <img src={img.url} className="w-full h-full object-cover" alt="Diseño" />
                                                <a href={img.url} target="_blank" className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-black rounded-full shadow-lg hover:scale-110 transition-all">
                                                    <DownloadCloud size={16} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-black text-center text-gray-400 uppercase tracking-widest italic">
                                        {order.images.length} imágenes cargadas (desliza)
                                    </p>
                                </div>
                            ) : (
                                <div className="h-64 rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                                    <ImageIcon size={40} />
                                    <p className="text-[10px] font-black uppercase mt-2">Sin imágenes adjuntas</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                <div><p className="text-[10px] font-black text-gray-400 uppercase">Fecha Entrega</p><p className="text-xl font-black uppercase flex items-center gap-2 mt-1"><Calendar size={18} className="text-[#f13d4b]" /> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : "PENDIENTE"}</p></div>
                                <div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase">A Cobrar</p><h5 className="text-4xl font-black tracking-tighter">${order.totalPrice.toFixed(2)}</h5></div>
                            </div>

                            {/* BARRA DE PROGRESO DE COBRO */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Progreso financiero</span>
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

                        {/* ACCIONES DE ESTADO Y TICKET */}
                        <div className="pt-4 flex flex-col gap-3">
                            <div className="bg-gray-50 p-4 rounded-3xl flex flex-col gap-2">
                                {isQuote ? (
                                    <form action={async () => { "use server"; await updateOrderStatus(order.id, 'CONFIRMADO') }}>
                                        <button className="w-full py-3 bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"><Check size={14}/> Confirmar Pedido (Resta Stock)</button>
                                    </form>
                                ) : !isDelivered ? (
                                    <form action={async () => { "use server"; await updateOrderStatus(order.id, 'ENTREGADO') }}>
                                        <button className="w-full py-3 bg-zinc-800 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"><Truck size={14}/> Marcar como Entregado</button>
                                    </form>
                                ) : (
                                    <div className="text-center py-2 text-xs font-black text-green-600 uppercase flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} /> Trabajo Finalizado y Entregado
                                    </div>
                                )}
                            </div>

                            <OrderTicket order={order} businessName={user?.user_metadata?.full_name || "SyG Creaciones"} />
                            
                            <a href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`} target="_blank" className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase hover:text-black transition-all py-2"><MessageSquare size={14} /> Abrir WhatsApp</a>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Componente auxiliar para los botones de filtro
function FilterButton({ label, value, active }: { label: string, value: string, active: boolean }) {
    return (
        <a 
            href={value ? `?status=${value}` : `/dashboard/pedidos`}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${active ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 hover:text-black border border-gray-100'}`}
        >
            {label}
        </a>
    )
}