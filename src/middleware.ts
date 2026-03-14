import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = new URL(request.url)
  
  // Rutas clave
  const isDashboard = url.pathname.startsWith('/dashboard')
  const isPaymentPage = url.pathname === '/dashboard/pago-requerido'
  const isAuthPage = url.pathname.startsWith('/login')

  // 1. Si no está logueado y va al dashboard -> Al Login
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login?mode=login', request.url))
  }

  // 2. Si está logueado, chequeamos el plan
  if (user && isDashboard && !isPaymentPage) {
    // Consultamos el plan. IMPORTANTE: El nombre de la tabla debe coincidir con Supabase
    const { data: dbUser } = await supabase
      .from('User')
      .select('plan')
      .eq('id', user.id)
      .single()

    // Si el plan es EXPIRED, bloqueamos el acceso
    if (dbUser?.plan === 'EXPIRED') {
      return NextResponse.redirect(new URL('/dashboard/pago-requerido', request.url))
    }
  }

  // 3. Si está logueado y va al login -> Al Dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  // Corregido: Ahora escucha /dashboard, /dashboard/algo, y /login
  matcher: [
    '/dashboard', 
    '/dashboard/:path*', 
    '/login'
  ],
}