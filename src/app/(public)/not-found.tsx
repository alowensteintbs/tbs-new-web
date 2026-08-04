import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function PublicNotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Página no encontrada</h1>
      <p className="mt-2 text-gray-500">
        El contenido que buscas no existe o fue movido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </Container>
  );
}
