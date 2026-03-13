import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  // 1. Obtenemos el usuario de la sesión (Seguridad de Auth)
  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const isAuthPage = url.pathname.startsWith('/login')
  const isDashboard = url.pathname.startsWith('/dashboard')
  const isPaymentPage = url.pathname === '/dashboard/pago-requerido'

  // Redirección: Si no está logueado y quiere entrar al dashboard
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login?mode=login', request.url))
  }

  // Lógica de Paywall: Si está logueado y en el dashboard
  if (user && isDashboard && !isPaymentPage) {
    // Consultamos el plan directamente a la tabla 'User' usando el cliente de Supabase
    // Nota: Usamos el cliente de Supabase porque Prisma no funciona en el Middleware
    const { data: dbUser } = await supabase
      .from('User')
      .select('plan')
      .eq('id', user.id)
      .single()

    // Si el plan es EXPIRED, lo mandamos a pagar
    if (dbUser?.plan === 'EXPIRED') {
      return NextResponse.redirect(new URL('/dashboard/pago-requerido', request.url))
    }
  }

  // Redirección: Si ya está logueado y quiere ir al login
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  // Protegemos el dashboard y el login
  matcher: ['/dashboard/:path*', '/login'],
}