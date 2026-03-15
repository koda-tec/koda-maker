import prisma from "@/lib/prisma"
import { 
  ShoppingBag, 
  MapPin, 
  Truck, 
  Globe, 
  Star, 
  Clock, 
  ShieldCheck,
  LayoutGrid,
  ArrowRight
} from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const storeUser = await prisma.user.findUnique({
    where: { slug, isStoreActive: true },
    include: {
      templates: {
        where: { isPublic: true },
        include: { images: true },
        orderBy: { name: 'asc' }
      }
    }
  })

  if (!storeUser) notFound()

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-accent selection:text-white">
      
      {/* 1. NAVBAR REFINADO */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {storeUser.logoUrl ? (
              <img src={storeUser.logoUrl} className="w-10 h-10 rounded-xl object-contain shadow-sm border border-zinc-100 bg-white" alt="Logo" />
            ) : (
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black">
                {storeUser.name?.charAt(0)}
              </div>
            )}
            <span className="font-black tracking-tighter uppercase text-lg md:text-xl">{storeUser.name}</span>
          </div>
          
          {/* Badge sutil de tienda oficial */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
            <ShieldCheck size={12} className="text-accent" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Tienda Verificada</span>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full mb-4">
            <Star className="w-3 h-3 text-accent fill-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Diseños Únicos a Pedido</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-black">
            Tu idea hecha <br /> 
            <span className="text-accent italic">realidad.</span>
          </h1>
          <p className="text-base md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed italic">
            Elegí un producto, subí tu diseño y nosotros lo fabricamos con tecnología láser y 3D.
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[120px] rounded-full z-0" />
      </section>

      {/* 3. GRILLA DE PRODUCTOS (ACCESIBLE EN MOBILE) */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-4 mb-12">
            <LayoutGrid size={20} className="text-accent" />
            <h3 className="font-black uppercase text-sm tracking-[0.3em] text-zinc-400">Catálogo de Productos</h3>
            <div className="h-px bg-zinc-100 flex-1" />
        </div>

        {storeUser.templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {storeUser.templates.map((t) => (
              <Link key={t.id} href={`/v/${slug}/${t.id}`} className="group flex flex-col h-full">
                {/* Imagen del Producto */}
                <div className="aspect-4/5 rounded-[50px] overflow-hidden bg-zinc-100 relative shadow-sm group-hover:shadow-2xl transition-all duration-700">
                  {t.images && t.images.length > 0 ? (
                    <img 
                      src={t.images[0].url} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      alt={t.name} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-200">
                      <ShoppingBag size={80} strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Precio Flotante */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-3xl font-black text-xl shadow-xl border border-white/20">
                    ${t.basePrice.toLocaleString('es-AR')}
                  </div>

                  {/* Botón Overlay - Visible en Hover (Desktop) y siempre presente en el flujo (Mobile) */}
                  <div className="absolute inset-x-8 bottom-8 hidden md:block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <div className="py-4 bg-black text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] text-center shadow-2xl">
                        Personalizar Ahora
                    </div>
                  </div>
                </div>

                {/* Info del Producto */}
                <div className="mt-8 px-2 space-y-3 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-black leading-none group-hover:text-accent transition-colors">
                      {t.name}
                    </h4>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-3 italic flex-1">
                    {t.publicDescription || "Producto personalizado con materiales de alta calidad."}
                  </p>
                  
                  {/* Botón visible solo en Mobile */}
                  <div className="md:hidden pt-4">
                    <div className="py-4 bg-zinc-100 text-black rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] text-center flex items-center justify-center gap-2">
                        Personalizar <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center text-zinc-300 font-black uppercase tracking-widest italic">
            Próximamente nuevos ingresos...
          </div>
        )}
      </main>

      {/* 4. SECCIÓN LOGÍSTICA */}
      <section className="max-w-4xl mx-auto mt-40 px-6 py-20 bg-white border-2 border-zinc-50 rounded-[60px] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
                <MapPin className="mx-auto md:mx-0 text-accent" />
                <h5 className="font-black uppercase text-xs">Retiro por Taller</h5>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed">Sin costo adicional.</p>
            </div>
            <div className="space-y-4">
                <Truck className="mx-auto md:mx-0 text-accent" />
                <h5 className="font-black uppercase text-xs">Envíos Locales</h5>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed">Consultá costos por zona.</p>
            </div>
            <div className="space-y-4">
                <Globe className="mx-auto md:mx-0 text-accent" />
                <h5 className="font-black uppercase text-xs">Todo el país</h5>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed">Envíos por correo certificado.</p>
            </div>
          </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="mt-40 pb-10 border-t border-zinc-100 pt-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
                Powered by Koda Maker • {new Date().getFullYear()}
            </p>
            <div className="flex gap-6">
                <ShieldCheck size={20} className="text-zinc-200" />
                <Clock size={20} className="text-zinc-200" />
            </div>
        </div>
      </footer>
    </div>
  )
}