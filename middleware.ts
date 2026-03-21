export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    // Protect all routes except auth, api/auth, api/health, static files
    '/((?!login|setup|api/auth|api/health|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
}
