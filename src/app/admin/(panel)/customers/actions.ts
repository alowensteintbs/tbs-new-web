"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";

/**
 * Customers are normally created at checkout, but the admin can also create
 * and edit them here (fix typos, complete billing data, deduplicate). Every
 * action re-checks the session server-side; the panel is guarded by proxy.ts
 * plus this explicit check as defense in depth.
 */

// Optional free-text field: trims and turns "" into undefined so blanks don't
// overwrite stored values with empty strings.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const customerSchema = z.object({
  email: z.email("Email inválido").transform((e) => e.trim().toLowerCase()),
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  surname: optionalText(120),
  phone: optionalText(40),
  addressLine: optionalText(200),
  city: optionalText(120),
  postalCode: optionalText(20),
  province: optionalText(120),
  // ISO-3166 alpha-2, stored uppercase.
  country: z
    .string()
    .trim()
    .toUpperCase()
    .length(2, "Usa el código ISO de 2 letras (ej. ES)")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

export type CustomerFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return customerSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    surname: formData.get("surname") ?? "",
    phone: formData.get("phone") ?? "",
    addressLine: formData.get("addressLine") ?? "",
    city: formData.get("city") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    province: formData.get("province") ?? "",
    country: formData.get("country") ?? "",
  });
}

export async function createCustomer(
  _prev: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requireSession();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { email, ...rest } = parsed.data;

  const exists = await db.customer.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) return { error: `Ya existe un cliente con el email ${email}.` };

  await db.customer.create({ data: { email, ...rest } });

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(
  _prev: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Cliente inválido." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { email, ...rest } = parsed.data;

  const target = await db.customer.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!target) return { error: "El cliente no existe." };

  // Email must stay unique across other customers.
  const clash = await db.customer.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { error: `Ya existe otro cliente con el email ${email}.` };

  await db.customer.update({ where: { id }, data: { email, ...rest } });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string): Promise<{ error?: string }> {
  await requireSession();

  const target = await db.customer.findUnique({
    where: { id },
    select: { id: true, _count: { select: { orders: true } } },
  });
  if (!target) return { error: "El cliente no existe." };

  // A customer with orders can't be removed — orders require a customer and
  // deleting would orphan the purchase history.
  if (target._count.orders > 0) {
    return {
      error:
        "No se puede eliminar un cliente con pedidos. Conserva el historial de compra.",
    };
  }

  await db.customer.delete({ where: { id } });
  revalidatePath("/admin/customers");
  return {};
}
