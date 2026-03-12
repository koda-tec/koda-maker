"use client"
import { useState } from "react";
import Link from "next/link";
import { 
  Zap, 
  BarChart3, 
  Package, 
  ShieldCheck, 
  ChevronRight, 
  Download, 
  MousePointerClick,
  Smartphone,
  Wallet,
  ArrowRight,
  Share,
  PlusSquare,
  CheckCircle2,
  Box
} from "lucide-react";

export default function Home() {
  const [tab, setTab] = useState<'android' | 'ios'>('android');

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-accent selection:text-white">
      
      {/* NAVBAR PROFESIONAL */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo Full de Koda Maker */}
          <img src="/logo-full.png" alt="Koda Maker" className="h-10 md:h-12 object-contain" />
          
          <div className="flex items-center gap-6">
            <Link href="/login?mode=login" className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1">
        
        {/* SECCIÓN HERO */}
        <section className="pt-32 md:pt-56 pb-20 px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full mb-4 animate-in fade-in slide-in-from-top duration-1000">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Professional Maker Suite — v1.0</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase max-w-5xl mx-auto text-black">
            Gestionar es <br /> 
            <span className="text-accent italic">crear valor.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            La infraestructura digital definitiva para emprendedores de 3D y Láser. 
            Controlá tus costos, automatizá tu stock y profesionalizá tus presupuestos.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
            <Link 
              href="/login?mode=register" 
              className="group px-12 py-6 bg-black text-white rounded-[30px] font-black text-lg shadow-2xl hover:bg-accent transition-all flex items-center gap-3 active:scale-95"
            >
              Crea tu cuenta ahora
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-left hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Sin tarjetas de crédito.</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Comienza en 30 segundos.</p>
            </div>
          </div>
        </section>

        {/* GUÍA DE INSTALACIÓN PWA */}
        <section className="max-w-5xl mx-auto px-6 pt-40 space-y-16">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">Instalación <span className="text-accent italic">instantánea.</span></h2>
                <p className="text-zinc-500 font-medium max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                    Koda Maker es una PWA: no necesitás descargar nada de una tienda. Instalala en segundos y usala como una App nativa.
                </p>
            </div>

            <div className="bg-white border border-zinc-100 rounded-[50px] shadow-2xl overflow-hidden">
                {/* Selector de Pestañas */}
                <div className="flex border-b border-zinc-100 bg-zinc-50/50">
                    <button 
                        onClick={() => setTab('android')}
                        className={`flex-1 py-6 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${tab === 'android' ? 'bg-white text-black border-b-4 border-accent' : 'text-zinc-400 opacity-50'}`}
                    >
                        Android / Chrome
                    </button>
                    <button 
                        onClick={() => setTab('ios')}
                        className={`flex-1 py-6 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${tab === 'ios' ? 'bg-white text-black border-b-4 border-accent' : 'text-zinc-400 opacity-50'}`}
                    >
                        iPhone / iOS
                    </button>
                </div>

                {/* Pasos dinámicos */}
                <div className="p-10 md:p-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {tab === 'android' ? (
                            <>
                                <InstallStep num="01" icon={<Download />} title="Menú de Chrome" desc="Toca los tres puntos (⋮) arriba a la derecha en el navegador." />
                                <InstallStep num="02" icon={<PlusSquare />} title="Instalar App" desc="Busca la opción 'Instalar aplicación' o 'Agregar a pantalla de inicio'." />
                                <InstallStep num="03" icon={<CheckCircle2 />} title="Todo listo" desc="El icono de Koda Maker aparecerá en tu escritorio como una App real." />
                            </>
                        ) : (
                            <>
                                <InstallStep num="01" icon={<Share />} title="Compartir" desc="En Safari, toca el icono de compartir (el cuadrado con la flecha) abajo." />
                                <InstallStep num="02" icon={<PlusSquare />} title="Pantalla de Inicio" desc="Deslizá hacia abajo y seleccioná 'Agregar a la pantalla de inicio'." />
                                <InstallStep num="03" icon={<CheckCircle2 />} title="Confirmar" desc="Toca 'Agregar' arriba a la derecha y disfruta de la experiencia nativa." />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* BENTO GRID DE FUNCIONALIDADES */}
        <section className="max-w-7xl mx-auto px-6 pt-56 space-y-16">
            <div className="text-center">
                <h3 className="font-black uppercase text-sm tracking-[0.4em] text-zinc-300 italic mb-4">Core Features</h3>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Potencia <span className="text-accent">Maker.</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-150">
                {/* Costos */}
                <div className="md:col-span-2 md:row-span-2 bg-white border border-zinc-100 p-12 rounded-[60px] shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all">
                    <div className="w-20 h-20 bg-red-50 rounded-[35px] flex items-center justify-center text-accent mb-10 shadow-inner">
                        <Zap size={40} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">Costos <br/> en vivo.</h3>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed">Sincroniza el precio de tus insumos. Si el material sube, tus márgenes de ganancia se protegen al instante.</p>
                    </div>
                </div>

                {/* Stock */}
                <div className="bg-zinc-950 p-12 rounded-[60px] text-white flex flex-col justify-between relative overflow-hidden group shadow-xl">
                    <Package className="text-accent relative z-10" size={32} />
                    <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Stock Inteligente</h3>
                        <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">Notificaciones push cuando te queda poco material.</p>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-accent rounded-full blur-[100px] opacity-20" />
                </div>

                {/* Tickets */}
                <div className="bg-zinc-50 p-12 rounded-[60px] flex flex-col justify-between group hover:bg-white border border-transparent hover:border-zinc-100 transition-all">
                    <Download className="text-black" size={32} />
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Tickets PNG</h3>
                        <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">Generá presupuestos estéticos para mandar por WhatsApp.</p>
                    </div>
                </div>

                {/* Pagos */}
                <div className="md:col-span-2 bg-white border border-zinc-100 p-12 rounded-[60px] flex flex-col md:flex-row items-center gap-10 shadow-sm">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0 shadow-inner">
                        <Wallet size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic underline decoration-accent decoration-4">Cuentas por Cobrar</h3>
                        <p className="text-zinc-500 font-medium leading-relaxed">Seguimiento de señas y saldos pendientes. Nunca entregues un pedido sin haberlo cobrado totalmente.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* SECCIÓN MÓVIL SPEED */}
        <section className="bg-zinc-950 mt-56 py-40 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-white">
                    Toda tu fábrica <br /> en tu <span className="text-accent italic">bolsillo.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16">
                    <div className="space-y-4">
                        <Smartphone className="text-accent mx-auto" size={40} />
                        <h4 className="text-white font-black uppercase tracking-tighter">PWA Nativa</h4>
                    </div>
                    <div className="space-y-4">
                        <MousePointerClick className="text-accent mx-auto" size={40} />
                        <h4 className="text-white font-black uppercase tracking-tighter">Ultra Veloz</h4>
                    </div>
                    <div className="space-y-4">
                        <BarChart3 className="text-accent mx-auto" size={40} />
                        <h4 className="text-white font-black uppercase tracking-tighter">Analíticas</h4>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-[120px] rounded-full" />
        </section>
      </main>

      {/* FOOTER PROFESIONAL */}
      <footer className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-16 text-center md:text-left">
          <div className="space-y-4">
            <img src="/logo-full.png" alt="Koda Maker" className="h-10 mx-auto md:mx-0 opacity-40 grayscale hover:grayscale-0 transition-all duration-500" />
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.5em] italic" suppressHydrationWarning>
              © {new Date().getFullYear()} KODA TECH • SISTEMAS DE ALTO RENDIMIENTO
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12">
            <FooterLink label="Dashboard" href="/dashboard" />
            <FooterLink label="Privacidad" href="/privacidad" />
            <FooterLink label="Soporte" href="/soporte" />
            <a href="https://kodatec.app/" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-accent transition-colors">Koda Startup</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES PARA LIMPIEZA
function InstallStep({ num, icon, title, desc }: { num: string, icon: any, title: string, desc: string }) {
    return (
        <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left group cursor-default">
            <div className="flex items-center gap-6">
                <span className="text-5xl font-black text-zinc-50 group-hover:text-accent/10 transition-colors leading-none tracking-tighter">{num}</span>
                <div className="p-5 bg-zinc-50 rounded-3xl text-black group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                    {icon}
                </div>
            </div>
            <div className="space-y-3">
                <h4 className="font-black uppercase text-xl tracking-tighter text-black">{title}</h4>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function FooterLink({ label, href }: { label: string, href: string }) {
    return (
        <Link href={href} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-accent transition-all hover:translate-y-0.5">
            {label}
        </Link>
    )
}