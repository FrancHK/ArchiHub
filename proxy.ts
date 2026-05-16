import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/engineer', '/admin', '/profile']
const AUTH_PATHS = ['/login', '/register', '/forgot-password']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const isProtected = PROTECTED_PATHS.some(p => path.startsWith(p))
  const isAuthPath = AUTH_PATHS.some(p => path.startsWith(p))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPath && user) {
    const { data: profile } = await supabase
      .from('archi_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        engineer: '/engineer',
        customer: '/dashboard',
      }
      return NextResponse.redirect(new URL(redirectMap[profile.role] || '/dashboard', request.url))
    }
  }

  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('archi_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (path.startsWith('/engineer')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('archi_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'engineer' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
