import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add logic between createServerClient and getUser.
  // This refreshes the session and MUST run before any redirects.
  const { data: { user } } = await supabase.auth.getUser()

  // All routes under the (dashboard) layout group that require authentication.
  // Keep this in sync with the (dashboard) route group folder.
  const protectedRoutes = [
    '/dashboard',
    '/scholarships',
    '/roadmap',
    '/community',
    '/settings',
    '/deadlines',
    '/documents',
    '/profile',
    '/ai-advisor',
    '/onboarding', // also protect onboarding (needs auth to save profile)
  ]

  const { pathname } = request.nextUrl

  // Skip auth redirect for the public auth routes themselves to prevent loops
  const isAuthRoute = pathname.startsWith('/auth/')

  const isProtectedRoute = !isAuthRoute && protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedRoute && !user) {
    // Redirect to login, encoding the original destination so the callback can
    // send the user back after a successful sign-in.
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // If already authenticated and trying to visit auth pages, redirect to dashboard
  if (isAuthRoute && user && !pathname.startsWith('/auth/callback')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Attach the user id to every request header so server components can read it
  // without an extra Supabase round-trip.
  const requestHeaders = new Headers(request.headers)
  if (user) {
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email || '')
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Copy cookies set during session refresh to the outgoing response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      maxAge: cookie.maxAge,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
    })
  })

  return response
}
