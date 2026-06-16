import type { PaymentAdapter } from "../types";

/**
 * Manual / bank-transfer "gateway". No external API: the order stays PENDING
 * and the buyer is shown the payment instructions (stored in the gateway
 * config). An admin marks the order PAID by hand once the transfer arrives,
 * so there is no webhook.
 */
export const manualAdapter: PaymentAdapter = {
  provider: "manual",
  async createPayment() {
    return { kind: "internal" };
  },
};
