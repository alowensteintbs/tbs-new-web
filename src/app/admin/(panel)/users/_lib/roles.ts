import type { Role } from "@/generated/prisma/client";

/** Display label, badge classes and a short description per admin role. */
export const ROLE_META: Record<
  Role,
  { label: string; badge: string; description: string }
> = {
  SUPERADMIN: {
    label: "Superadmin",
    badge: "bg-violet-100 text-violet-700",
    description: "Acceso total, incluida la gestión de usuarios.",
  },
  ADMIN: {
    label: "Administrador",
    badge: "bg-blue-100 text-blue-700",
    description: "Gestiona catálogo, pedidos y pagos.",
  },
  COMERCIAL: {
    label: "Comercial",
    badge: "bg-emerald-100 text-emerald-700",
    description: "Acceso operativo al día a día.",
  },
};

export const ROLES = Object.keys(ROLE_META) as Role[];
