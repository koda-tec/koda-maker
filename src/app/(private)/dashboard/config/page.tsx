import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Building2, Camera, LogOut, ShieldCheck, Globe, Mail } from "lucide-react"
import { updateSettings, signOut } from "./actions"
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
    <div className="max-w-3xl mx-auto space-y-12 pb-32 pt-8 px-4">
      <header>
        <h1 className="text-[10px] font-black uppercase text-[#f13d4b] tracking-[0.4em] mb-1">Ajustes</h1>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Configuración</h2>
      </header>

      <div className="grid grid-cols-1 gap-8">
        
        {/* SECCIÓN: IDENTIDAD DEL NEGOCIO */}
        <section className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-1.5 h-6 bg-[#f13d4b] rounded-full" />
                <h3 className="font-black uppercase text-xs tracking-widest text-gray-800">Identidad Visual</h3>
            </div>

            <form action={updateSettings} encType="multipart/form-data" className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    {/* PREVISUALIZACIÓN LOGO */}
                    <div className="relative group">
                        <div className="w-32 h-32 bg-gray-50 rounded-[40px] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                            {user.logoUrl ? (
                                <img src={user.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                            ) : (
                                <Building2 size={40} className="text-gray-200" />
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-3 bg-black text-white rounded-2xl cursor-pointer shadow-lg hover:bg-[#f13d4b] transition-all">
                            <Camera size={16} />
                            <input name="logo" type="file" accept="image/*" className="hidden" />
                        </label>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nombre del Emprendimiento</label>
                            <input 
                                name="name" 
                                defaultValue={user.name || ""} 
                                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#f13d4b] font-bold text-lg"
                                placeholder="Ej: SyG Creaciones"
                            />
                        </div>
                        <div className="space-y-1 opacity-50">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Email de acceso (No editable)</label>
                            <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-2xl text-sm font-medium text-gray-500">
                                <Mail size={14} /> {user.email}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <SubmitButton label="Guardar Cambios" />
                </div>
            </form>
        </section>

        {/* SECCIÓN: SEGURIDAD Y CUENTA */}
        <section className="bg-zinc-50 p-10 rounded-[50px] border border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-zinc-400 shadow-sm">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter text-zinc-800">Sesión de Usuario</h4>
                    <p className="text-sm text-zinc-400 font-medium">Gestioná tu acceso de forma segura.</p>
                </div>
            </div>

            <form action={async () => {
                "use server"
                await signOut()
                redirect("/")
            }}>
                <button className="flex items-center gap-2 px-8 py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm">
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </form>
        </section>

        <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">
            Koda Maker System • v1.0.0
        </p>
      </div>
    </div>
  )
}