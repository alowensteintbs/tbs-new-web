"use client";

import { useActionState, useState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import {
  createCoupon,
  updateCoupon,
  type CouponFormState,
} from "../actions";

export type CurrencyOption = { id: string; code: string; name: string };
export type ProductOption = { id: string; name: string };

export type CouponInitialValues = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  percent: string;
  amount: string;
  currencyId: string;
  minAmount: string;
  maxUses: string;
  oncePerCustomer: boolean;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
  productIds: string[];
};

export function CouponForm({
  currencies,
  products,
  initialValues,
  mode = "edit",
}: {
  currencies: CurrencyOption[];
  products: ProductOption[];
  initialValues: CouponInitialValues;
  mode?: "create" | "edit";
}) {
  const isCreate = mode === "create";
  const [state, formAction, isPending] = useActionState<CouponFormState, FormData>(
    isCreate ? createCoupon : updateCoupon,
    {}
  );
  const [type, setType] = useState(initialValues.type);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {!isCreate && <input type="hidden" name="id" value={initialValues.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Código"
          name="code"
          defaultValue={initialValues.code}
          placeholder="VERANO20"
          errors={state.fieldErrors?.code}
          required
          style={{ textTransform: "uppercase" }}
        />
        <Field label="Tipo de descuento" name="type">
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
            className={inputCls}
          >
            <option value="PERCENTAGE">Porcentaje (%)</option>
            <option value="FIXED">Importe fijo</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {type === "PERCENTAGE" ? (
          <Field
            label="Porcentaje (%)"
            name="percent"
            type="number"
            min="0"
            max="100"
            step="0.01"
            defaultValue={initialValues.percent}
            placeholder="20"
            errors={state.fieldErrors?.percent}
          />
        ) : (
          <Field
            label="Importe"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialValues.amount}
            placeholder="50"
            errors={state.fieldErrors?.amount}
          />
        )}

        <Field label="Moneda" name="currencyId" errors={state.fieldErrors?.currencyId}>
          <select
            name="currencyId"
            defaultValue={initialValues.currencyId}
            className={inputCls}
          >
            <option value="">
              {type === "FIXED" ? "Elige una moneda" : "Cualquiera (todas)"}
            </option>
            {currencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            El importe fijo necesita una moneda. En porcentaje, déjala en
            «Cualquiera» salvo que quieras limitarlo a una moneda.
          </p>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Importe mínimo de compra"
          name="minAmount"
          type="number"
          min="0"
          step="0.01"
          defaultValue={initialValues.minAmount}
          placeholder="Sin mínimo"
          errors={state.fieldErrors?.minAmount}
        />
        <Field
          label="Máximo de usos totales"
          name="maxUses"
          type="number"
          min="1"
          step="1"
          defaultValue={initialValues.maxUses}
          placeholder="Ilimitado"
          errors={state.fieldErrors?.maxUses}
        />
        <div className="flex items-end pb-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="oncePerCustomer"
              defaultChecked={initialValues.oncePerCustomer}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Un uso por cliente
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Válido desde (opcional)"
          name="startsAt"
          type="datetime-local"
          defaultValue={initialValues.startsAt}
        />
        <Field
          label="Válido hasta (opcional)"
          name="endsAt"
          type="datetime-local"
          defaultValue={initialValues.endsAt}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Productos a los que aplica
        </label>
        {products.length === 0 ? (
          <p className="text-sm text-gray-400">No hay productos.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {products.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  name="productIds"
                  value={p.id}
                  defaultChecked={initialValues.productIds.includes(p.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Si no marcas ninguno, el cupón aplica a todos los productos.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={initialValues.enabled}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Habilitado
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {isPending ? "Guardando…" : isCreate ? "Crear cupón" : "Guardar cambios"}
      </button>
    </form>
  );
}
