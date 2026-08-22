import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const COOKIE_NAME = "skillassociate_session";

// Route protection mappings
const candidateRoutes = [
  "/dashboard",
  "/profile",
  "/resume",
  "/ats-checker",
  "/mock-interview",
  "/resources",
  "/settings",
];

const companyRoutes = ["/company"];
const instituteRoutes = ["/institute"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get(COOKIE_NAME);
  const token = tokenCookie?.value;

  const isCandidateRoute = candidateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isCompanyRoute = companyRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isInstituteRoute = instituteRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isProtected = isCandidateRoute || isCompanyRoute || isInstituteRoute;
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  const isAuthenticated = !!payload;

  // 1. Unauthenticated user accessing protected route -> Redirect to /login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already authenticated user accessing /login or /register -> Redirect to role's dashboard
  if (isAuthRoute && isAuthenticated && payload) {
    let dest = "/dashboard";
    if (payload.role === "COMPANY_ADMIN") dest = "/company/dashboard";
    if (payload.role === "INSTITUTE_ADMIN" || payload.role === "SUPER_ADMIN") dest = "/institute/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 3. Role authorization boundary enforcement
  if (isAuthenticated && payload) {
    if (isCompanyRoute && payload.role !== "COMPANY_ADMIN" && payload.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (isInstituteRoute && payload.role !== "INSTITUTE_ADMIN" && payload.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/resume/:path*",
    "/ats-checker/:path*",
    "/mock-interview/:path*",
    "/company/:path*",
    "/institute/:path*",
    "/resources/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
