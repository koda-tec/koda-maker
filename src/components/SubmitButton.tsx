"use client"
import { useFormStatus } from "react-dom"
import { Loader2, Send } from "lucide-react"

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full p-5 text-white rounded-24px font-black uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
        pending ? 'bg-zinc-400 cursor-not-allowed' : 'bg-black hover:bg-accent active:scale-95'
      }`}
    >
      {pending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
      {pending ? "PROCESANDO..." : label}
    </button>
  )
}