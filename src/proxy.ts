import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Initialize the response as the default 'next' response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({
              name,
              value,
              ...options,
            })
          );

          // Re-create the response to include the new cookies
          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
              path: "/",
            })
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() is more secure than getSession() for middleware
  // IMPORTANT: This refreshes the session if it's expired - Auth-First structure
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("PROXY DEBUG:", {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userId: user?.id,
    cookies: request.cookies.getAll().map((c) => c.name),
  });

  const url = request.nextUrl.clone();
  const isDashboard = url.pathname.startsWith("/dashboard");
  const isHomePage = url.pathname === "/";

  // LOGGED IN: If user is on the Landing Page, force them to the Dashboard
  if (user && isHomePage) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // NOT LOGGED IN: If user tries to access /dashboard, force them back Home
  if (!user && isDashboard) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
