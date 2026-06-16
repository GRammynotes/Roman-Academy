import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") === "student" ? "student" : "teacher";
  const redirectTo = role === "student" ? "/student" : "/teacher";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set("ra_role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return response;
}
