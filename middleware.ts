import { NextRequest, NextResponse } from "next/server";

import { createClient } from "./lib/supabase/server";

export default async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isPublicPath = pathname === "/login";
  const isProtectedPath = pathname.startsWith("/dashboard");

  if (isPublicPath && session !== null) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
