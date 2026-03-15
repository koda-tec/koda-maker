import prisma from "@/lib/prisma"
import { 
  ShoppingBag, Star, LayoutGrid, ArrowRight, 
  Search, MessageSquare, LayoutDashboard, Globe, MapPin, Truck 
} from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-server"

export default async function PublicStorePage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ search?: string, cat?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  
  // Verificamos si hay un dueño logueado para mostrar el botón "Volver al Dashboard"
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const storeUser = await prisma.user.findUnique({
    where: { slug, isStoreActive: true },
    include: {
      templates: {
        where: { 
            isPublic: true,
            ...(query.cat ? { category: query.cat } : {}),
            ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
        },
        include: { images: true },
        orderBy: { name: 'asc' }
      }
    }
  })

  if (!storeUser) notFound()

  const categories = [...new Set(storeUser.templates.map(t => t.category))]
  const isOwner = authUser?.id === storeUser.id

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-accent selection:text-white">
      
      {/* BARRA DE DUEÑO (Solo visible para el emprendedor) */}
      {isOwner && (
        <div className="bg-accent py-2 px-6 flex justify-between items-center sticky top-0 z-60 shadow-lg">
            <p className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <LayoutDashboard size={12} /> Estás viendo tu tienda pública
            </p>
            <Link href="/dashboard" className="bg-white text-accent px-4 py-1 rounded-full text-[9px] font-black uppercase shadow-sm active:scale-95 transition-all">
                Volver al Panel
            </Link>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 ${isOwner ? '' : 'sticky top-0'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {storeUser.logoUrl && <img src={storeUser.logoUrl} className="w-10 h-10 rounded-xl object-contain shadow-sm border border-zinc-100 bg-white" alt="Logo" />}
            <span className="font-black tracking-tighter uppercase text-xl">{storeUser.name}</span>
          </div>
          <a href={`https://wa.me/${storeUser.phone}`} target="_blank" className="p-3 bg-zinc-100 rounded-2xl text-accent hover:bg-accent hover:text-white transition-all">
            <MessageSquare size={20} />
          </a>
        </div>
      </nav>

      {/* BUSCADOR Y FILTROS */}
      <section className="max-w-6xl mx-auto px-6 pt-12 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <form className="relative flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input name="search" placeholder="¿Qué estás buscando?" defaultValue={query.search} className="w-full pl-14 pr-6 py-5 bg-zinc-50 border-none rounded-[30px] outline-none focus:ring-2 focus:ring-accent font-bold" />
            </form>
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                <Link href={`/v/${slug}`} className={`px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${!query.cat ? 'bg-black text-white shadow-xl' : 'bg-white text-zinc-400 border-zinc-100'}`}>Todos</Link>
                {categories.map(cat => (
                    <Link key={cat} href={`?cat=${cat}`} className={`px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${query.cat === cat ? 'bg-black text-white shadow-xl' : 'bg-white text-zinc-400 border-zinc-100'}`}>{cat}</Link>
                ))}
            </div>
        </div>
      </section>

      {/* GRILLA DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto px-6 pt-16">
        {storeUser.templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {storeUser.templates.map((t) => (
              <Link key={t.id} href={`/v/${slug}/${t.id}`} className="group flex flex-col h-full">
                <div className="aspect-4/5 rounded-[50px] overflow-hidden bg-zinc-100 relative shadow-sm group-hover:shadow-2xl transition-all duration-700">
                  {t.images.length > 0 ? <img src={t.images[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={t.name} /> : <div className="flex items-center justify-center h-full text-zinc-200"><ShoppingBag size={80}/></div>}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-3xl font-black text-xl shadow-xl">${t.basePrice.toLocaleString('es-AR')}</div>
                  <div className="absolute inset-x-8 bottom-8 hidden md:block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"><div className="py-4 bg-black text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] text-center">Personalizar Ahora</div></div>
                </div>
                <div className="mt-8 px-2 space-y-3">
                  <h4 className="text-2xl font-black uppercase tracking-tighter text-black leading-none">{t.name}</h4>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-2 italic">{t.publicDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-8 bg-zinc-50 rounded-[60px] border-2 border-dashed border-zinc-100">
            <div className="max-w-md mx-auto space-y-4 px-6">
                <h3 className="text-3xl font-black uppercase tracking-tighter">No encontramos <br/> ese producto</h3>
                <p className="text-zinc-500 font-medium text-sm">Pero no te preocupes, somos expertos en diseños personalizados. Escribinos por WhatsApp y lo creamos para vos.</p>
                <a href={`https://wa.me/${storeUser.phone}?text=Hola! No encontré lo que buscaba en la web pero tengo una idea para un diseño personalizado...`} className="inline-flex items-center gap-3 bg-accent text-white px-10 py-5 rounded-[25px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-red-200 active:scale-95 transition-all">
                    <MessageSquare size={18} /> Chat Personalizado
                </a>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 pb-10 border-t border-zinc-100 pt-10 px-6 text-center">
        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Powered by Koda Maker • {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}