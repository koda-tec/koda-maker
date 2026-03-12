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
  Wallet
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] text-black font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <img src="/logo-full.png" alt="Koda Maker" className="h-10 md:h-12 object-contain" />
          
          <div className="flex items-center gap-6">
            <Link href="/login?mode=login" className="hidden md:block text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
              Entrar
            </Link>
            <Link 
              href="/login?mode=register" 
              className="px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-accent transition-all active:scale-95"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main className="flex-1 pt-32 md:pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Professional Maker Suite</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase max-w-5xl mx-auto text-black">
            Gestionar es <br /> 
            <span className="text-accent italic">crear valor.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            La infraestructura digital para emprendimientos de 3D, Láser y Personalizados.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
            <Link 
              href="/login?mode=register" 
              className="group px-12 py-6 bg-black text-white rounded-[30px] font-black text-lg shadow-2xl hover:bg-accent transition-all flex items-center gap-3"
            >
              Crea tu cuenta
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* BENTO GRID SIMPLE PARA EVITAR ERRORES */}
        <section className="max-w-7xl mx-auto px-6 pt-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-zinc-100 p-10 rounded-[50px] shadow-sm">
                    <Zap className="text-accent mb-4" size={32} />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Costos Pro</h3>
                    <p className="text-zinc-500 text-sm mt-2">Cálculos automáticos basados en tus insumos.</p>
                </div>
                <div className="bg-zinc-950 p-10 rounded-[50px] text-white">
                    <Package className="text-accent mb-4" size={32} />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Stock Real</h3>
                    <p className="text-zinc-500 text-sm mt-2">Alertas push cuando te quedas sin material.</p>
                </div>
                <div className="bg-zinc-50 p-10 rounded-[50px]">
                    <Download className="text-black mb-4" size={32} />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Tickets PNG</h3>
                    <p className="text-zinc-500 text-sm mt-2">Generá presupuestos para mandar por WhatsApp.</p>
                </div>
            </div>
        </section>
      </main>

      {/* FOOTER - CORREGIDO CON SUPPRESS HYDRATION */}
      <footer className="border-t border-zinc-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
            <img src="/logo-full.png" alt="Koda Maker" className="h-6 mx-auto opacity-30 grayscale" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]" suppressHydrationWarning>
              © {new Date().getFullYear()} KODA TECH • SISTEMAS DE ALTO RENDIMIENTO
            </p>
        </div>
      </footer>
    </div>
  );
}