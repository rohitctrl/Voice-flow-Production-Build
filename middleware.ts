import { auth } from "@/lib/auth"

export default auth((req) => {
  // req.auth contains the user session
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Define which paths require authentication
  const isProtectedRoute = nextUrl.pathname.startsWith('/app')
  const isAuthRoute = nextUrl.pathname.startsWith('/auth')

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/app', nextUrl))
  }

  // Redirect unauthenticated users from protected routes to sign in
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', nextUrl))
  }

  return null
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}