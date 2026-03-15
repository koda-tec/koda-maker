import prisma from "@/lib/prisma"
import { ShoppingBag, MapPin, Truck, Globe, MessageCircle } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const storeUser = await prisma.user.findUnique({
    where: { slug, isStoreActive: true },
    include: {
      templates: {
        where: { isPublic: true }
      }
    }
  })

  if (!storeUser) notFound()

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans pb-20">
      {/* HEADER TIENDA */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {storeUser.logoUrl && (
              <img src={storeUser.logoUrl} className="w-12 h-12 rounded-2xl object-contain shadow-sm border border-zinc-50" alt={storeUser.name || "Logo"} />
            )}
            <h1 className="text-2xl font-black tracking-tighter uppercase">{storeUser.name}</h1>
          </div>
          <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>

      {/* HERO TIENDA */}
      <section className="max-w-6xl mx-auto px-6 pt-16 text-center space-y-4">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
            Hagamos algo <br/> <span className="text-accent italic">increíble.</span>
        </h2>
        <p className="text-zinc-500 font-medium max-w-lg mx-auto italic">
            Seleccioná un producto para personalizarlo y enviarnos tu pedido.
        </p>
      </section>

      {/* CATÁLOGO */}
      <main className="max-w-6xl mx-auto px-6 pt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {storeUser.templates.map((t) => (
          <div key={t.id} className="bg-white rounded-[50px] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
            <div className="aspect-square relative overflow-hidden bg-zinc-100">
                {t.publicImage ? (
                    <img src={t.publicImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={t.name} />
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-300">
                        <ShoppingBag size={48} />
                    </div>
                )}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black shadow-sm">
                    ${t.basePrice.toLocaleString('es-AR')}
                </div>
            </div>
            
            <div className="p-8 space-y-4 flex-1 flex flex-col">
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{t.name}</h3>
                <p className="text-zinc-500 text-sm font-medium line-clamp-3 leading-relaxed flex-1 italic">
                    {t.publicDescription || "Sin descripción disponible."}
                </p>
                <Link 
                    href={`/v/${slug}/${t.id}`}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-accent transition-all active:scale-95"
                >
                    Personalizar Pedido
                </Link>
            </div>
          </div>
        ))}
      </main>

      {/* LOGÍSTICA INFORMACIÓN */}
      <footer className="max-w-4xl mx-auto mt-32 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-zinc-100 pt-20 text-center md:text-left">
          {storeUser.allowPickup && <InfoItem icon={<MapPin/>} title="Retiro Gratis" desc="Podés retirar por nuestro taller." />}
          {storeUser.localShippingCost > 0 && <InfoItem icon={<Truck/>} title="Envío Local" desc={`A domicilio por $${storeUser.localShippingCost}.`} />}
          {storeUser.allowNationwide && <InfoItem icon={<Globe/>} title="Todo el país" desc="Envíos por correo a convenir." />}
      </footer>
    </div>
  )
}

function InfoItem({ icon, title, desc }: any) {
    return (
        <div className="space-y-2">
            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mx-auto md:mx-0 text-accent">{icon}</div>
            <h4 className="font-black uppercase text-xs tracking-widest">{title}</h4>
            <p className="text-zinc-400 text-xs font-bold">{desc}</p>
        </div>
    )
}