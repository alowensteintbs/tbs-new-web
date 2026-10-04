"use client";

import { useActionState } from "react";
import { Field, inputCls } from "@/app/admin/_components/form-field";
import { saveOffer } from "../actions";

export type OfferValues = {
  id: string; productoPrincipalId: string; productoOfrecidoId: string;
  titulo: string; descripcion: string; activo: boolean; posicion: number;
  prices: Record<string, string>;
};

export function OfferForm({ products, currencies, initialValues }: {
  products: { id: string; name: string }[];
  currencies: { id: string; code: string }[];
  initialValues?: OfferValues;
}) {
  const [state, action, pending] = useActionState(saveOffer, {});
  return (
    <form action={action} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
      {initialValues && <input type="hidden" name="id" value={initialValues.id} />}
      {([
        ["productoPrincipalId", "Producto principal"], ["productoOfrecidoId", "Producto adicional"],
      ] as const).map(([name, label]) => (
        <Field key={name} name={name} label={label} errors={state.fieldErrors?.[name]}>
          <select name={name} defaultValue={initialValues?.[name] ?? ""} required className={inputCls}>
            <option value="" disabled>Selecciona un producto</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </Field>
      ))}
      <Field name="titulo" label="Título de la oferta" defaultValue={initialValues?.titulo} maxLength={191} required errors={state.fieldErrors?.titulo} />
      <Field name="descripcion" label="Descripción" errors={state.fieldErrors?.descripcion}>
        <textarea name="descripcion" defaultValue={initialValues?.descripcion} maxLength={5000} rows={3} className={inputCls} />
      </Field>
      <Field name="posicion" label="Posición" type="number" min={0} max={10000} defaultValue={initialValues?.posicion ?? 0} errors={state.fieldErrors?.posicion} />
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Precio especial por moneda</legend>
        <p className="text-sm text-gray-500">Sin precio, la oferta no se muestra en esa moneda. Los cupones se aplican al producto principal.</p>
        {currencies.map((currency) => (
          <Field key={currency.id} name={`price_${currency.id}`} label={currency.code}
            type="number" min={0} max="9999999999.99" step="0.01" defaultValue={initialValues?.prices[currency.id] ?? ""} />
        ))}
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" defaultChecked={initialValues?.activo ?? false} /> Oferta activa
      </label>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "Guardando…" : "Guardar oferta"}
      </button>
    </form>
  );
}
