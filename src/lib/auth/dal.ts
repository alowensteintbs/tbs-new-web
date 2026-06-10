import { cache } from "react";
import { verifySession } from "./session";
import { db } from "@/lib/db";

export const getSession = cache(async () => {
  return verifySession();
});

export const getUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
});
