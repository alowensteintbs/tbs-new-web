"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth/dal";
import { normalizeCode } from "@/lib/coupons";

export type CouponFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const baseSchema = z.object({
  code: z.string().trim().min(1, "El código es obligatorio").max(60),
  type: z.enum(["PERCENTAGE", "FIXED"]),
});

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function date(v: FormDataEntryValue | null): Date | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Build the coupon data (and product ids) from the form, or field errors. */
function parseCoupon(formData: FormData):
  | { ok: true; data: Prisma.CouponUncheckedCreateInput; productIds: string[] }
  | { ok: false; fieldErrors: Record<string, string[]> } {
  const base = baseSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
  });
  const fieldErrors: Record<string, string[]> = base.success
    ? {}
    : z.flattenError(base.error).fieldErrors;

  const type = (formData.get("type") as "PERCENTAGE" | "FIXED") ?? "PERCENTAGE";
  const percent = num(formData.get("percent"));
  const amount = num(formData.get("amount"));
  const currencyId = String(formData.get("currencyId") ?? "").trim() || null;
  const minAmount = num(formData.get("minAmount"));
  const maxUses = num(formData.get("maxUses"));

  if (type === "PERCENTAGE") {
    if (percent == null || percent <= 0 || percent > 100) {
      fieldErrors.percent = ["Introduce un porcentaje entre 0 y 100."];
    }
  } else {
    if (amount == null || amount <= 0) {
      fieldErrors.amount = ["Introduce un importe mayor que 0."];
    }
    if (!currencyId) {
      fieldErrors.currencyId = ["Un cupón de importe fijo necesita una moneda."];
    }
  }
  if (minAmount != null && !currencyId) {
    fieldErrors.minAmount = ["El importe mínimo necesita una moneda."];
  }
  if (maxUses != null && (maxUses < 1 || !Number.isInteger(maxUses))) {
    fieldErrors.maxUses = ["El máximo de usos debe ser un entero positivo."];
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const data: Prisma.CouponUncheckedCreateInput = {
    code: normalizeCode(String(formData.get("code"))),
    type,
    percent: type === "PERCENTAGE" ? new Prisma.Decimal(percent!) : null,
    amount: type === "FIXED" ? new Prisma.Decimal(amount!) : null,
    currencyId,
    minAmount: minAmount != null ? new Prisma.Decimal(minAmount) : null,
    maxUses: maxUses != null ? Math.trunc(maxUses) : null,
    oncePerCustomer: formData.get("oncePerCustomer") === "on",
    startsAt: date(formData.get("startsAt")),
    endsAt: date(formData.get("endsAt")),
    enabled: formData.get("enabled") === "on",
  };
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);
  return { ok: true, data, productIds };
}

export async function createCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireSession();
  const parsed = parseCoupon(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  try {
    await db.coupon.create({
      data: {
        ...parsed.data,
        products: { create: parsed.productIds.map((productId) => ({ productId })) },
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { fieldErrors: { code: ["Ya existe un cupón con ese código."] } };
    }
    throw err;
  }

  revalidatePath("/admin/descuentos");
  redirect("/admin/descuentos");
}

export async function updateCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Cupón no encontrado." };

  const parsed = parseCoupon(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  try {
    await db.$transaction([
      db.couponProduct.deleteMany({ where: { couponId: id } }),
      db.coupon.update({
        where: { id },
        data: {
          ...parsed.data,
          products: {
            create: parsed.productIds.map((productId) => ({ productId })),
          },
        },
      }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { fieldErrors: { code: ["Ya existe un cupón con ese código."] } };
    }
    throw err;
  }

  revalidatePath("/admin/descuentos");
  redirect("/admin/descuentos");
}

export async function toggleCoupon(id: string, enabled: boolean): Promise<void> {
  await requireSession();
  await db.coupon.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/descuentos");
}

export async function deleteCoupon(id: string): Promise<{ error?: string }> {
  await requireSession();
  // Orders keep their couponCode snapshot; the FK is SetNull, so this is safe.
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/descuentos");
  return {};
}
