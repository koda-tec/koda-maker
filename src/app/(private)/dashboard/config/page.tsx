import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Building2, Camera, LogOut, ShieldCheck, Mail, Lock, KeyRound, Check } from "lucide-react"
import { updateSettings, signOut, updatePassword } from "./actions"
import { SubmitButton } from "@/components/SubmitButton"
import { redirect } from "next/navigation"

export default async function ConfigPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const user = await prisma.user.findUnique({
    where: { id: authUser?.id }
  })

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 pt-8 px-4">
      <header>
        <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic text-center md:text-left">Koda Settings</h1>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase text-center md:text-left">Configuración</h2>
      </header>

      <div className="grid grid-cols-1 gap-10">
        
        {/* SECCIÓN 1: IDENTIDAD VISUAL - IMPORTANTE: encType="multipart/form-data" */}
        <section className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-2 h-6 bg-accent rounded-full" />
                <h3 className="font-black uppercase text-sm tracking-widest text-zinc-800 italic">Identidad Visual</h3>
            </div>

            <form action={updateSettings} encType="multipart/form-data" className="space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* PREVISUALIZACIÓN Y CARGA DE LOGO */}
                    <div className="relative group">
                        <div className="w-40 h-40 bg-zinc-50 rounded-[50px] border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center relative">
                            {user.logoUrl ? (
                                <img src={user.logoUrl} className="w-full h-full object-contain p-4" alt="Logo Negocio" />
                            ) : (
                                <Building2 size={48} className="text-zinc-200" />
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-4 bg-black text-white rounded-3xl cursor-pointer shadow-2xl hover:bg-accent transition-all active:scale-90 z-10">
                            <Camera size={20} strokeWidth={2.5} />
                            <input name="logo" type="file" accept="image/*" className="hidden" />
                        </label>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Nombre del Emprendimiento</label>
                            <input 
                                name="name" 
                                defaultValue={user.name || ""} 
                                className="w-full p-5 bg-zinc-50 border-none rounded-[25px] outline-none focus:ring-2 focus:ring-accent font-black text-xl tracking-tighter"
                                placeholder="Ej: SyG Creaciones"
                            />
                        </div>
                        <div className="space-y-2 opacity-60">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Email de Acceso</label>
                            <div className="flex items-center gap-3 p-5 bg-zinc-100 rounded-[25px] text-sm font-bold text-zinc-500">
                                <Mail size={16} /> {user.email}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">WhatsApp de Ventas (Con código de país)</label>
                            <input 
                                name="phone" 
                                defaultValue={user.phone || ""} 
                                className="w-full p-5 bg-zinc-50 border-none rounded-[25px] outline-none focus:ring-2 focus:ring-accent font-black text-xl tracking-tighter"
                                placeholder="5491122334455"
                            />
                        </div>

                    </div>
                </div>

                <div className="pt-4">
                    <SubmitButton label="Actualizar Identidad" />
                </div>
            </form>
        </section>

        {/* SECCIÓN 2: SEGURIDAD (CAMBIO DE CONTRASEÑA) */}
        <section className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-2 h-6 bg-zinc-800 rounded-full" />
                <h3 className="font-black uppercase text-sm tracking-widest text-zinc-800 italic">Seguridad</h3>
            </div>

            <form action={updatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Nueva Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        <input name="password" type="password" placeholder="••••••••" className="w-full p-5 pl-14 bg-zinc-50 border-none rounded-[25px] outline-none focus:ring-2 focus:ring-black font-bold" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Confirmar Contraseña</label>
                    <div className="relative">
                        <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        <input name="confirm" type="password" placeholder="••••••••" className="w-full p-5 pl-14 bg-zinc-50 border-none rounded-[25px] outline-none focus:ring-2 focus:ring-black font-bold" required />
                    </div>
                </div>
                <div className="md:col-span-2 pt-4">
                    <SubmitButton label="Cambiar Contraseña" />
                </div>
            </form>
        </section>

        {/* SECCIÓN 3: CIERRE DE SESIÓN */}
        <section className="bg-zinc-950 p-10 rounded-[50px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-zinc-400 backdrop-blur-md border border-white/10">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter text-white">Privacidad</h4>
                    <p className="text-sm text-zinc-500 font-medium">Cerrá tu sesión en este dispositivo.</p>
                </div>
            </div>

            <form action={async () => {
                "use server"
                await signOut()
                redirect("/")
            }} className="relative z-10 w-full md:w-auto">
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-5 bg-white text-black rounded-[25px] font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-xl">
                    <LogOut size={16} /> Salir del Sistema
                </button>
            </form>
            
            {/* Decoración */}
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
        </section>

        <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em] pt-10">
            Koda Maker System • Professional Suite
        </p>
      </div>
    </div>
  )
}