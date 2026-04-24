import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminUser } from '@/lib/admin'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLoginRoute = pathname === '/admin/login'
  const isUserLoginRoute = pathname.startsWith('/login')
  const isDashboardRoute = pathname.startsWith('/dashboard')

  if (isAdminRoute) {
    if (!user) {
      if (isAdminLoginRoute) return response
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (!isAdminUser(user)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (isAdminLoginRoute) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return response
  }

  if (user && isAdminUser(user) && isDashboardRoute) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (user && isUserLoginRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/?login=true', request.url))
  }

  return response
}
