"use client" // La convertimos a Client Component para manejar los clics
import { CheckCircle2, Zap, Crown, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"

export default function PagoRequeridoPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handlePayment = async (planType: 'MONTHLY' | 'YEARLY', amount: number) => {
        setLoading(planType);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType, amount })
            });
            const data = await res.json();
            if (data.init_point) {
                window.location.href = data.init_point;
            }
        } catch (error) {
            console.error("Error al ir al checkout", error);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-4 space-y-12">
            <div className="text-center space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">Tu acceso ha expirado</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-black">
                    Elegí tu <span className="text-accent italic">plan.</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pb-20">
                {/* PLAN MENSUAL */}
                <div className="bg-white border-2 border-zinc-100 rounded-[50px] p-10 flex flex-col justify-between shadow-sm">
                    <div className="space-y-6">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Koda Pro Mensual</span>
                        <h3 className="text-5xl font-black text-black tracking-tighter">$20.000</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-tight"><CheckCircle2 size={16} className="text-green-500" /> Todo Ilimitado</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => handlePayment('MONTHLY', 20000)}
                        disabled={!!loading}
                        className="w-full mt-10 p-6 bg-zinc-100 text-black rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        {loading === 'MONTHLY' ? <Loader2 className="animate-spin" /> : "Suscribirme"}
                    </button>
                </div>

                {/* PLAN ANUAL */}
                <div className="bg-zinc-950 rounded-[50px] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl border-4 border-accent">
                    <div className="absolute top-8 right-8.75 bg-accent text-white px-12 py-1 rotate-45 font-black text-[10px] uppercase tracking-widest">Ahorrá $40.000</div>
                    <div className="space-y-6 relative z-10">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Koda Pro Anual</span>
                        <h3 className="text-5xl font-black text-white tracking-tighter">$200.000</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-tight"><CheckCircle2 size={16} className="text-accent" /> 2 Meses de regalo</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => handlePayment('YEARLY', 200000)}
                        disabled={!!loading}
                        className="w-full mt-10 p-6 bg-accent text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95"
                    >
                        {loading === 'YEARLY' ? <Loader2 className="animate-spin" /> : "Activar Plan Anual"}
                    </button>
                </div>
            </div>
        </div>
    )
}