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
  Info
} from "lucide-react"
import { createOrder, deleteOrder } from "./actions"
import { OrderTicket } from "@/components/OrderTicket"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { 
      items: { include: { template: true } }, 
      payments: true 
    },
    orderBy: { createdAt: "desc" }
  })

  const templates = await prisma.productTemplate.findMany({
    where: { userId: user?.id },
    orderBy: { name: "asc" }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 pt-6 px-2 md:px-4">
      
      <header className="text-center md:text-left px-2">
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1">Koda Maker</h1>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Libro de Pedidos</h2>
      </header>

      {/* FORMULARIO: Nota el encType="multipart/form-data" */}
      <section className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100 mx-2 md:mx-0">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-[#f13d4b] rounded-full" />
            <h3 className="font-black uppercase text-xs tracking-widest text-gray-800">Nueva Venta</h3>
        </div>

        <form action={createOrder} encType="multipart/form-data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="customerName" placeholder="Nombre Cliente" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-none focus:ring-2 focus:ring-[#f13d4b]" required />
            <input name="customerPhone" placeholder="WhatsApp (Ej: 11 2233 4455)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-none focus:ring-2 focus:ring-[#f13d4b]" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <select name="templateId" className="col-span-2 md:col-span-2 p-4 bg-gray-50 rounded-2xl text-sm font-black border-none" required>
                <option value="">Seleccionar Producto...</option>
                {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (${t.basePrice})</option>
                ))}
            </select>
            <input name="quantity" type="number" defaultValue="1" className="p-4 bg-gray-50 rounded-2xl text-sm font-black text-center border-none" required />
          </div>

          <textarea name="designDetails" placeholder="Instrucciones de grabado..." className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-medium h-24 border-none resize-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Foto de referencia</label>
                <input name="file" type="file" accept="image/*" className="w-full p-3 bg-gray-50 rounded-2xl text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-black file:text-white file:font-black" />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Fecha Estimada Entrega</label>
                <input name="deliveryDate" type="date" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-black border-none" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="deposit" type="number" step="0.01" placeholder="Seña inicial $" className="p-4 bg-red-50 text-[#f13d4b] rounded-2xl font-black border-none" />
            <select name="status" className="p-4 bg-gray-50 rounded-2xl text-sm font-black border-none">
                <option value="CONFIRMADO">✓ CONFIRMADO</option>
                <option value="PRESUPUESTADO">? PRESUPUESTO</option>
            </select>
          </div>

          <button type="submit" className="w-full p-5 bg-black text-white rounded-24px font-black uppercase text-xs tracking-widest hover:bg-[#f13d4b] transition-all shadow-xl active:scale-95">
            Registrar Operación
          </button>
        </form>
      </section>

      {/* LISTADO DE PEDIDOS */}
      <div className="space-y-8">
        {orders.map((order) => {
          const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
          const remaining = order.totalPrice - totalPaid;
          const isQuote = order.status === "PRESUPUESTADO";
          const product = order.items[0]?.template;

          return (
            <div key={order.id} className={`bg-white rounded-[45px] overflow-hidden border-2 transition-all ${isQuote ? 'border-dashed border-gray-200' : 'border-transparent shadow-2xl shadow-gray-100'}`}>
              
              <div className={`py-3 px-8 flex justify-between items-center ${isQuote ? 'bg-gray-100 text-gray-500' : 'bg-green-500 text-white'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{order.status}</span>
                    <span className="text-[10px] opacity-60 font-bold tracking-widest">| CREADO: {new Date(order.createdAt).toLocaleDateString('es-AR')}</span>
                </div>
                <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                    <button className="hover:text-red-200 transition-colors p-1"><Trash2 size={18} /></button>
                </form>
              </div>

              <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-50 rounded-[25px] flex items-center justify-center text-black border border-gray-100 shadow-inner">
                                <User size={30} />
                            </div>
                            <div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{order.customerName}</h4>
                                <p className="text-[10px] font-bold text-[#f13d4b] uppercase mt-2 tracking-widest">{order.customerPhone || "Sin contacto"}</p>
                            </div>
                        </div>

                        <div className="bg-black text-white p-6 rounded-[35px] flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                                    <PackageOpen size={24} className="text-[#f13d4b]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Item solicitado</p>
                                    <h5 className="text-xl font-black uppercase tracking-tighter leading-none truncate max-w-150px md:max-w-none">{product?.name || "Producto"}</h5>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black leading-none">{order.items[0]?.quantity}</p>
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">CANT.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-[35px] border border-gray-100 relative">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">
                                <Paintbrush size={14} className="text-[#f13d4b]" /> Hoja de Taller
                            </div>
                            <p className="text-base font-bold text-gray-600 italic leading-relaxed">
                                "{order.designDetails || "Sin instrucciones específicas."}"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-8">
                        {/* PREVISUALIZACIÓN DE IMAGEN CORREGIDA */}
                        <div className="relative">
                            {order.fileUrl ? (
                                <div className="space-y-3">
                                    <div className="rounded-[40px] overflow-hidden border-8 border-white shadow-2xl h-64 relative bg-gray-100">
                                        <img src={order.fileUrl} className="w-full h-full object-cover" alt="Diseño" />
                                        <a 
                                            href={order.fileUrl} 
                                            target="_blank" 
                                            className="absolute bottom-4 right-4 p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all"
                                        >
                                            <DownloadCloud size={20} />
                                        </a>
                                    </div>
                                    <p className="text-[9px] font-black text-center text-gray-400 uppercase tracking-widest italic">Referencia adjunta lista</p>
                                </div>
                            ) : (
                                <div className="h-64 rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                                    <ImageIcon size={40} />
                                    <p className="text-[10px] font-black uppercase mt-2">Sin imagen adjunta</p>
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
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                                    <p className="text-4xl font-black tracking-tighter">${order.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Progreso cobro</span>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${remaining <= 0 ? 'bg-green-500 text-white' : 'bg-[#f13d4b] text-white'}`}>
                                        {remaining <= 0 ? 'COBRADO' : `FALTA $${remaining.toFixed(2)}`}
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

                        <div className="pt-4 flex flex-col gap-3">
                            <OrderTicket order={order} businessName={user?.user_metadata?.full_name || "SyG Creaciones"} />
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-[60px] border-2 border-dashed border-gray-200">
             <ShoppingCart className="text-gray-200 mx-auto mb-4" size={64} />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay operaciones registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}