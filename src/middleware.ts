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
  const isAuthPage = url.pathname.startsWith('/login')
  const isDashboard = url.pathname.startsWith('/dashboard')
  const isPaymentPage = url.pathname === '/dashboard/pago-requerido'

  // 1. Redirección si no hay sesión
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login?mode=login', request.url))
  }

  // 2. Lógica de Paywall (Muro de Pago)
  if (user && isDashboard && !isPaymentPage) {
    // IMPORTANTE: Prisma genera la tabla como "User" (Mayúscula y comillas en Postgres)
    const { data: dbUser, error } = await supabase
      .from('User') 
      .select('plan')
      .eq('id', user.id)
      .single()

    // Debug para ver en tu consola qué está pasando
    console.log(`LOG: Usuario ${user.email} tiene plan: ${dbUser?.plan}`)

    if (dbUser?.plan === 'EXPIRED') {
      console.log("REDIRECCIÓN: Enviando a pago requerido...")
      return NextResponse.redirect(new URL('/dashboard/pago-requerido', request.url))
    }
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}