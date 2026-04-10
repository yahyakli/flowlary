import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/" && req.auth?.user?.email) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!req.auth?.user?.email) {
    if (pathname === "/") {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/expenses/:path*",
    "/expenses",
    "/goals/:path*",
    "/goals",
    "/debts/:path*",
    "/debts",
    "/history/:path*",
    "/history",
    "/settings/:path*",
    "/settings",
    "/api/:path*",
  ],
};
