import Link from "next/link";
import { Zap, BarChart3, Package, Scissors, Box, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] text-black font-sans">
      {/* Header / Navbar */}
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <span className="font-bold tracking-tighter text-xl">KODA<span className="text-accent">MAKER</span></span>
        </div>
        <Link href="/login?mode=login" className="text-sm font-bold hover:text-accent transition-colors">
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-12 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-4">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Desarrollado por KODA Tech</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
          Toma el <br /> 
          <span className="text-accent">Control.</span>
        </h1>
        
        <p className="text-lg text-gray-600 max-w-xl mx-auto font-medium">
          La solución integral de gestión para emprendimientos de 3D, Láser y Personalizados. 
          Costos precisos, stock inteligente y presupuestos profesionales.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link 
            href="/login?mode=register" 
            className="px-10 py-5 bg-black text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-gray-900 transition-all"
          >
            Comenzar ahora
          </Link>
        </div>

        {/* Mini Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-20">
          <FeatureCard icon={<Zap />} title="Costos Pro" desc="Cálculo exacto por material y tiempo." />
          <FeatureCard icon={<Package />} title="Stock Real" desc="Alertas de bajo stock al celular." />
          <FeatureCard icon={<BarChart3 />} title="Analíticas" desc="Mira cuánto ganas mes a mes." />
          <FeatureCard icon={<Scissors />} title="Láser & 3D" desc="Plantillas de producción listas." />
          <FeatureCard icon={<Box />} title="Pedidos" desc="Estado de producción en vivo." />
          <div className="bg-accent p-6 rounded-3xl flex flex-col items-center justify-center text-white">
            <span className="font-black text-2xl leading-none">PWA</span>
            <span className="text-[10px] uppercase font-bold">App instalable</span>
          </div>
        </div>
      </main>

      {/* Branding Footer */}
      <footer className="border-t border-gray-100 py-12 text-center">
        <p className="text-sm font-medium text-gray-400">
          © {new Date().getFullYear()} KODA TECH — SISTEMAS DE GESTIÓN DE ALTO RENDIMIENTO
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-3xl text-left space-y-2 shadow-sm">
      <div className="text-accent">{icon}</div>
      <h3 className="font-bold text-sm uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-gray-500 leading-tight">{desc}</p>
    </div>
  );
}