import { formatPrice } from "@/lib/currency-resolver";
import { cn } from "@/lib/utils";

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
    return (
      <span className={cn(className, "font-normal italic text-gray-400")}>
        Consultar precio
      </span>
    );
  }
  return <span className={cn(className, "tabular-nums")}>{formatPrice(amount, currencyCode)}</span>;
}
