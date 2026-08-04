"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * While an order sits PENDING right after a redirect payment, the confirming
 * webhook may land a few seconds after the buyer returns. This refreshes the
 * (force-dynamic) status page on an interval so the buyer sees PAID without a
 * manual reload. It stops as soon as the parent re-renders with `active=false`
 * (status changed) or after a cap, to avoid polling forever.
 */
export function PendingPoller({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (tries > 30) {
        clearInterval(id); // ~2 min at 4s — give up and let the buyer reload.
        return;
      }
      router.refresh();
    }, 4000);
    return () => clearInterval(id);
  }, [active, router]);

  return null;
}
