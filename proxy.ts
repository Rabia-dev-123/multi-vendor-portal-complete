import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { getRoleBasedDashboard } from "@/lib/utils/user-roles";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Define role-based route patterns
  const roleBasedRoutes = {
    VENDOR: /^\/vendor/,
    ADMIN: /^\/admin/,
    SUPER_ADMIN: /^\/superadmin/,
  };

  // Public routes that don't require authentication
  const publicPaths = ["/error-404"];
  const isPublicPath = publicPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  // Auth pages
  const authPaths = ["/signin", "/signup", "/reset-password"];
  const isAuthPath = authPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  // API routes
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Allow API routes and public paths
  if (isApiRoute || isPublicPath) {
    return undefined;
  }

  // Redirect logged-in users away from auth pages to their dashboard
  if (isLoggedIn && isAuthPath) {
    const dashboardUrl = getRoleBasedDashboard(userRole as string);
    return Response.redirect(new URL(dashboardUrl, nextUrl));
  }

  // Protect all non-auth, non-public routes
  if (!isLoggedIn && !isAuthPath) {
    const callbackUrl = nextUrl.pathname;
    const signInUrl = new URL("/signin", nextUrl);
    if (callbackUrl !== "/") {
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
    }
    return Response.redirect(signInUrl);
  }

  // Check role-based access for logged-in users
  if (isLoggedIn && userRole) {
    // Check if user is trying to access a role-specific route
    for (const [role, pattern] of Object.entries(roleBasedRoutes)) {
      if (pattern.test(nextUrl.pathname)) {
        // If user's role doesn't match, redirect to their dashboard
        if (userRole !== role) {
          const dashboardUrl = getRoleBasedDashboard(userRole);
          return Response.redirect(new URL(dashboardUrl, nextUrl));
        }
      }
    }

    // Redirect from root to role-based dashboard
    if (nextUrl.pathname === "/") {
      const dashboardUrl = getRoleBasedDashboard(userRole);
      return Response.redirect(new URL(dashboardUrl, nextUrl));
    }
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
