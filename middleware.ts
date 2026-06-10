import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("ra_role")?.value;
  const path = request.nextUrl.pathname;
  const publicPaths = ["/", "/login", "/contact"];
  const isPublicPath = publicPaths.includes(path) || path.startsWith("/api/auth/");

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role === "student" && (path.startsWith("/teacher") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  if (role === "teacher" && (path === "/student" || path.startsWith("/student/"))) {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/contact", "/api/auth/:path*", "/teacher/:path*", "/student/:path*", "/admin/:path*"]
};
