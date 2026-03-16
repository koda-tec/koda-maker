import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ClientCustomizer } from "./ClientCustomizer"
import type { Metadata } from "next"

/**
 * GENERACIÓN DE METADATA DINÁMICA
 * Personaliza el título y el icono de la pestaña según la tienda
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const user = await prisma.user.findUnique({ where: { slug } })

    return {
        title: user?.name ? `Personalizar | ${user.name}` : "Tienda Online",
        description: `Configurá tu pedido personalizado en la tienda oficial de ${user?.name}.`,
        icons: {
            icon: user?.logoUrl || "/favicon.ico", 
            apple: user?.logoUrl || "/icon-192x192.png",
        }
    }
}

export default async function PublicProductPage({ params }: { params: Promise<{ slug: string, templateId: string }> }) {
    const { slug, templateId } = await params

    // 1. Cargamos el dueño de la tienda y la plantilla con su receta completa
    const [storeUser, template] = await Promise.all([
        prisma.user.findUnique({ where: { slug } }),
        prisma.productTemplate.findUnique({ 
            where: { id: templateId },
            include: { 
                images: true,
                // Es vital incluir los materiales y el stock actual para la validación
                materials: { 
                    include: { material: true } 
                } 
            }
        })
    ])

    // Validamos que la tienda exista y el producto sea público
    if (!storeUser || !template || !template.isPublic) notFound()

    /**
     * LÓGICA DE CÁLCULO DE STOCK MÁXIMO (CUELLO DE BOTELLA)
     * Revisamos cada material físico de la receta y vemos cuánto permite fabricar
     */
    const stockLimits = template.materials.map(item => {
        // Ignoramos el tiempo de máquina ya que no es un insumo agotable físicamente
        if (item.material.type === 'Máquina') return 9999; 
        
        // Si no hay stock o la cantidad necesaria es 0, evitamos división por cero
        if (item.material.stock <= 0 || item.quantity <= 0) return 0;

        // Stock disponible / Cantidad necesaria por unidad (Ej: 1000g / 200g = 5 unidades)
        return Math.floor(item.material.stock / item.quantity);
    });

    // El límite real es el valor más bajo de todos los insumos (el que primero se agota)
    // Si no hay materiales definidos, permitimos hasta 99 por defecto
    const maxAvailable = stockLimits.length > 0 ? Math.min(...stockLimits) : 99;

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-black font-sans pb-20 selection:bg-accent selection:text-white">
            
            {/* BARRA DE NAVEGACIÓN SUPERIOR */}
            <nav className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100">
                <div className="max-w-6xl mx-auto flex justify-between items-center px-2 md:px-6">
                    <Link 
                        href={`/v/${slug}`} 
                        className="p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all border border-zinc-100 active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="font-black uppercase text-[10px] tracking-[0.3em] text-zinc-400">Tienda de</span>
                        <span className="font-black uppercase text-xs tracking-widest text-black">{storeUser.name}</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
                {/* 
                  LLAMAMOS AL COMPONENTE INTERACTIVO 
                  Pasamos 'maxAvailable' para que la UI restrinja la compra
                */}
                <ClientCustomizer 
                    storeUser={storeUser} 
                    template={template} 
                    slug={slug} 
                    maxAvailable={maxAvailable} 
                />
            </main>
        </div>
    )
}