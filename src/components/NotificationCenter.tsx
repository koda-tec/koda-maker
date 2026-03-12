"use client"
import { useState } from "react"
import { Bell, X, Trash2, Check, Package, Clock, CreditCard } from "lucide-react"
import { markAsRead, clearAllNotifications } from "@/app/(private)/dashboard/actions-notifications"
import Portal from "./Portal"
import { toast } from "sonner"

export function NotificationCenter({ notifications }: { notifications: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="relative">
            {/* ICONO DE CAMPANA */}
            <button onClick={() => setIsOpen(true)} className="relative p-3 bg-white rounded-2xl shadow-sm border border-zinc-100 active:scale-90 transition-all">
                <Bell size={20} className={unreadCount > 0 ? "text-accent" : "text-zinc-400"} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <Portal>
                    <div className="fixed inset-0 z-999 flex items-start justify-end p-4 md:p-10">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                        
                        <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-right">
                            <div className="p-6 border-b border-zinc-50 flex justify-between items-center bg-white">
                                <h3 className="font-black uppercase text-xs tracking-widest italic">Notificaciones</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => { clearAllNotifications(); toast.success("Notificaciones borradas") }} className="p-2 text-zinc-300 hover:text-accent"><Trash2 size={16}/></button>
                                    <button onClick={() => setIsOpen(false)} className="p-2 bg-zinc-100 rounded-full"><X size={16}/></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                                {notifications.length > 0 ? notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-5 rounded-[30px] border transition-all flex items-start gap-4 ${n.read ? 'bg-zinc-50 border-zinc-50 opacity-60' : 'bg-white border-zinc-100 shadow-sm'}`}
                                    >
                                        <div className={`p-3 rounded-2xl ${n.read ? 'bg-zinc-100 text-zinc-400' : 'bg-red-50 text-accent'}`}>
                                            {n.type === 'STOCK' ? <Package size={18}/> : n.type === 'DELIVERY' ? <Clock size={18}/> : <CreditCard size={18}/>}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs font-black uppercase leading-tight">{n.title}</p>
                                            <p className="text-[11px] font-medium text-zinc-500 leading-tight">{n.message}</p>
                                            {!n.read && (
                                                <button onClick={() => markAsRead(n.id)} className="text-[9px] font-black text-accent uppercase mt-2 flex items-center gap-1">
                                                    <Check size={10}/> Marcar leída
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 text-zinc-300 text-[10px] font-black uppercase tracking-widest">
                                        No hay avisos nuevos
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    )
}