import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { getAdapter } from "@/lib/payments";
import { applyWebhookResult, readGatewayConfig } from "@/lib/payments/checkout";

/**
 * Per-gateway webhook sink: `POST /api/payments/webhook/<gatewayId>`.
 *
 * The URL identifies a single gateway instance, because a provider can have
 * several (e.g. a Stripe account per region), each with its own signing
 * secret. We resolve that row, pick its adapter by `provider`, and let the
 * adapter verify the signature with that instance's credentials. Register this
 * exact URL as the endpoint in the matching provider dashboard.
 *
 * The adapter never touches the DB — we apply its `WebhookResult` here.
 */
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gatewayId: string }> }
) {
  const { gatewayId } = await params;

  const gateway = await db.paymentGateway.findUnique({
    where: { id: gatewayId },
    select: { provider: true, config: true, enabled: true, live: true },
  });
  if (!gateway || !gateway.enabled) {
    return new Response("Gateway not configured", { status: 404 });
  }

  const adapter = getAdapter(gateway.provider);
  if (!adapter?.handleWebhook) {
    return new Response("Unsupported provider", { status: 404 });
  }

  // Raw body is required for signature verification — never parse it first.
  const rawBody = await request.text();

  let result;
  try {
    result = await adapter.handleWebhook(
      rawBody,
      request.headers,
      readGatewayConfig(gateway.config),
      { baseUrl: getSiteUrl(), gatewayId, live: gateway.live }
    );
  } catch (err) {
    // Bad signature or malformed event → 400 so the provider retries.
    console.error(`[webhook:${gateway.provider}:${gatewayId}] failed`, err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Irrelevant/ignored event: acknowledge so the provider stops retrying.
  if (!result) return new Response("ignored", { status: 200 });

  const orderId = await applyWebhookResult(result);
  if (orderId) revalidatePath("/admin/orders");

  // Some providers confirm the sale via the response body (Aplazame's
  // `{"status":"ok"}` handshake). Return their ack verbatim when present.
  if (result.ack) {
    return new Response(result.ack.body, {
      status: result.ack.status ?? 200,
      headers: result.ack.contentType
        ? { "content-type": result.ack.contentType }
        : undefined,
    });
  }

  return new Response("ok", { status: 200 });
}
