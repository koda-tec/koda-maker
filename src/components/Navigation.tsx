"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  BookOpen, 
  Landmark,
  Store,
  Truck
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingCart },
  { name: "Logística", href: "/dashboard/logistica", icon: Truck }, 
  { name: "Plantillas", href: "/dashboard/templates", icon: BookOpen },
  { name: "Stock", href: "/dashboard/stock", icon: Package },
  { name: "Inversión", href: "/dashboard/inversion", icon: Landmark },
  { name: "Mi Tienda", href: "/dashboard/tienda", icon: Store }, 
  { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white border-t border-gray-100 px-1 pb-4 md:top-0 md:left-0 md:w-20 md:h-screen md:border-t-0 md:border-r md:flex-col md:py-8 md:px-0 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex h-full items-center justify-around md:flex-col md:justify-start md:gap-6">
        
        {/* LOGO KODA (PC) */}
        <div className="hidden md:flex mb-6 transition-transform hover:scale-110 duration-300">
          <Link href="/dashboard">
            <img src="/icon-192x192.png" alt="K" className="w-12 h-12 rounded-2xl shadow-lg border border-zinc-100 bg-white" />
          </Link>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 md:w-full md:py-2",
                isActive ? "text-accent" : "text-gray-400 hover:text-black"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-red-50 scale-110" : "bg-transparent hover:bg-gray-50"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[7px] font-black uppercase tracking-tighter md:hidden transition-all",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
        
        {/* CONFIGURACIÓN */}
        <div className="md:mt-auto">
            <Link 
              href="/dashboard/config" 
              className={cn(
                "p-3 rounded-2xl flex items-center justify-center transition-all",
                pathname === "/dashboard/config" ? "text-black bg-gray-100" : "text-gray-300 hover:text-black"
              )}
            >
                <Settings size={20} />
            </Link>
        </div>
      </div>
    </nav>
  )
}