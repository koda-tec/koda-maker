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
  Search,
  Check,
  Truck,
  Info,
  DollarSign,
  ChevronRight,
  AlertCircle,
  ArrowDownAz
} from "lucide-react"
import { createOrder, deleteOrder, markAsDelivered } from "./actions"
import { OrderTicket } from "@/components/OrderTicket"
import { ConfirmOrderModal } from "@/components/ConfirmOrderModal"
import { EditOrderModal } from "@/components/EditOrderModal"
import { AddPaymentModal } from "@/components/AddPaymentModal"
import { SubmitButton } from "@/components/SubmitButton"

interface PageProps {
  searchParams: Promise<{ search?: string, status?: string, sort?: string }>
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  
  // 1. CARGA EN PARALELO INICIAL
  const [userRes, query] = await Promise.all([
    supabase.auth.getUser(),
    searchParams
  ])

  const authUser = userRes.data.user
  const statusFilter = query.status
  const searchQuery = query.search || ""
  const sortParam = query.sort || "newest"

  // Lógica de búsqueda inteligente
  const isNumericSearch = /^\d+$/.test(searchQuery);
  const orderNumberQuery = isNumericSearch ? parseInt(searchQuery) : undefined;

  // Lógica de Ordenamiento para Prisma
  let orderBy: any = { createdAt: "desc" };
  if (sortParam === "name") orderBy = { customerName: "asc" };
  if (sortParam === "delivery") {
    // Ordenamos por fecha de entrega (más próximos primero) y los nulls al final
    orderBy = [
      { deliveryDate: { sort: 'asc', nulls: 'last' } },
      { createdAt: 'desc' }
    ];
  }

  // 2. CONSULTAS A BASE DE DATOS EN PARALELO
  const [orders, templates, dbUser] = await Promise.all([
    prisma.order.findMany({
      where: { 
        userId: authUser?.id,
        AND: [
            statusFilter 
              ? { status: statusFilter as any } 
              : { status: { in: ['CONFIRMADO', 'EN_PROCESO'] } }, // Filtro Activos por defecto
            {
                OR: [
                    { customerName: { contains: searchQuery, mode: 'insensitive' } },
                    // NUEVO: Filtro por nombre del producto
                    { items: { some: { template: { name: { contains: searchQuery, mode: 'insensitive' } } } } },
                    orderNumberQuery ? { orderNumber: orderNumberQuery } : {},
                ]
            }
        ]
      },
      include: { 
        items: { include: { template: true } }, 
        payments: true,
        images: true 
      },
      orderBy: orderBy
    }),
    prisma.productTemplate.findMany({
      where: { userId: authUser?.id },
      orderBy: { name: "asc" }
    }),
    prisma.user.findUnique({
      where: { id: authUser?.id }
    })
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 pt-6 px-2 md:px-4 text-left">
      
      {/* HEADER Y SISTEMA DE FILTROS */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="text-left">
            <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Koda Maker System</h1>
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Libro de Pedidos</h2>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Buscador y Ordenamiento */}
            <div className="flex flex-col sm:flex-row gap-2">
                <form className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-accent transition-colors" size={16} />
                    <input 
                        name="search"
                        placeholder="Buscar cliente o producto..." 
                        defaultValue={searchQuery}
                        className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent shadow-sm text-sm font-bold text-black"
                    />
                </form>
                
                {/* Selector de Ordenamiento Visual */}
                <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl self-start">
                    <a 
                        href={`?sort=name${statusFilter ? `&status=${statusFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                        className={`p-2 rounded-xl transition-all ${sortParam === 'name' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                        title="Ordenar A-Z"
                    >
                        <ArrowDownAz size={20} />
                    </a>
                    <a 
                        href={`?sort=delivery${statusFilter ? `&status=${statusFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                        className={`p-2 rounded-xl transition-all ${sortParam === 'delivery' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                        title="Ordenar por Entrega"
                    >
                        <Clock size={20} />
                    </a>
                </div>
            </div>

            {/* Pestañas de Filtro */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <a href="/dashboard/pedidos" className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${!statusFilter ? 'bg-black text-white shadow-lg border-black' : 'bg-white text-zinc-400 border-zinc-100'}`}>Activos</a>
                <a href="?status=PRESUPUESTADO" className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === 'PRESUPUESTADO' ? 'bg-black text-white shadow-lg border-black' : 'bg-white text-zinc-400 border-zinc-100'}`}>Presupuestos</a>
                
                {/* BOTÓN LISTOS (Estado LISTO en tu DB) */}
                <a href="?status=LISTO" className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap flex items-center gap-2 ${statusFilter === 'LISTO' ? 'bg-emerald-500 text-white shadow-lg border-emerald-500' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${statusFilter === 'LISTO' ? 'animate-pulse' : ''}`} />
                    Listos
                </a>

                <a href="?status=ENTREGADO" className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === 'ENTREGADO' ? 'bg-zinc-800 text-white shadow-lg border-zinc-800' : 'bg-white text-zinc-400 border-zinc-100'}`}>Entregados</a>
            </div>
        </div>
      </header>

      {/* SECCIÓN 1: FORMULARIO DE REGISTRO */}
      {(!statusFilter || statusFilter === 'PRESUPUESTADO') && (
        <section className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-zinc-100 mx-2 md:mx-0">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                <h3 className="font-black uppercase text-xs tracking-widest text-zinc-800">Nueva Operación</h3>
            </div>

            <form action={createOrder} encType="multipart/form-data" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 text-left block">Nombre del Cliente</label>
                        <input name="customerName" placeholder="Juan Pérez" className="w-full p-4 bg-zinc-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent text-sm font-bold text-black" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 text-left block">WhatsApp</label>
                        <input name="customerPhone" placeholder="11 2233 4455" className="w-full p-4 bg-zinc-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent text-sm font-bold text-black" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 text-left block">Producto</label>
                        <select name="templateId" className="w-full p-4 bg-zinc-50 rounded-2xl text-sm font-black border-none appearance-none cursor-pointer text-black" required>
                            <option value="">Seleccionar del catálogo...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name} (${t.basePrice})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 text-center block w-full">Cantidad</label>
                        <input name="quantity" type="number" defaultValue="1" min="1" className="w-full p-4 bg-zinc-50 rounded-2xl text-sm font-black text-center border-none text-black" required />
                    </div>
                </div>

                <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 text-left block">Detalles del Diseño / Grabado</label>
                    <textarea name="designDetails" placeholder="Ej: Logo empresa en frente, nombre atrás..." className="w-full p-4 bg-zinc-50 border-none rounded-2xl outline-none text-sm font-medium h-24 resize-none text-black" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 italic tracking-widest text-left block">Referencias Visuales</label>
                        <input name="files" type="file" accept="image/*" multiple className="w-full p-3 bg-zinc-50 rounded-2xl text-[10px] file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-black file:text-white cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 italic tracking-widest text-left block">Fecha Entrega (Opcional)</label>
                        <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-black border-none h-14 text-black" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-accent ml-2 italic tracking-widest text-left block">Seña Recibida ($)</label>
                        <input name="deposit" type="number" step="0.01" placeholder="0.00" className="w-full p-4 bg-red-50 text-accent rounded-2xl font-black border-none outline-none focus:ring-2 focus:ring-accent h-14" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-widest text-left block">Estado Inicial</label>
                        <select name="status" className="w-full p-4 bg-zinc-50 rounded-2xl text-sm font-black border-none outline-none focus:ring-2 focus:ring-accent h-14 cursor-pointer text-accent">
                            <option value="CONFIRMADO">✓ CONFIRMADO</option>
                            <option value="PRESUPUESTADO">? PRESUPUESTO</option>
                            <option value="LISTO">✨ LISTO</option>
                        </select>
                    </div>
                </div>

                <SubmitButton label="Registrar Operación" />
            </form>
        </section>
      )}

      {/* SECCIÓN 2: LISTADO DE TARJETAS DE PEDIDOS */}
      <div className="space-y-10">
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const isQuote = order.status === "PRESUPUESTADO";
          const isReady = order.status === "LISTO";
          const isDelivered = order.status === "ENTREGADO";
          const product = order.items[0]?.template;

          return (
            <div key={order.id} className={`bg-white rounded-[45px] overflow-hidden border-2 transition-all ${isQuote ? 'border-dashed border-zinc-200 opacity-90' : isReady ? 'border-emerald-500 shadow-xl shadow-emerald-50' : isDelivered ? 'grayscale-[0.4] opacity-90 border-transparent shadow-md' : 'border-transparent shadow-2xl shadow-zinc-100'}`}>
              
              {/* STATUS BARRA SUPERIOR */}
              <div className={`py-3 px-8 flex justify-between items-center ${isQuote ? 'bg-zinc-100 text-zinc-500' : isReady ? 'bg-emerald-500 text-white' : isDelivered ? 'bg-zinc-800 text-white' : 'bg-green-500 text-white'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isReady ? '✨ LISTO PARA ENTREGAR' : order.status}</span>
                    <span suppressHydrationWarning className="text-[10px] opacity-60 font-bold tracking-widest">
                        | #00{order.orderNumber} | {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                    <button className="hover:text-red-200 transition-colors p-1 active:scale-90"><Trash2 size={18} /></button>
                </form>
              </div>

              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                
                {/* COLUMNA IZQUIERDA: CLIENTE Y TALLER */}
                <div className="space-y-8 text-left">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-zinc-50 rounded-[25px] flex items-center justify-center text-black border border-zinc-100 shadow-inner"><User size={30} /></div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none text-black">
                                    {order.customerName}
                                </h4>
                                {order.isFromStore && (
                                    <span className="bg-accent text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em] animate-pulse">
                                        🛒 Web Store
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-widest italic">
                                {order.customerPhone || "Sin contacto"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-black text-white p-6 rounded-[35px] flex items-center justify-between shadow-xl text-left">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center"><PackageOpen size={24} className="text-accent" /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none mb-1">Item pedido</p>
                                <h5 className="text-xl font-black uppercase tracking-tighter leading-none truncate max-w-50 md:max-w-none">{product?.name || "Producto"}</h5>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black leading-none">{order.items[0]?.quantity}</p>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CANT.</p>
                        </div>
                    </div>

                    <div className="bg-zinc-50 p-6 rounded-[35px] border border-zinc-100 italic font-bold text-zinc-600 relative text-left">
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest italic underline decoration-accent decoration-2"><Paintbrush size={14} className="inline mr-2" />Hoja de Taller</p>
                        "{order.designDetails || "Sin instrucciones específicas de grabado."}"
                    </div>
                </div>

                {/* COLUMNA DERECHA: IMÁGENES Y FINANZAS */}
                <div className="flex flex-col justify-between space-y-10 text-left">
                    
                    {/* GALERÍA DE IMÁGENES */}
                    <div className="relative">
                        {order.images && order.images.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                                    {order.images.map((img: any) => (
                                        <div key={img.id} className="flex-none w-64 h-64 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative snap-center bg-zinc-100">
                                            <img src={img.url} className="w-full h-full object-cover" alt="Diseño" />
                                            <a href={img.url} target="_blank" className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-black rounded-full shadow-lg hover:scale-110 transition-all">
                                                <DownloadCloud size={16} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] font-black text-center text-zinc-400 uppercase tracking-widest italic">Fotos del pedido ({order.images.length})</p>
                            </div>
                        ) : (
                            <div className="h-64 rounded-[40px] bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300">
                                <ImageIcon size={40} />
                                <p className="text-[10px] font-black uppercase mt-2 italic tracking-widest">Sin referencias</p>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN FINANCIERA */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-100 pb-4 px-2 gap-4 text-left">
                            <div className="flex-1 text-left">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-2">Fecha Entrega</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-accent" />
                                    <p suppressHydrationWarning className={`text-xl font-black uppercase italic ${order.deliveryDate ? 'text-black' : 'text-zinc-200'}`}>
                                        {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-AR', {day:'2-digit', month:'short'}) : "Sin definir"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 text-left sm:text-right w-full">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Total a cobrar</p>
                                <p className="text-4xl font-black tracking-tighter text-black leading-none whitespace-nowrap">
                                    ${order.totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* ESTADO FINANCIERO */}
                        <div className="space-y-4 bg-zinc-50/50 p-4 rounded-[30px] border border-zinc-50 text-left">
                            <div className="flex justify-between items-end px-1 gap-2">
                                <span className="text-[10px] font-black uppercase text-zinc-400 text-left">Estado de pago</span>
                                {remaining > 0 && !isDelivered && (
                                    <AddPaymentModal orderId={order.id} remaining={remaining} />
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span suppressHydrationWarning className={`text-[10px] font-black px-3 py-1 rounded-full ${remaining <= 0 ? 'bg-green-500 text-white' : 'bg-accent text-white shadow-sm'}`}>
                                        {remaining <= 0 ? '✓ PAGADO' : `FALTA $${remaining.toLocaleString('es-AR')}`}
                                    </span>
                                </div>
                                <div className="w-full h-4 bg-zinc-200/50 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className="bg-green-500 h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(((order.totalPrice - remaining) / order.totalPrice) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACCIONES FINALES */}
                    <div className="pt-4 flex flex-col gap-3">
                        <div className="bg-zinc-50 p-4 rounded-[30px] flex flex-col gap-2">
                            {isReady ? (
                                <form action={async () => { "use server"; await markAsDelivered(order.id) }} className="w-full">
                                    <button className="w-full py-4 bg-emerald-500 text-white rounded-[25px] font-black text-[11px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-100 animate-in fade-in zoom-in duration-500">
                                        <Truck size={18}/> ¡Entregar a Cliente!
                                    </button>
                                </form>
                            ) : isQuote ? (
                                <ConfirmOrderModal orderId={order.id} />
                            ) : !isDelivered ? (
                                <div className="text-center py-2 text-[10px] font-black text-zinc-400 uppercase italic flex items-center justify-center gap-2">
                                    <Clock size={14}/> En proceso de fabricación
                                </div>
                            ) : (
                                <div className="text-center py-2 text-xs font-black text-green-600 uppercase flex items-center justify-center gap-2 italic">✓ Trabajo Entregado</div>
                            )}
                        </div>
                        
                        <div className="flex gap-2 w-full">
                            <div className="flex-1">
                                <OrderTicket order={order} businessName={dbUser?.name || "Koda Maker"} logoUrl={dbUser?.logoUrl} />
                            </div>
                            <div className="flex-1">
                                <EditOrderModal order={order} />
                            </div>
                        </div>
                        
                        <div className="text-center mt-2">
                            <a 
                                href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`} 
                                target="_blank" 
                                className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase hover:text-black transition-all"
                            >
                                <MessageSquare size={14} /> WhatsApp Cliente
                            </a>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* ESTADO VACÍO */}
        {orders.length === 0 && (
          <div className="text-center py-24 bg-zinc-50 rounded-[60px] border-2 border-dashed border-zinc-200 mx-4 md:mx-0">
             <ShoppingCart className="text-zinc-200 mx-auto mb-4 opacity-50" size={64} />
             <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs italic text-center w-full">No se encontraron pedidos con estos filtros</p>
          </div>
        )}
      </div>
    </div>
  )
}