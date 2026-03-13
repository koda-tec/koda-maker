import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Creamos una respuesta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inicializamos el cliente de Supabase optimizado para Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Obtenemos el usuario de la sesión de forma segura
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Definimos las rutas para la lógica de redirección
  const url = new URL(request.url)
  const isAuthPage = url.pathname.startsWith('/login')
  const isDashboard = url.pathname.startsWith('/dashboard')
  const isPaymentPage = url.pathname === '/dashboard/pago-requerido'

  // --- LÓGICA DE PROTECCIÓN ---

  // CASO A: No está logueado e intenta entrar al dashboard -> Al Login
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login?mode=login', request.url))
  }

  // CASO B: Está logueado y entra al Dashboard (pero no a la página de pago)
  if (user && isDashboard && !isPaymentPage) {
    // Consultamos el plan en la tabla "User" de la base de datos
    const { data: dbUser } = await supabase
      .from('User') // Prisma usa "User" con U mayúscula
      .select('plan')
      .eq('id', user.id)
      .single()

    // Si el plan está marcado como EXPIRED, lo desviamos al Paywall
    if (dbUser?.plan === 'EXPIRED') {
      return NextResponse.redirect(new URL('/dashboard/pago-requerido', request.url))
    }
  }

  // CASO C: Está logueado e intenta ir al Login -> Al Dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// CONFIGURACIÓN DEL MATCHER: Qué rutas debe vigilar el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de dashboard y login.
     * Excluye archivos estáticos (iconos, imágenes, etc.)
     */
    '/dashboard/:path*',
    '/login'
  ],
}