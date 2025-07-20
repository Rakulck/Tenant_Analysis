import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("Middleware hit for:", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow auth routes and API routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) {
    return response;
  }

  // If user is not authenticated and trying to access protected routes
  if (!user) {
    if (pathname === "/" || pathname.startsWith("/en") || pathname.startsWith("/fr")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/en", request.url));
  }

  // If user is authenticated and visiting root, redirect to locale dashboard
  if (user && pathname === "/") {
    return NextResponse.redirect(new URL("/en", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
