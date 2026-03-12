import { Navigation } from "@/components/Navigation"
import { Suspense } from "react"
import { PushLoader } from "@/components/PushLoader" 

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
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