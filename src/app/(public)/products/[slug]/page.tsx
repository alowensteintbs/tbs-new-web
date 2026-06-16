import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveCurrency } from "@/lib/currency-resolver";
import { getProductDetail } from "@/lib/catalog";
import { buildProductMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { PriceTag } from "@/components/catalog/price-tag";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Metadata doesn't depend on currency; pass null to avoid a dynamic read.
  const product = await getProductDetail(slug, null);
  if (!product) return {};
  return buildProductMetadata({
    name: product.name,
    slug,
    description: product.description,
    imageUrl: product.images[0]?.url ?? null,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currency = await getActiveCurrency();
  const product = await getProductDetail(slug, currency?.id ?? null);

  if (!product) notFound();

  return (
    <Container className="py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-4">
          {product.category?.visible && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <PriceTag
            amount={product.amount}
            currencyCode={currency?.code ?? null}
            className="block text-2xl font-semibold text-gray-900"
          />
          {product.amount != null && (
            <Link
              href={`/checkout/${product.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
            >
              Comprar ahora
            </Link>
          )}
          {product.description && (
            <div className="whitespace-pre-line text-gray-600">
              {product.description}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
