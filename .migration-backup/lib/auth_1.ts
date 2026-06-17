import type { NextRequest } from "next/server";

export type AppRole = "teacher" | "student" | "admin";

export function getRoleFromRequest(request: Request | NextRequest): AppRole | null {
  const cookieHeader = request.headers.get?.("cookie") ?? "";
  const match = cookieHeader.match(/\bra_role=([^;]+)/);
  const role = match?.[1] as AppRole | undefined;
  if (role === "teacher" || role === "student" || role === "admin") return role;
  return null;
}

export function getUserIdFromRequest(request: Request | NextRequest): string | null {
  const cookieHeader = request.headers.get?.("cookie") ?? "";
  const match = cookieHeader.match(/\bra_user_id=([^;]+)/);
  return match?.[1] ?? null;
}

export function assertRole(request: Request | NextRequest, allowedRoles: AppRole[]) {
  const role = getRoleFromRequest(request);
  if (!role || !allowedRoles.includes(role)) {
    const error = new Error("Unauthorized");
    (error as any).status = 403;
    throw error;
  }
  return role;
}
