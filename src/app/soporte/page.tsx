import Link from "next/link";
import { ArrowLeft, MessageSquare, Mail, Globe, LifeBuoy, Zap, ChevronRight } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans pb-20">
      {/* Header */}
      <nav className="p-6 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
          </Link>
          <span className="font-black tracking-tighter text-xl uppercase">KODA<span className="text-accent">HELP</span></span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-16 space-y-16">
        <header className="space-y-4 text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">Estamos para <br/> <span className="text-accent italic">ayudarte.</span></h1>
          <p className="text-zinc-500 font-medium max-w-xl text-lg">
            ¿Tenés problemas con la App o necesitás una función nueva? El equipo de Koda Tech está listo para asistirte.
          </p>
        </header>

        {/* BENTO GRID DE SOPORTE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* WhatsApp */}
            <a 
                href="https://wa.me/5491100000000" // REEMPLAZA CON TU NÚMERO
                target="_blank"
                className="md:col-span-2 bg-zinc-950 rounded-[45px] p-10 text-white flex flex-col justify-between hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden group"
            >
                <MessageSquare size={40} className="text-accent relative z-10" />
                <div className="relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Soporte por WhatsApp</h3>
                    <p className="text-zinc-400 font-medium mt-2">Chatea con un técnico de KODA en tiempo real.</p>
                </div>
                <ChevronRight className="absolute right-10 bottom-10 text-zinc-700 group-hover:text-white transition-colors" size={32} />
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-accent rounded-full blur-[100px] opacity-20" />
            </a>

            {/* Email */}
            <div className="bg-white border-2 border-zinc-100 rounded-[45px] p-10 flex flex-col justify-between shadow-sm group hover:border-black transition-all">
                <Mail size={40} className="text-black" />
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Email</h3>
                    <p className="text-zinc-400 text-sm font-medium mt-2">soporte@kodatec.app</p>
                </div>
            </div>

            {/* Koda Startup Link */}
            <a 
                href="https://kodatec.app/" 
                target="_blank"
                className="md:col-span-3 bg-zinc-50 rounded-[45px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-white border border-transparent hover:border-zinc-100 transition-all"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg">
                        <Globe size={28} className="text-accent" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Koda Tech Ecosystem</h3>
                        <p className="text-zinc-500 font-medium">Conocé más soluciones tecnológicas para tu crecimiento.</p>
                    </div>
                </div>
                <span className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest group-hover:bg-accent transition-all">Visitar Sitio</span>
            </a>
        </div>

        {/* Sección FAQ Mini */}
        <section className="space-y-8">
            <h3 className="text-center font-black uppercase text-sm tracking-[0.3em] text-zinc-400 italic">Preguntas Frecuentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FAQItem title="¿Cómo instalo la App?" desc="En tu celular, abre la web en Chrome o Safari y selecciona 'Agregar a pantalla de inicio'. Se instalará como una App nativa." />
                <FAQItem title="¿Mis datos están seguros?" desc="Sí. Usamos infraestructura de nivel bancario para asegurar que tu facturación y clientes sean 100% privados." />
            </div>
        </section>
      </main>
    </div>
  );
}

function FAQItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-2 p-6 bg-white rounded-3xl border border-zinc-50">
            <h4 className="font-black uppercase text-sm tracking-tight text-black">{title}</h4>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed">{desc}</p>
        </div>
    )
}