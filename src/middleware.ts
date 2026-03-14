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

  // IMPORTANTE: getUser() es una llamada al servidor de Supabase.
  // Valida el token real. Si el token es viejo o no existe, devuelve null.
  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const isAuthPage = url.pathname.startsWith('/login')
  const isDashboard = url.pathname.startsWith('/dashboard')

  // CASO 1: No hay usuario y quiere entrar a zonas privadas -> Al Login
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login?mode=login', request.url))
  }

  // CASO 2: Hay usuario y quiere ir al Login -> Lo mandamos al Dashboard 
  // (Si el usuario quiere entrar con OTRA cuenta, debe cerrar sesión primero)
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  // Vigilamos Dashboard y Login. 
  // Excluimos /pago-requerido para que no haya bucles de redirección.
  matcher: ['/dashboard/:path*', '/login'],
}