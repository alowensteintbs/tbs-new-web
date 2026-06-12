import { formatPrice } from "@/lib/currency-resolver";

/** Renders a product price in the active currency, or a neutral fallback. */
export function PriceTag({
  amount,
  currencyCode,
  className,
}: {
  amount: number | null;
  currencyCode: string | null;
  className?: string;
}) {
  if (amount == null || !currencyCode) {
    return <span className={className}>Consultar precio</span>;
  }
  return <span className={className}>{formatPrice(amount, currencyCode)}</span>;
}
