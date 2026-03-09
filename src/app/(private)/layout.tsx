import { Navigation } from "@/components/Navigation"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] md:pl-20 pb-24 md:pb-0">
      <Navigation />
      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  )
}