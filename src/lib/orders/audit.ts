import "server-only";

/** A compact, safe representation of the logged-in operator. */
export type OrderActor = {
  id: string;
  name: string;
};

/**
 * Payment gateways use different error shapes. Preserve the complete raw body
 * separately and show the clearest human-readable reason we can find.
 */
export function paymentFailureReason(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    const candidates = [
      body.failure_reason,
      body.failureReason,
      body.reason,
      body.message,
      typeof body.error === "string" ? body.error : undefined,
      isRecord(body.error) ? body.error.message : undefined,
      isRecord(body.error) ? body.error.description : undefined,
      isRecord(body.status_details) ? body.status_details.reason : undefined,
      isRecord(body.data) ? body.data.message : undefined,
    ];
    const reason = candidates.find((value): value is string =>
      typeof value === "string" && value.trim().length > 0
    );
    return reason?.trim().slice(0, 2_000) ?? null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
