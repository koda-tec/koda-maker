import { getSubscriptionLink } from "../config/actions-mp"
import { Check, Zap, Crown, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function PagoRequeridoPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 px-4 py-10">
      
      {/* HEADER DE LA PÁGINA */}
      <div className="text-center space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">Tu prueba gratuita ha finalizado</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-black">
            Llevá tu taller <br /> <span className="text-accent italic">al próximo nivel.</span>
        </h1>
        <p className="text-zinc-500 font-medium text-lg">
            Elegí el plan que mejor se adapte a tu producción y continuá gestionando con <b>Koda Maker</b>.
        </p>
      </div>

      {/* TARJETAS DE PRECIOS (BENTO STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* PLAN MENSUAL */}
        <div className="bg-white border-2 border-zinc-100 rounded-[50px] p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Plan Mensual</span>
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-300 group-hover:text-black transition-colors">
                    <Zap size={20} />
                </div>
            </div>
            <div>
                <h3 className="text-5xl font-black tracking-tighter text-black">$20.000</h3>
                <p className="text-zinc-400 font-bold text-xs uppercase mt-1">al mes</p>
            </div>
            <ul className="space-y-4 pt-6">
                <PricingItem text="Pedidos e Imágenes ilimitados" />
                <PricingItem text="Cálculo de costos en vivo" />
                <PricingItem text="Notificaciones Push al celular" />
            </ul>
          </div>

          <form action={async () => {
            "use server"
            const url = await getSubscriptionLink('MONTHLY')
            if (url) {
                const { redirect } = await import("next/navigation")
                redirect(url)
            }
          }}>
            <button className="w-full mt-10 p-6 bg-zinc-100 text-black rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all shadow-md active:scale-95">
                Suscribirme ahora
            </button>
          </form>
        </div>

        {/* PLAN ANUAL (EL RECOMENDADO) */}
        <div className="bg-zinc-950 rounded-[50px] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl scale-105 border-4 border-accent">
          {/* Badge de Ahorro */}
          <div className="absolute top-8 right-8.75 bg-accent text-white px-12 py-1 rotate-45 font-black text-[10px] uppercase tracking-widest">
            Ahorrá $40.000
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Plan Profesional</span>
                <Crown className="text-accent" size={24} />
            </div>
            <div>
                <h3 className="text-5xl font-black tracking-tighter text-white">$200.000</h3>
                <p className="text-zinc-500 font-bold text-xs uppercase mt-1">pago único anual</p>
            </div>
            <ul className="space-y-4 pt-6">
                <PricingItem text="Todo lo del plan mensual" dark />
                <PricingItem text="2 meses bonificados" dark />
                <PricingItem text="Soporte prioritario KODA" dark />
                <PricingItem text="Acceso a funciones Beta" dark />
            </ul>
          </div>

          <form action={async () => {
            "use server"
            const url = await getSubscriptionLink('YEARLY')
            if (url) {
                const { redirect } = await import("next/navigation")
                redirect(url)
            }
          }}>
            <button className="w-full mt-10 p-6 bg-accent text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-900/20 hover:bg-white hover:text-accent transition-all active:scale-95 flex items-center justify-center gap-2">
                Activar Plan Anual <ArrowRight size={16} />
            </button>
          </form>

          {/* Decoración de fondo */}
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent rounded-full blur-[80px] opacity-20" />
        </div>
      </div>

      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">
        Koda Maker System • Secure Checkout
      </p>
    </div>
  )
}

function PricingItem({ text, dark = false }: { text: string, dark?: boolean }) {
    return (
        <li className="flex items-center gap-3">
            <CheckCircle2 size={16} className={dark ? "text-accent" : "text-green-500"} />
            <span className={`text-xs font-bold uppercase tracking-tight ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{text}</span>
        </li>
    )
}
import { CheckCircle2 } from "lucide-react"