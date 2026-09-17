import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Comprar",
  robots: { index: false, follow: false },
};

export default async function ComprarProductoPage({
  params,
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  const product = await db.product.findUnique({
    where: { landingSlug },
    select: { id: true, visible: true },
  });

  if (!product?.visible) notFound();

  redirect(`/checkout/${product.id}`);
}
