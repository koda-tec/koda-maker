import Link from "next/link";
import { 
  Zap, 
  BarChart3, 
  Package, 
  Scissors, 
  Box, 
  ShieldCheck, 
  ChevronRight, 
  Download, 
  MousePointerClick,
  Smartphone,
  Wallet
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-accent selection:text-white">
      
      {/* NAVBAR PROFESIONAL */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <img src="/logo-full.png" alt="Koda Maker" className="h-10 md:h-12 object-contain" />
          
          <div className="flex items-center gap-6">
            <Link href="/login?mode=login" className="hidden md:block text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
              Iniciar Sesión
            </Link>
            <Link 
              href="/login?mode=register" 
              className="px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-accent transition-all active:scale-95"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 pt-32 md:pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          
          <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full mb-4 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Trusted by Professional Makers</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase max-w-5xl mx-auto">
            Gestionar es <br /> 
            <span className="text-accent italic">crear valor.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            La infraestructura digital definitiva para emprendimientos de 3D, Láser y Personalizados. 
            Costos exactos, stock en tiempo real y flujo de caja profesional.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
            <Link 
              href="/login?mode=register" 
              className="group px-12 py-6 bg-black text-white rounded-[30px] font-black text-lg shadow-2xl hover:bg-accent transition-all flex items-center gap-3"
            >
              Crea tu cuenta ahora
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Sin tarjetas de crédito. <br /> Comienza en 30 segundos.
            </p>
          </div>
        </div>

        {/* BENTO GRID DE FUNCIONALIDADES */}
        <section className="max-w-7xl mx-auto px-6 pt-32">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-150">
                
                {/* Card Grande: Costos */}
                <div className="md:col-span-2 md:row-span-2 bg-white border border-zinc-100 p-10 rounded-[50px] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-accent mb-8">
                        <Zap size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Calculadora de <br/> Costos Inteligente</h3>
                        <p className="text-zinc-500 font-medium">Sincroniza el precio de tus insumos con tus productos. Si el material sube, tu margen se protege automáticamente.</p>
                    </div>
                </div>

                {/* Card: Stock */}
                <div className="bg-zinc-950 p-10 rounded-[50px] text-white flex flex-col justify-between relative overflow-hidden group">
                    <Package className="text-accent relative z-10" size={32} />
                    <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tighter">Stock Real</h3>
                        <p className="text-zinc-500 text-xs mt-2">Alertas push directas a tu celular cuando te quedas sin material.</p>
                    </div>
                    <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-accent rounded-full blur-[60px] opacity-20" />
                </div>

                {/* Card: WhatsApp */}
                <div className="bg-zinc-50 p-10 rounded-[50px] flex flex-col justify-between group hover:bg-white border border-transparent hover:border-zinc-100 transition-all">
                    <Download className="text-black" size={32} />
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Presupuestos PNG</h3>
                        <p className="text-zinc-500 text-xs mt-2">Genera tickets profesionales con tu logo para enviar por WhatsApp.</p>
                    </div>
                </div>

                {/* Card: Finanzas */}
                <div className="md:col-span-2 bg-white border border-zinc-100 p-10 rounded-[50px] flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Control de Pagos</h3>
                        <p className="text-zinc-500 text-sm mt-1">Registra señas y pagos parciales. Nunca entregues un pedido sin cobrar el saldo.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* SECCIÓN MÓVIL */}
        <section className="max-w-4xl mx-auto px-6 pt-40 text-center space-y-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                Diseñado para el <span className="text-accent">celular.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10">
                <Step icon={<Smartphone />} title="PWA Nativa" desc="Instalalo en tu Android o iPhone como una App real." />
                <Step icon={<MousePointerClick />} title="Ultra Veloz" desc="Navegación instantánea optimizada para el taller." />
                <Step icon={<BarChart3 />} title="Analíticas" desc="Gráficos de ganancia neta para ver tu crecimiento." />
            </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <img src="/logo-full.png" alt="Koda Maker" className="h-8 mx-auto md:mx-0 opacity-50 grayscale hover:grayscale-0 transition-all" />
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              © {new Date().getFullYear()} KODA TECH • SISTEMAS DE ALTO RENDIMIENTO
            </p>
          </div>
          
          <div className="flex gap-8">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Soporte</Link>
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Privacidad</Link>
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="space-y-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-white shadow-lg rounded-2xl flex items-center justify-center text-accent border border-zinc-50">
                {icon}
            </div>
            <h4 className="font-black uppercase text-sm tracking-tighter">{title}</h4>
            <p className="text-zinc-500 text-xs font-medium leading-relaxed">{desc}</p>
        </div>
    )
}