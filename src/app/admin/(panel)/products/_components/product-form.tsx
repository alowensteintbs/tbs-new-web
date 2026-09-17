"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "../actions";
import { ImageUploader, type ProductImageValue } from "./image-uploader";

export type EnabledCurrency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
};

export type CategoryOption = {
  id: string;
  name: string;
};

export type LandingOption = {
  slug: string;
  label: string;
};

type InitialValues = {
  id: string;
  name: string;
  landingSlug: string;
  sku: string | null;
  description: string;
  academyId: string;
  categoryId: string | null;
  visible: boolean;
  prices: Record<string, string>; // currencyId -> amount
  images: ProductImageValue[];
};

export function ProductForm({
  currencies,
  categories,
  landings,
  initialValues,
}: {
  currencies: EnabledCurrency[];
  categories: CategoryOption[];
  landings: LandingOption[];
  initialValues?: InitialValues;
}) {
  const isEditing = !!initialValues;
  const action = isEditing ? updateProduct : createProduct;
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    action,
    {}
  );
  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {isEditing && <input type="hidden" name="id" value={initialValues.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre"
          name="name"
          defaultValue={initialValues?.name}
          placeholder="Nombre del producto"
          errors={state.fieldErrors?.name}
          required
        />
        <Field
          label="Landing asociada"
          name="landingSlug"
          errors={state.fieldErrors?.landingSlug}
        >
          <select
            name="landingSlug"
            defaultValue={initialValues?.landingSlug ?? ""}
            className={inputCls}
            required
          >
            <option value="" disabled>
              Selecciona una landing
            </option>
            {landings.map((landing) => (
              <option key={landing.slug} value={landing.slug}>
                {landing.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="SKU"
          name="sku"
          defaultValue={initialValues?.sku ?? undefined}
          placeholder="Opcional"
          errors={state.fieldErrors?.sku}
        />
        <Field label="Categoría" name="categoryId" errors={state.fieldErrors?.categoryId}>
          <select
            name="categoryId"
            defaultValue={initialValues?.categoryId ?? ""}
            className={inputCls}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="ID academia"
        name="academyId"
        defaultValue={initialValues?.academyId}
        placeholder="Identificador en la academia"
        errors={state.fieldErrors?.academyId}
        required
      />

      <Field label="Descripción" name="description" errors={state.fieldErrors?.description}>
        <textarea
          name="description"
          defaultValue={initialValues?.description}
          placeholder="Descripción del producto"
          rows={4}
          className={inputCls}
        />
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">Imágenes</legend>
        <ImageUploader initialImages={initialValues?.images ?? []} />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">Precios</legend>
        {currencies.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay monedas habilitadas. Habilita al menos una para cargar precios.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {currencies.map((currency) => (
              <div key={currency.id}>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  {currency.name} ({currency.code})
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {currency.symbol}
                  </span>
                  <input
                    name={`price_${currency.id}`}
                    defaultValue={initialValues?.prices[currency.id] ?? ""}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          name="visible"
          type="checkbox"
          defaultChecked={initialValues?.visible ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Disponible para la venta
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
