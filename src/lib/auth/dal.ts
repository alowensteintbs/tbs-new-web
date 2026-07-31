import { cache } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "./session";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

export const getSession = cache(async () => {
  return verifySession();
});

/** Redirects to login if there is no active session. Use in server actions. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/**
 * Require an active session whose role is one of `roles`. Redirects to login if
 * unauthenticated, or to the dashboard if authenticated but not authorized —
 * so a logged-in user without the role can't reach the guarded page/action.
 * Use in both the page (server component) and its server actions.
 */
export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.role as Role)) redirect("/admin/dashboard");
  return session;
}

export const getUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
});
