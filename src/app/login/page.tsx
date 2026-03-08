"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("") // Nuevo estado para el nombre
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      if (error) alert(error.message)
      else alert("¡Revisa tu email para confirmar tu cuenta!")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else router.push("/")
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tighter text-black">KODA MAKER</h1>
          <p className="text-gray-500 text-sm">Gestiona tu taller de forma profesional.</p>
        </div>

        <div className="space-y-4">
          {isRegistering && (
            <input 
              type="text" placeholder="Nombre completo" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#f13d4b] outline-none transition-all"
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input 
            type="email" placeholder="Email" 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#f13d4b] outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Contraseña" 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#f13d4b] outline-none transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button 
            onClick={handleAuth} disabled={loading}
            className="w-full p-4 bg-black text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? "Procesando..." : isRegistering ? "Crear cuenta" : "Entrar"}
          </button>
        </div>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-center text-sm text-gray-500 hover:text-[#f13d4b] transition-colors"
        >
          {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate gratis"}
        </button>
      </div>
    </div>
  )
}