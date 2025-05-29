import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has("admin_authenticated")
  const isAuthPage = request.nextUrl.pathname === "/"

  if (!isAuthenticated && !isAuthPage && !request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
