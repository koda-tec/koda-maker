"use client"
import { useState, useEffect } from "react"
import { BellRing, Check, Info } from "lucide-react"
import { subscribeUser } from "@/app/(private)/dashboard/actions-notifications"
import { toast } from "sonner"

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function EnableNotifications() {
    const [status, setStatus] = useState<"default" | "granted" | "denied" | "loading">("loading");
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        // Detectar si la App está instalada (Standalone)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsPWA(isStandalone);
        
        if ("Notification" in window) {
            setStatus(Notification.permission as any);
        }
    }, []);

    const handleEnable = async () => {
        if (!("serviceWorker" in navigator)) return;

        try {
            const permission = await Notification.requestPermission();
            setStatus(permission as any);

            if (permission === "granted") {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                });

                await subscribeUser(JSON.parse(JSON.stringify(subscription)));
                toast.success("¡Notificaciones activadas!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al activar notificaciones");
        }
    };

    // Si ya concedió permiso, no mostramos nada
    if (status === "granted" || status === "loading") return null;

    return (
        <section className="px-4 mb-6">
            <div className="bg-white border-2 border-accent/20 rounded-[35px] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-accent">
                        <BellRing size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black uppercase text-xs tracking-tight text-black">Activar Alertas Push</h4>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase leading-tight">Recibí avisos de stock y entregas en tu celular.</p>
                    </div>
                </div>

                {!isPWA && (
                    <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl text-zinc-400">
                        <Info size={14} />
                        <p className="text-[9px] font-bold uppercase tracking-widest leading-none">
                            En iPhone, primero debés instalar la App.
                        </p>
                    </div>
                )}

                <button 
                    onClick={handleEnable}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                    {status === "denied" ? "Permiso bloqueado (Ir a ajustes)" : "Habilitar ahora"}
                </button>
            </div>
        </section>
    );
}