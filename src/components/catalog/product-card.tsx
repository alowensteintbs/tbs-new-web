import Image from "next/image";
import Link from "next/link";
import { PriceTag } from "./price-tag";

export type ProductCardData = {
  slug: string;
  name: string;
  imageUrl: string | null;
  amount: number | null;
  currencyCode: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-10 w-10"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-xs font-medium text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto border-t border-gray-100 pt-3">
          <PriceTag
            amount={product.amount}
            currencyCode={product.currencyCode}
            className="text-base font-semibold text-gray-900 sm:text-lg"
          />
        </div>
      </div>
    </Link>
  );
}
