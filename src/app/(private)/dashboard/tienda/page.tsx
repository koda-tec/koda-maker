import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase-server"
import { Store, Globe, Truck, MapPin, Save, ExternalLink } from "lucide-react"
import { updateStoreSettings } from "./actions"
import { SubmitButton } from "@/components/SubmitButton"

export default async function TiendaConfigPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const user = await prisma.user.findUnique({
    where: { id: authUser?.id }
  })

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 pt-8 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 italic">Ventas Online</h1>
          <h2 className="text-5xl font-black text-black tracking-tighter uppercase">Mi Tienda</h2>
        </div>
        {user.isStoreActive && (
          <a 
            href={`/v/${user.slug}`} 
            target="_blank"
            className="flex items-center gap-2 text-[10px] font-black uppercase text-accent hover:underline"
          >
            Ver mi tienda pública <ExternalLink size={14} />
          </a>
        )}
      </header>

      <form action={updateStoreSettings} className="grid grid-cols-1 gap-8">
        
        {/* LINK Y ACTIVACIÓN */}
        <section className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-zinc-100 space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-accent rounded-full" />
                <h3 className="font-black uppercase text-sm text-zinc-800">Dirección y Estado</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Slug Único (URL)</label>
                    <div className="flex items-center bg-zinc-50 rounded-[25px] px-5 border border-zinc-100 focus-within:ring-2 focus-within:ring-accent">
                        <span className="text-zinc-400 text-sm font-bold">koda.app/v/</span>
                        <input 
                            name="slug" 
                            defaultValue={user.slug || ""} 
                            className="flex-1 p-4 bg-transparent border-none outline-none font-black text-black"
                            placeholder="syg-creaciones"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Estado de la Tienda</label>
                    <select name="isStoreActive" defaultValue={user.isStoreActive ? "true" : "false"} className="w-full p-5 bg-zinc-50 rounded-[25px] font-black border-none outline-none">
                        <option value="true">🟢 TIENDA ACTIVA</option>
                        <option value="false">🔴 TIENDA PAUSADA</option>
                    </select>
                </div>
            </div>
        </section>

        {/* LOGÍSTICA Y ENVÍOS */}
        <section className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-zinc-100 space-y-10">
            <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-accent rounded-full" />
                <h3 className="font-black uppercase text-sm text-zinc-800">Logística de Entrega</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pickup */}
                <div className="p-6 bg-zinc-50 rounded-[35px] space-y-4">
                    <div className="flex justify-between items-center">
                        <MapPin size={24} className="text-accent" />
                        <input type="checkbox" name="allowPickup" defaultChecked={user.allowPickup} className="w-6 h-6 accent-accent" />
                    </div>
                    <h4 className="font-black uppercase text-xs">Retiro en Taller</h4>
                    <p className="text-[10px] text-zinc-500 font-bold leading-tight">El cliente retira por tu ubicación.</p>
                </div>

                {/* Local */}
                <div className="p-6 bg-zinc-50 rounded-[35px] space-y-4">
                    <Truck size={24} className="text-accent" />
                    <h4 className="font-black uppercase text-xs">Envío Local ($)</h4>
                    <input 
                        name="localShippingCost" 
                        type="number" 
                        defaultValue={user.localShippingCost}
                        className="w-full p-3 bg-white rounded-xl font-black text-sm border-none"
                        placeholder="Precio fijo"
                    />
                </div>

                {/* Nationwide */}
                <div className="p-6 bg-zinc-50 rounded-[35px] space-y-4">
                    <div className="flex justify-between items-center">
                        <Globe size={24} className="text-accent" />
                        <input type="checkbox" name="allowNationwide" defaultChecked={user.allowNationwide} className="w-6 h-6 accent-accent" />
                    </div>
                    <h4 className="font-black uppercase text-xs">Todo el país</h4>
                    <p className="text-[10px] text-zinc-500 font-bold leading-tight">Costo a convenir post-venta.</p>
                </div>
            </div>

            <SubmitButton label="Guardar Configuración de Tienda" />
        </section>
      </form>
    </div>
  )
}