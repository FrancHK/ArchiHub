import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/engineer', '/admin', '/profile']
const AUTH_PATHS = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  // Single auth call — role from metadata, no extra DB query
  const { data: { user } } = await supabase.auth.getUser()
  const role = (user?.user_metadata?.role as string) || null
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
    const redirectMap: Record<string, string> = {
      admin: '/admin',
      engineer: '/engineer',
      customer: '/dashboard',
    }
    return NextResponse.redirect(new URL(redirectMap[role || 'customer'] || '/dashboard', request.url))
  }

  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url))
  }

  if (path.startsWith('/engineer') && role !== 'engineer' && role !== 'admin') {
    return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
