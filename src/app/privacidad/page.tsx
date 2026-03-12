import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans pb-20">
      {/* Header Simple */}
      <nav className="p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
          </Link>
          <span className="font-black tracking-tighter text-xl uppercase">KODA<span className="text-accent">PRIVACY</span></span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-16 space-y-12">
        <header className="space-y-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-accent">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Política de <br/> Privacidad</h1>
          <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.3em]">Última actualización: Marzo 2025</p>
        </header>

        <section className="space-y-8 text-zinc-600 leading-relaxed font-medium">
          <div className="space-y-4">
            <h2 className="text-black font-black uppercase tracking-tight text-xl flex items-center gap-2">
                <Database size={20} className="text-accent" /> Almacenamiento de Datos
            </h2>
            <p>
              En **KODA Maker**, la privacidad de tu taller es nuestra prioridad. Todos los datos de materiales, clientes y facturación se almacenan de forma segura en servidores cifrados (Powered by Supabase). Tu información es privada y solo tú tienes acceso a ella mediante tus credenciales de autenticación.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-black font-black uppercase tracking-tight text-xl flex items-center gap-2">
                <Lock size={20} className="text-accent" /> Seguridad de Archivos
            </h2>
            <p>
              Las imágenes de diseño y logotipos que subes a la plataforma se almacenan en contenedores aislados. Koda Tech no utiliza, vende ni analiza tus diseños para ningún fin comercial. Tu propiedad intelectual está protegida.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-black font-black uppercase tracking-tight text-xl flex items-center gap-2">
                <EyeOff size={20} className="text-accent" /> Uso de la Información
            </h2>
            <p>
              Utilizamos tu información únicamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar tu cuenta y suscripciones.</li>
                <li>Enviar notificaciones Push sobre el estado de tu stock y pedidos.</li>
                <li>Generar las analíticas de rendimiento de tu propio negocio.</li>
            </ul>
          </div>
        </section>

        <footer className="pt-10 border-t border-gray-100">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Para dudas sobre tus datos, contacta a <a href="mailto:soporte@kodatec.app" className="text-accent underline">soporte@kodatec.app</a>
            </p>
        </footer>
      </main>
    </div>
  );
}