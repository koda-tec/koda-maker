import Link from "next/link";
import { 
  Zap, 
  BarChart3, 
  Package, 
  Box, 
  ShieldCheck, 
  ChevronRight, 
  Download, 
  MousePointerClick,
  Smartphone,
  Wallet,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-accent selection:text-white">
      
      {/* NAVBAR FIJO */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <img src="/logo-full.png" alt="Koda Maker" className="h-10 md:h-12 object-contain" />
          
          <div className="flex items-center gap-6">
            <Link href="/login?mode=login" className="hidden md:block text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
              Iniciar Sesión
            </Link>
            <Link 
              href="/login?mode=register" 
              className="px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-accent transition-all active:scale-95"
            >
              Probar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 pt-32 md:pt-48">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          
          <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sistema de Gestión para Fabricantes</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase max-w-5xl mx-auto text-black">
            Llevá tu taller <br /> 
            <span className="text-accent italic">al próximo nivel.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            La plataforma integral para emprendedores de 3D y Láser. 
            Controlá tus costos, automatizá tu stock y profesionalizá tus presupuestos.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
            <Link 
              href="/login?mode=register" 
              className="group px-12 py-6 bg-black text-white rounded-[30px] font-black text-lg shadow-2xl hover:bg-accent transition-all flex items-center gap-3"
            >
              Comenzar Ahora
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">PWA Habilitada</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Instalalo como App</p>
            </div>
          </div>
        </div>

        {/* BENTO GRID DE FUNCIONALIDADES */}
        <section className="max-w-7xl mx-auto px-6 pt-40">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-150">
                
                {/* Card Grande: Costos */}
                <div className="md:col-span-2 md:row-span-2 bg-white border border-zinc-100 p-10 rounded-[50px] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-accent mb-8 shadow-inner">
                        <Zap size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Costos <br/> Inteligentes</h3>
                        <p className="text-zinc-500 font-medium">Cargá tus insumos y dejalos que se actualicen solos. Si el precio del filamento o la madera sube, Koda Maker recalcula tus ganancias al instante.</p>
                    </div>
                </div>

                {/* Card: Stock */}
                <div className="bg-zinc-950 p-10 rounded-[50px] text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl">
                    <Package className="text-accent relative z-10" size={32} />
                    <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tighter">Stock Crítico</h3>
                        <p className="text-zinc-500 text-xs mt-2 uppercase font-bold">Alertas Push automáticas</p>
                    </div>
                    <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-accent rounded-full blur-[60px] opacity-30" />
                </div>

                {/* Card: WhatsApp */}
                <div className="bg-zinc-50 p-10 rounded-[50px] flex flex-col justify-between group hover:bg-white border border-transparent hover:border-zinc-100 transition-all shadow-inner">
                    <Download className="text-black" size={32} />
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-2">Presupuestos PNG</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter italic">Vende por WhatsApp como un Pro.</p>
                    </div>
                </div>

                {/* Card: Finanzas */}
                <div className="md:col-span-2 bg-white border border-zinc-100 p-10 rounded-[50px] flex flex-col md:flex-row items-center gap-8 shadow-sm group hover:border-accent transition-all">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0 shadow-inner">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Control de Pagos</h3>
                        <p className="text-zinc-500 text-sm font-medium">Seguimiento de señas y saldos pendientes. Un panel financiero real para tu emprendimiento.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* SECCIÓN MÓVIL / PWA */}
        <section className="bg-zinc-50 mt-40 py-32 border-y border-zinc-100">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    Toda tu fábrica <br /> en tu <span className="text-accent">bolsillo.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 text-center">
                    <FeatureItem icon={<Smartphone />} title="App Nativa" desc="Instalalo como App en tu celular." />
                    <FeatureItem icon={<MousePointerClick />} title="Ultra Veloz" desc="Diseñado para trabajar en el taller." />
                    <FeatureItem icon={<BarChart3 />} title="Reportes" desc="Mirá tus ganancias mes a mes." />
                </div>
            </div>
        </section>
      </main>

      {/* FOOTER - PROTEGIDO CONTRA HYDRATION ERRORS */}
      <footer className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4">
            <img src="/logo-full.png" alt="Koda Maker" className="h-8 mx-auto md:mx-0 opacity-40 grayscale hover:grayscale-0 transition-all" />
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]" suppressHydrationWarning>
              © {new Date().getFullYear()} KODA TECH • SISTEMAS DE ALTO RENDIMIENTO
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10">
            <FooterLink label="Dashboard" href="/dashboard" />
            <FooterLink label="Privacidad" href="/" />
            <FooterLink label="Soporte" href="/" />
            <FooterLink label="Koda Startup" href="/" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES PARA LIMPIEZA DE CÓDIGO
function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="space-y-4 flex flex-col items-center group">
            <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-accent border border-zinc-50 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="font-black uppercase text-sm tracking-tighter">{title}</h4>
            <p className="text-zinc-500 text-xs font-bold leading-relaxed px-4">{desc}</p>
        </div>
    )
}

function FooterLink({ label, href }: { label: string, href: string }) {
    return (
        <Link href={href} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-accent transition-colors">
            {label}
        </Link>
    )
}