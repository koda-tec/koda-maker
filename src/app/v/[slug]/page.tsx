import prisma from "@/lib/prisma"
import { 
  ShoppingBag, 
  MapPin, 
  Truck, 
  Globe, 
  ArrowRight, 
  Star, 
  Clock, 
  ShieldCheck,
  LayoutGrid
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
        orderBy: { name: 'asc' }
      }
    }
  })

  if (!storeUser) notFound()

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-accent selection:text-white">
      
      {/* 1. NAVBAR PREMIUM */}
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
          <div className="flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-2xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Pedidos Abiertos</span>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION DINÁMICO */}
      <section className="pt-32 md:pt-48 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full mb-4">
            <Star className="w-3 h-3 text-accent fill-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Diseños Exclusivos & Personalizados</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-black">
            Tu idea hecha <br /> 
            <span className="text-accent italic underline decoration-black/5 decoration-8 underline-offset-8">realidad.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Elegí un producto de nuestro catálogo y personalizalo a tu gusto. Fabricación artesanal con tecnología láser y 3D.
          </p>
        </div>
        {/* Decoración de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[120px] rounded-full z-0" />
      </section>

      {/* 3. GRILLA DE PRODUCTOS (MODERNA) */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-4 mb-12">
            <LayoutGrid size={20} className="text-accent" />
            <h3 className="font-black uppercase text-sm tracking-[0.3em] text-zinc-400">Catálogo Disponible</h3>
            <div className="h-px bg-zinc-100 flex-1" />
        </div>

        {storeUser.templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {storeUser.templates.map((t) => (
              <div key={t.id} className="group relative flex flex-col">
                {/* Imagen del Producto */}
                <div className="aspect-4/5 rounded-[50px] overflow-hidden bg-zinc-100 relative shadow-sm group-hover:shadow-2xl transition-all duration-700">
                  {t.publicImage ? (
                    <img 
                      src={t.publicImage} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      alt={t.name} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-200">
                      <ShoppingBag size={80} strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Precio Flotante */}
                  <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-5 py-3 rounded-3xl font-black text-xl shadow-xl border border-white/20 scale-90 group-hover:scale-100 transition-transform">
                    ${t.basePrice.toLocaleString('es-AR')}
                  </div>

                  {/* Overlay de acción rápida */}
                  <Link 
                    href={`/v/${slug}/${t.id}`}
                    className="absolute inset-x-8 bottom-8 py-5 bg-black text-white rounded-[28px] font-black uppercase text-[10px] tracking-[0.2em] text-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-accent"
                  >
                    Personalizar Ahora
                  </Link>
                </div>

                {/* Info del Producto */}
                <div className="mt-8 px-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-black leading-none">{t.name}</h4>
                    <span className="text-[10px] font-black uppercase text-accent bg-red-50 px-2 py-1 rounded-lg">New</span>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-2 italic">
                    {t.publicDescription || "Diseño a pedido con materiales de primera calidad."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
                <ShoppingBag size={40} />
            </div>
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Estamos preparando nuevos productos...</p>
          </div>
        )}
      </main>

      {/* 4. SECCIÓN DE CONFIANZA */}
      <section className="max-w-5xl mx-auto mt-40 px-6 py-20 bg-zinc-950 rounded-[60px] text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 text-center md:text-left">
            <Feature num="01" title="Personalización" desc="Subí tu logo o frase y nosotros nos encargamos del grabado." />
            <Feature num="02" title="Calidad Maker" desc="Usamos materiales seleccionados y tecnología de precisión." />
            <Feature num="03" title="Pago Seguro" desc="Aceptamos todas las tarjetas vía Mercado Pago." />
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent rounded-full blur-[100px] opacity-20" />
      </section>

      {/* 5. LOGÍSTICA DE ENVÍOS */}
      <footer className="max-w-6xl mx-auto mt-40 px-6 border-t border-zinc-100 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-accent"><MapPin/></div>
                <h5 className="font-black uppercase text-sm tracking-widest">Retiro en Taller</h5>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed">Vení a buscar tu pedido personalmente sin costo de envío adicional.</p>
            </div>
            <div className="space-y-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-accent"><Truck/></div>
                <h5 className="font-black uppercase text-sm tracking-widest">Envíos Locales</h5>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed">Llegamos a tu domicilio mediante mensajería privada (Consultar zonas).</p>
            </div>
            <div className="space-y-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-accent"><Globe/></div>
                <h5 className="font-black uppercase text-sm tracking-widest">Envíos Nacionales</h5>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed">Mandamos tu pedido a cualquier punto del país por correo certificado.</p>
            </div>
        </div>

        <div className="mt-32 pb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-zinc-50 pt-10">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
                Powered by Koda Maker • 2025
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

function Feature({ num, title, desc }: any) {
    return (
        <div className="space-y-4 px-4">
            <span className="text-4xl font-black text-zinc-800 leading-none">{num}</span>
            <h4 className="text-xl font-black uppercase tracking-tighter text-white leading-none">{title}</h4>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
    )
}