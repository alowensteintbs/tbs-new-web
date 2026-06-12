"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Algo salió mal</h1>
      <p className="mt-2 text-gray-500">
        Ocurrió un error al cargar esta página. Intentá de nuevo.
      </p>
      <Button onClick={reset} className="mt-6">
        Reintentar
      </Button>
    </Container>
  );
}
