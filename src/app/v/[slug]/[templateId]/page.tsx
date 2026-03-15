import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ClientCustomizer } from "./ClientCustomizer"

export default async function PublicProductPage({ params }: { params: Promise<{ slug: string, templateId: string }> }) {
    const { slug, templateId } = await params

    const[storeUser, template] = await Promise.all([
        prisma.user.findUnique({ where: { slug } }),
        prisma.productTemplate.findUnique({ 
            where: { id: templateId },
            include: { images: true }
        })
    ])

    if (!storeUser || !template || !template.isPublic) notFound()

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-black font-sans pb-20 selection:bg-accent selection:text-white">
            
            {/* Nav de producto */}
            <nav className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100">
                <div className="max-w-6xl mx-auto flex justify-between items-center px-2 md:px-6">
                    <Link href={`/v/${slug}`} className="p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all border border-zinc-100">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="font-black uppercase text-[10px] tracking-[0.3em] text-zinc-400">Tienda de</span>
                        <span className="font-black uppercase text-xs tracking-widest">{storeUser.name}</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
                {/* LLAMAMOS AL COMPONENTE INTERACTIVO */}
                <ClientCustomizer 
                    storeUser={storeUser} 
                    template={template} 
                    slug={slug} 
                />
            </main>
        </div>
    )
}