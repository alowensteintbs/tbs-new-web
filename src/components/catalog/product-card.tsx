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
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
        <PriceTag
          amount={product.amount}
          currencyCode={product.currencyCode}
          className="mt-auto text-base font-semibold text-gray-900"
        />
      </div>
    </Link>
  );
}
