import type { PayableOrder } from "./types";

/**
 * Turns an order into one-charge-per-unit lines whose total is exactly the
 * order's payable amount. This matters when a coupon changed `order.total`:
 * providers that require an itemised cart must receive that discounted amount,
 * never the historical pre-discount `OrderItem.unitPrice`.
 */
export function discountedPaymentItems(
  order: Pick<PayableOrder, "items" | "total">,
  toMinorUnits: (amount: number) => number
): { productName: string; amount: number }[] {
  // New orders snapshot each line's discount. Keep legacy proportional
  // allocation only for historical orders without those snapshots.
  if (order.items.length > 0 && order.items.every((item) => item.discountAmount != null)) {
    const units = order.items.flatMap((item) => {
      const quantity = Number(item.quantity);
      const gross = toMinorUnits(Number(item.unitPrice) * quantity);
      const discount = toMinorUnits(Number(item.discountAmount));
      if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(gross)
        || !Number.isSafeInteger(discount) || discount < 0 || discount > gross) {
        throw new Error("El pedido contiene artículos con un importe no válido.");
      }
      const net = gross - discount;
      return Array.from({ length: quantity }, (_, index) => ({
        productName: item.productName,
        amount: Math.floor(net / quantity) + (index < net % quantity ? 1 : 0),
      }));
    });
    const total = toMinorUnits(Number(order.total));
    if (!Number.isSafeInteger(total) || total <= 0 || units.reduce((sum, item) => sum + item.amount, 0) !== total) {
      throw new Error("El importe final del pedido no coincide con sus artículos.");
    }
    // Financing providers require positive article amounts. Free lines remain
    // in OrderItem/receipts but do not contribute a payable provider article.
    return units.filter((item) => item.amount > 0);
  }
  const units = order.items.flatMap((item) => {
    const quantity = Number(item.quantity);
    const amount = toMinorUnits(Number(item.unitPrice));
    if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(amount) || amount < 0) {
      throw new Error("El pedido contiene artículos con un importe no válido.");
    }
    return Array.from({ length: quantity }, () => ({ productName: item.productName, amount }));
  });

  const sourceTotal = units.reduce((sum, item) => sum + item.amount, 0);
  const targetTotal = toMinorUnits(Number(order.total));
  if (!Number.isSafeInteger(targetTotal) || targetTotal <= 0 || sourceTotal <= 0) {
    throw new Error("El importe final del pedido no es válido para iniciar el pago.");
  }
  if (targetTotal > sourceTotal) {
    throw new Error("El importe final del pedido no coincide con sus artículos.");
  }

  // Allocate with integer arithmetic so the provider cart adds up to the exact
  // payable amount. Any remainder is assigned deterministically, one minor
  // unit at a time, to the lines with the largest fractional share.
  const source = BigInt(sourceTotal);
  const target = BigInt(targetTotal);
  const allocated = units.map((item, index) => {
    const numerator = BigInt(item.amount) * target;
    return {
      ...item,
      index,
      amount: Number(numerator / source),
      remainder: numerator % source,
    };
  });
  let remaining = targetTotal - allocated.reduce((sum, item) => sum + item.amount, 0);
  for (const item of [...allocated].sort((a, b) => {
    if (a.remainder === b.remainder) return a.index - b.index;
    return a.remainder > b.remainder ? -1 : 1;
  })) {
    if (remaining === 0) break;
    item.amount += 1;
    remaining -= 1;
  }

  return allocated.map(({ productName, amount }) => ({ productName, amount }));
}
