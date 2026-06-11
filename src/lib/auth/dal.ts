import { cache } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "./session";
import { db } from "@/lib/db";

export const getSession = cache(async () => {
  return verifySession();
});

/** Redirects to login if there is no active session. Use in server actions. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
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
