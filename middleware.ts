import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("ra_role")?.value;
  const path = request.nextUrl.pathname;

  if (role === "student" && (path.startsWith("/teacher") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  if (role === "teacher" && (path === "/student" || path.startsWith("/student/"))) {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/admin/:path*"]
};
