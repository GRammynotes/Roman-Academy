import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  
  // Clear authentication cookies
  response.cookies.delete("ra_role");
  response.cookies.delete("ra_user_id");
  
  return response;
}
