"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AvailableGateway } from "@/lib/payments/checkout";
import { placeOrder, type CheckoutState } from "../actions";
import { StripeEmbeddedCheckout } from "./stripe-embedded-checkout";
import { SequraCheckout } from "./sequra-checkout";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm text-red-600">{errors[0]}</p>;
}

export function CheckoutForm({
  productId,
  currencyId,
  gateways,
}: {
  productId: string;
  currencyId: string;
  gateways: AvailableGateway[];
}) {
  const [state, formAction, isPending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    {}
  );

  // Gateway needs an inline payment form (Stripe embedded): swap the details
  // form for it once the server has created the payment session.
  if (state.embedded) {
    return (
      <StripeEmbeddedCheckout
        publishableKey={state.embedded.publishableKey}
        clientSecret={state.embedded.clientSecret}
      />
    );
  }

  // Gateway returned an HTML+JS form to embed inline (SeQura).
  if (state.widget) {
    return <SequraCheckout html={state.widget.html} />;
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="currencyId" value={currencyId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <Input name="name" placeholder="Tu nombre" required />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Apellidos
          </label>
          <Input name="surname" placeholder="Tus apellidos" required />
          <FieldError errors={state.fieldErrors?.surname} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
        <Input name="email" type="email" placeholder="tu@email.com" required />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <Input name="phone" type="tel" placeholder="+34 600 000 000" required />
        <FieldError errors={state.fieldErrors?.phone} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <Input name="addressLine" placeholder="Calle, número, piso" required />
        <FieldError errors={state.fieldErrors?.addressLine} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Población
          </label>
          <Input name="city" placeholder="Ciudad" required />
          <FieldError errors={state.fieldErrors?.city} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Código postal
          </label>
          <Input name="postalCode" placeholder="28001" required />
          <FieldError errors={state.fieldErrors?.postalCode} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Provincia
          </label>
          <Input name="province" placeholder="Madrid" required />
          <FieldError errors={state.fieldErrors?.province} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            País
          </label>
          <select
            name="country"
            defaultValue="ES"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ES">España</option>
            <option value="PT">Portugal</option>
            <option value="IT">Italia</option>
            <option value="FR">Francia</option>
          </select>
          <FieldError errors={state.fieldErrors?.country} />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-medium text-gray-700">
          Método de pago
        </legend>
        {gateways.map((g, i) => (
          <label
            key={g.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
          >
            <input
              type="radio"
              name="gatewayId"
              value={g.id}
              defaultChecked={i === 0}
              className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">{g.name}</span>
              {g.description && (
                <span className="block text-xs text-gray-500">{g.description}</span>
              )}
            </span>
          </label>
        ))}
        <FieldError errors={state.fieldErrors?.gatewayId} />
      </fieldset>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Procesando…" : "Confirmar compra"}
      </Button>
    </form>
  );
}
