"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingCart },
  { name: "Plantillas", href: "/dashboard/templates", icon: BookOpen }, 
  { name: "Stock", href: "/dashboard/stock", icon: Package },
  { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full h-20 bg-white border-t border-gray-100 px-6 pb-4 md:top-0 md:left-0 md:w-20 md:h-screen md:border-t-0 md:border-r md:flex-col md:py-8 md:px-0">
      <div className="flex h-full items-center justify-between md:flex-col md:gap-8">
        {/* Logo en PC */}
        <div className="hidden md:flex w-10 h-10 bg-black rounded-xl items-center justify-center mb-4">
          <span className="text-white font-black">K</span>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 md:w-full md:py-3",
                isActive ? "text-[#f13d4b]" : "text-gray-400 hover:text-black"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all",
                isActive ? "bg-red-50" : "bg-transparent"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter md:hidden">
                {item.name}
              </span>
            </Link>
          )
        })}
        
        <div className="md:mt-auto">
            <Link href="/dashboard/config" className="text-gray-400 hover:text-black">
                <Settings size={24} />
            </Link>
        </div>
      </div>
    </nav>
  )
}