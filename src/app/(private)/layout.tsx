import { Navigation } from "@/components/Navigation"
import { Suspense } from "react"
import { PushLoader } from "@/components/PushLoader" 
import { createClient } from "@/lib/supabase-server"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

// --- ESTA LÍNEA ES LA CLAVE ---
// Obliga a Next.js a ejecutar este archivo en cada clic/refresco
export const dynamic = 'force-dynamic' 
// ------------------------------

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Consultamos el plan siempre (ahora es instantáneo gracias a force-dynamic)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true }
  })

  // Si el plan es EXPIRED, lo sacamos volando del dashboard
  if (dbUser?.plan === 'EXPIRED') {
    redirect("/pago-requerido")
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] md:pl-20 pb-24 md:pb-0">
      <PushLoader />
      <Navigation />
      <main className="p-2 md:p-8 max-w-6xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-accent rounded-full animate-spin"></div>
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  )
}