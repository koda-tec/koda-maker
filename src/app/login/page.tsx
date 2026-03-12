"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from 'react'
import { toast } from "sonner"

function LoginContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  
  const [isRegistering, setIsRegistering] = useState(mode === 'register')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("") // Antes "name"
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  useEffect(() => {
  // Si el usuario llega al login, nos aseguramos de que Supabase limpie 
  // cualquier resto de sesión vieja en el navegador.
  const clearGhostSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await supabase.auth.signOut();
      window.location.reload(); // Recarga una vez para limpiar el estado de React
    }
  }
  
  // Solo lo hacemos si el usuario no viene redirigido por el middleware exitosamente
  if (mode === 'login') {
    clearGhostSession();
  }
}, [mode]);
  const router = useRouter()

  useEffect(() => {
    setIsRegistering(mode === 'register')
  }, [mode])

const handleAuth = async () => {
  if (!email || !password || (isRegistering && !businessName)) {
    toast.error("Faltan datos", { description: "Por favor completa todos los campos." })
    return
  }

  setLoading(true)
  if (isRegistering) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: businessName } }
    })
    if (error) {
      toast.error("Error al registrar", { description: error.message })
    } else {
      toast.success("¡Registro exitoso!", { 
        description: "Revisa tu email para confirmar tu cuenta y empezar a usar KODA Maker.",
        duration: 6000 
      })
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error("Error de acceso", { description: "Email o contraseña incorrectos." })
    } else {
      toast.success("¡Bienvenido de nuevo!")
      router.push("/dashboard")
    }
  }
  setLoading(false)
}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            {/* Usamos tu logo full */}
            <img src="/logo-full.png" alt="Koda Maker" className="h-16 md:h-20 object-contain mx-auto" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            {isRegistering ? "Crear Cuenta" : "Bienvenido"}
          </h1>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">Professional Maker Suite</p>
        </div>
        </div>

        <div className="space-y-3">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase ml-2 text-gray-400">Nombre de tu Emprendimiento</label>
              <input 
                type="text" placeholder="Ej: SyG Creaciones" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all font-medium"
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-2 text-gray-400">Email Profesional</label>
            <input 
              type="email" placeholder="email@ejemplo.com" 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all font-medium"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-2 text-gray-400">Contraseña</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all font-medium"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleAuth} disabled={loading}
            className="w-full p-5 bg-black text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "CONECTANDO..." : isRegistering ? "REGISTRARME" : "INGRESAR"}
          </button>
        </div>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-center text-xs font-bold text-gray-400 hover:text-black transition-colors"
        >
          {isRegistering ? "¿YA TIENES CUENTA? INICIA SESIÓN" : "¿ERES NUEVO? CREA UNA CUENTA GRATIS"}
        </button>
      </div>
    </div>
  )
}

// Next.js requiere Suspense para usar useSearchParams en componentes cliente
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}