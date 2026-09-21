"use client";

import Link from "next/link";
import type { CheckoutState } from "../actions";
import { SequraCheckout } from "./sequra-checkout";
import { StripeEmbeddedCheckout } from "./stripe-embedded-checkout";
import styles from "./checkout.module.css";

function providerName(provider: string) {
  if (provider === "paypal") return "PayPal";
  if (provider === "aplazame") return "Aplazame";
  if (provider === "dlocal") return "dLocal";
  return provider;
}

function PaymentShell({
  title,
  description,
  orderNumber,
  children,
}: {
  title: string;
  description: string;
  orderNumber: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.paymentOverlay} role="presentation">
      <section
        className={styles.paymentModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div className={styles.paymentModalHeader}>
          <div>
            <p className={styles.paymentEyebrow}>Pedido {orderNumber}</p>
            <h2 id="payment-modal-title">{title}</h2>
            <p>{description}</p>
          </div>
          <span className={styles.paymentSecure}>Pago seguro</span>
        </div>
        {children}
      </section>
    </div>
  );
}

export function CheckoutPaymentModal({ state }: { state: CheckoutState }) {
  if (state.embedded) {
    return (
      <PaymentShell
        title="Paga con tarjeta"
        description="Completa los datos de tu tarjeta en el checkout seguro de Stripe."
        orderNumber={state.embedded.orderNumber}
      >
        <StripeEmbeddedCheckout
          publishableKey={state.embedded.publishableKey}
          clientSecret={state.embedded.clientSecret}
        />
      </PaymentShell>
    );
  }

  if (state.widget) {
    return (
      <PaymentShell
        title="Continúa con seQura"
        description="Elige tus cuotas y completa la solicitud de financiación."
        orderNumber={state.widget.orderNumber}
      >
        <SequraCheckout html={state.widget.html} />
      </PaymentShell>
    );
  }

  if (state.external) {
    const name = providerName(state.external.provider);
    return (
      <PaymentShell
        title={`Continúa con ${name}`}
        description={`Te llevaremos al entorno seguro de ${name} para completar el pago.`}
        orderNumber={state.external.orderNumber}
      >
        <div className={styles.paymentActions}>
          <a className={styles.paymentPrimaryAction} href={state.external.url}>
            Ir a {name}
          </a>
          <Link className={styles.paymentSecondaryAction} href={`/orders/${state.external.orderId}`}>
            Ver mi pedido
          </Link>
        </div>
      </PaymentShell>
    );
  }

  if (state.internal) {
    return (
      <PaymentShell
        title="Pedido registrado"
        description="Consulta los datos y las instrucciones para completar tu pago."
        orderNumber={state.internal.orderNumber}
      >
        <div className={styles.paymentActions}>
          <Link className={styles.paymentPrimaryAction} href={`/orders/${state.internal.orderId}`}>
            Ver instrucciones de pago
          </Link>
        </div>
      </PaymentShell>
    );
  }

  return null;
}
