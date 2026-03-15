"use client"
import { useState } from "react"
import { CheckCircle2, Zap, Crown, ArrowRight, Loader2, ShieldCheck, Gem, Sparkles } from "lucide-react"
import Link from "next/link"

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
        <div className="min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-accent selection:text-white pb-20">
            
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-zinc-50 to-transparent -z-10" />

            {/* HEADER */}
            <header className="max-w-7xl mx-auto px-6 pt-12 flex justify-between items-center">
                <img src="/logo-full.png" alt="Koda Maker" className="h-8 md:h-10 object-contain" />
                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                    Cerrar Sesión
                </Link>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-20 md:pt-32 flex flex-col items-center">
                
                {/* TEXTO PRINCIPAL */}
                <div className="text-center space-y-6 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-2 animate-bounce">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent">Desbloqueá el poder de tu taller</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-black">
                        Elegí tu <br /> <span className="text-accent italic">estrategia.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium text-lg md:text-xl max-w-xl mx-auto">
                        Tu tiempo de prueba terminó. Unite a los makers que ya están optimizando su rentabilidad con Koda.
                    </p>
                </div>

                {/* CONTENEDOR DE PLANES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-20 relative">
                    
                    {/* PLAN MENSUAL */}
                    <div className="bg-white border-2 border-zinc-100 rounded-[50px] p-10 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative group">
                        <div className="space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Plan Standard</span>
                                    <h3 className="text-2xl font-black uppercase">Mensual</h3>
                                </div>
                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:text-black transition-colors shadow-inner">
                                    <Zap size={24} />
                                </div>
                            </div>
                            
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black tracking-tighter">$20.000</span>
                                <span className="text-zinc-400 font-bold text-xs uppercase">/mes</span>
                            </div>

                            <ul className="space-y-4 pt-4">
                                <FeatureItem text="Pedidos ilimitados" />
                                <FeatureItem text="Cálculo de costos en vivo" />
                                <FeatureItem text="Gestión de stock con alertas" />
                                <FeatureItem text="Soporte estándar" />
                            </ul>
                        </div>

                        <button 
                            onClick={() => handlePayment('MONTHLY', 20000)}
                            disabled={!!loading}
                            className="w-full mt-12 p-6 bg-zinc-100 text-black rounded-[30px] font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading === 'MONTHLY' ? <Loader2 className="animate-spin" size={18} /> : "Comenzar suscripción"}
                        </button>
                    </div>

                    {/* PLAN ANUAL (DESTACADO) */}
                    <div className="bg-zinc-950 rounded-[50px] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl scale-105 border-4 border-accent group">
                        
                        {/* BADGE DE AHORRO */}
                        <div className="absolute top-10 right-10 bg-accent text-white px-14 py-1.5 rotate-45 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg z-20">
                            Ahorrás $40.000
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Plan Recomendado</span>
                                    <h3 className="text-2xl font-black uppercase text-white italic">Anual Pro</h3>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-accent shadow-inner">
                                    <Crown size={24} />
                                </div>
                            </div>
                            
                            <div className="flex items-baseline gap-1">
                                <span className="text-6xl font-black tracking-tighter">$200.000</span>
                                <span className="text-zinc-500 font-bold text-xs uppercase">/año</span>
                            </div>

                            <ul className="space-y-4 pt-4">
                                <FeatureItem text="Todo lo del plan mensual" dark />
                                <FeatureItem text="2 meses de regalo" dark />
                                <FeatureItem text="Tickets PNG sin marca de agua" dark />
                                <FeatureItem text="Soporte Prioritario KODA" dark />
                            </ul>
                        </div>

                        <button 
                            onClick={() => handlePayment('YEARLY', 200000)}
                            disabled={!!loading}
                            className="w-full mt-12 p-7 bg-accent text-white rounded-[30px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-900/40 hover:bg-white hover:text-accent transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading === 'YEARLY' ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Activar Plan Anual <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        {/* DECORACIÓN DE FONDO */}
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
                    </div>
                </div>

                {/* SEGURIDAD */}
                <div className="mt-20 flex flex-col md:flex-row items-center gap-8 text-zinc-400">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pago Seguro vía Mercado Pago</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Gem size={16} className="text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Garantía de Satisfacción KODA</span>
                    </div>
                </div>
            </main>

            <footer className="mt-32 text-center">
                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">
                    Koda Maker • Infrastructure for the future of making
                </p>
            </footer>
        </div>
    )
}

function FeatureItem({ text, dark = false }: { text: string, dark?: boolean }) {
    return (
        <li className="flex items-center gap-3">
            <CheckCircle2 size={18} className={dark ? "text-accent" : "text-green-500"} strokeWidth={3} />
            <span className={`text-sm font-bold tracking-tight ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
                {text}
            </span>
        </li>
    )
}