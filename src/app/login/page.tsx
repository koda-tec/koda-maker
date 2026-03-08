"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: "Usuario SyG" }, // Esto lo toma el trigger de SQL
      },
    })
    if (error) alert(error.message)
    else alert("¡Revisa tu email para confirmar la cuenta!")
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push("/") // Al entrar lo mandamos al inicio
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">KODA Maker</h1>
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Contraseña" 
          className="w-full p-3 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          onClick={handleLogin} disabled={loading}
          className="w-full p-3 bg-black text-white rounded font-bold"
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
        <button 
          onClick={handleSignUp}
          className="w-full p-3 text-gray-600 text-sm"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  )
}