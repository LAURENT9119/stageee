
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Vérifier que les variables d'environnement existent
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si les variables ne sont pas configurées, laisser passer sans authentification
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://placeholder.supabase.co' || 
      supabaseAnonKey === 'placeholder-key') {
    console.warn('⚠️ Supabase environment variables not configured, skipping auth middleware')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      },
    )

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Routes protégées
    const protectedRoutes = ["/admin", "/rh", "/tuteur", "/stagiaire"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // Rediriger vers login si non authentifié
    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Rediriger vers dashboard si déjà authentifié et sur page auth
    if (user && request.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

  } catch (error) {
    console.error('Middleware error:', error)
    // En cas d'erreur, laisser passer la requête
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
