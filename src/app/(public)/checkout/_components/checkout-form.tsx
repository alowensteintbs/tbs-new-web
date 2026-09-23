"use client";

import Image from "next/image";
import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { countryCallingCode, SPANISH_PROVINCES } from "@/lib/address";
import type { AvailableGateway } from "@/lib/payments/checkout";
import type { CountryOption } from "@/lib/countries";
import {
  placeOrder,
  previewCoupon,
  getCheckoutQuote,
  type CheckoutState,
  type CheckoutQuote,
  type CouponPreview,
} from "../actions";
import { CheckoutPaymentModal } from "./checkout-payment-modal";
import styles from "./checkout.module.css";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className={styles.fieldError}>{errors[0]}</p>;
}

function Field({
  label,
  name,
  placeholder,
  type,
  errors,
  pattern,
  title,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  errors?: string[];
  pattern?: string;
  title?: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label} *</label>
      <input
        id={name}
        className={styles.input}
        name={name}
        type={type}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        required
      />
      <FieldError errors={errors} />
    </div>
  );
}

function gatewayLabel(gateway: AvailableGateway) {
  return gateway.name;
}

const GATEWAY_LOGOS = {
  stripe: { src: "/payment-providers/stripe.svg", alt: "Stripe", width: 512, height: 214 },
  paypal: { src: "/payment-providers/paypal.svg", alt: "PayPal", width: 124, height: 33 },
  aplazame: { src: "/payment-providers/aplazame.svg", alt: "Aplazame", width: 120, height: 32 },
  dlocal: { src: "/payment-providers/dlocal.png", alt: "dLocal", width: 545, height: 130 },
} as const;

function GatewayLogo({ provider }: { provider: string }) {
  const logo = GATEWAY_LOGOS[provider as keyof typeof GATEWAY_LOGOS];
  if (!logo) return null;

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      className={styles.gatewayLogo}
    />
  );
}

function checkoutButtonLabel(gateway?: AvailableGateway) {
  if (!gateway) return "Continuar al pago";
  if (gateway.provider === "manual") return "Ver instrucciones de pago";
  return `Continuar con ${gatewayLabel(gateway)}`;
}

export function CheckoutForm({
  productId,
  productName,
  currencyId,
  currencyCode,
  gateways,
  countries,
  amount,
  amountLabel,
}: {
  productId: string;
  productName: string;
  currencyId: string;
  currencyCode: string;
  gateways: AvailableGateway[];
  countries: CountryOption[];
  amount: number;
  amountLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    {}
  );
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote>({
    available: true,
    currencyId,
    currencyCode,
    amount,
    amountLabel,
    gateways,
  });
  const [selectedGateway, setSelectedGateway] = useState(gateways[0]?.id ?? "");
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((country) => country.code === "ES")?.code ?? countries[0]?.code ?? ""
  );
  const [checking, startCheck] = useTransition();
  const [updatingQuote, startQuoteUpdate] = useTransition();
  const quoteRequest = useRef(0);

  const activeGateways = quote.available ? quote.gateways : [];
  const activeCurrencyId = quote.available ? quote.currencyId : "";
  const activeCurrencyCode = quote.available ? quote.currencyCode : currencyCode;
  const activeAmount = quote.available ? quote.amount : amount;
  const activeAmountLabel = quote.available ? quote.amountLabel : "No disponible";

  const installmentLabel = useMemo(
    () =>
      new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: activeCurrencyCode,
      }).format(activeAmount / 12),
    [activeAmount, activeCurrencyCode]
  );
  const selectedGatewayDetails = activeGateways.find(
    (gateway) => gateway.id === selectedGateway
  );

  function applyCoupon() {
    if (!couponCode.trim() || !quote.available) return;
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("currencyId", quote.currencyId);
    fd.set("couponCode", couponCode);
    startCheck(async () => setCoupon(await previewCoupon(fd)));
  }

  function updateCountry(country: string) {
    setSelectedCountry(country);
    setCoupon(null);
    const request = ++quoteRequest.current;
    startQuoteUpdate(async () => {
      const nextQuote = await getCheckoutQuote(productId, country);
      if (request === quoteRequest.current) {
        setQuote(nextQuote);
        setSelectedGateway(nextQuote.available ? nextQuote.gateways[0]?.id ?? "" : "");
      }
    });
  }

  return (
    <>
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="currencyId" value={activeCurrencyId} />

      <section className={styles.summary} aria-labelledby="checkout-summary-title">
        <h1 id="checkout-summary-title" className={styles.summaryHeading}>
          Tus formaciones
          <Image
            src="/checkout/shopping-cart.svg"
            alt=""
            width={40}
            height={40}
            aria-hidden="true"
          />
        </h1>
        <div className={styles.summaryBody}>
          <div className={styles.summaryRow}>
            <span>{productName}</span>
            <span>{activeAmountLabel}</span>
          </div>
          <hr className={styles.summaryDivider} />
          <div className={styles.summaryDetails}>
            {coupon?.ok && (
              <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                <span>Código {coupon.code}</span>
                <span>- {coupon.discountLabel}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{activeAmountLabel}</span>
            </div>
          </div>
          <hr className={styles.summaryDivider} />
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>TOTAL</span>
            <span>{coupon?.ok ? coupon.totalLabel : activeAmountLabel}</span>
          </div>
        </div>
      </section>

      <div className={styles.columns}>
        <section className={styles.panel} aria-labelledby="customer-title">
          <h2 id="customer-title" className={styles.panelHeading}>
            Información del cliente
          </h2>
          <div className={styles.fields}>
            <Field
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              errors={state.fieldErrors?.email}
            />
            <div className={`${styles.fieldRow} ${styles.fieldRowTight}`}>
              <Field
                label="Nombre"
                name="name"
                placeholder="Nombre"
                errors={state.fieldErrors?.name}
              />
              <Field
                label="Apellidos"
                name="surname"
                placeholder="Apellidos"
                errors={state.fieldErrors?.surname}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Teléfono *</label>
              <div className={styles.phone}>
                <span className={styles.phoneCode} aria-label="Prefijo internacional">
                  {countryCallingCode(selectedCountry)}
                </span>
                <input
                  id="phone"
                  className={styles.input}
                  name="phone"
                  type="tel"
                  placeholder="600 000 000"
                  required
                />
              </div>
              <FieldError errors={state.fieldErrors?.phone} />
            </div>
            <Field
              label="Dirección de la calle"
              name="addressLine"
              placeholder="Calle, número, piso, puerta"
              errors={state.fieldErrors?.addressLine}
            />
            <div className={styles.fieldRow}>
              <Field
                label="Población"
                name="city"
                placeholder="Ciudad / Municipio"
                errors={state.fieldErrors?.city}
              />
              <Field
                label="Código postal / ZIP"
                name="postalCode"
                placeholder="41001"
                errors={state.fieldErrors?.postalCode}
                pattern={selectedCountry === "ES" ? "[0-9]{5}" : undefined}
                title={
                  selectedCountry === "ES"
                    ? "Introduce un código postal español de 5 dígitos."
                    : undefined
                }
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="country">País / Región *</label>
                <div className={styles.selectWrap}>
                  <select
                    id="country"
                    name="country"
                    value={selectedCountry}
                    onChange={(event) => updateCountry(event.target.value)}
                    required
                    className={styles.select}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <Image
                    src="/checkout/chevron-down.svg"
                    alt=""
                    width={12}
                    height={8}
                    aria-hidden="true"
                  />
                </div>
                {updatingQuote && <p className={styles.quoteUpdating}>Actualizando precio…</p>}
                <FieldError errors={state.fieldErrors?.country} />
              </div>
              {selectedCountry === "ES" ? (
                <div className={styles.field}>
                  <label htmlFor="province">Provincia *</label>
                  <div className={styles.selectWrap}>
                    <select
                      id="province"
                      name="province"
                      defaultValue="Sevilla"
                      required
                      className={styles.select}
                    >
                      <option value="" disabled>
                        Elige una provincia
                      </option>
                      {SPANISH_PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    <Image
                      src="/checkout/chevron-down.svg"
                      alt=""
                      width={12}
                      height={8}
                      aria-hidden="true"
                    />
                  </div>
                  <FieldError errors={state.fieldErrors?.province} />
                </div>
              ) : (
                <Field
                  key={selectedCountry}
                  label="Provincia / Región"
                  name="province"
                  placeholder="Provincia / Región"
                  errors={state.fieldErrors?.province}
                />
              )}
            </div>
          </div>

          <div className={styles.coupon}>
            <button
              type="button"
              className={styles.couponToggle}
              aria-expanded={couponOpen}
              onClick={() => setCouponOpen((open) => !open)}
            >
              ¿Tienes un cupón? Haz clic aquí para introducir tu código
            </button>
            {couponOpen && (
              <div>
                <div className={styles.couponFields}>
                  <input
                    className={styles.input}
                    name="couponCode"
                    aria-label="Código de descuento"
                    placeholder="Introduce tu código"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value);
                      setCoupon(null);
                    }}
                  />
                  <button
                    type="button"
                    className={styles.couponButton}
                    onClick={applyCoupon}
                    disabled={checking || !couponCode.trim() || !quote.available}
                  >
                    {checking ? "Comprobando…" : "Aplicar"}
                  </button>
                </div>
                {coupon && !coupon.ok && (
                  <p className={styles.fieldError}>{coupon.error}</p>
                )}
                {coupon?.ok && (
                  <p className={styles.couponSuccess}>Cupón {coupon.code} aplicado</p>
                )}
                <FieldError errors={state.fieldErrors?.couponCode} />
              </div>
            )}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="payment-title">
          <h2 id="payment-title" className={styles.panelHeading}>
            Método de pago
          </h2>
          <fieldset className={styles.gateways}>
            <legend className="sr-only">Elige un método de pago</legend>
            {updatingQuote && <p className={styles.quoteUpdating}>Actualizando métodos de pago…</p>}
            {!updatingQuote && !quote.available && (
              <p className={styles.formError}>{quote.error}</p>
            )}
            {!updatingQuote && quote.available && activeGateways.length === 0 && (
              <p className={styles.formError}>
                No hay métodos de pago disponibles para esta moneda.
              </p>
            )}
            {!updatingQuote && activeGateways.map((gateway) => {
              const selected = selectedGateway === gateway.id;
              return (
                <label
                  key={gateway.id}
                  className={`${styles.gateway} ${selected ? styles.gatewaySelected : ""}`}
                >
                  <input
                    type="radio"
                    name="gatewayId"
                    value={gateway.id}
                    checked={selected}
                    onChange={() => setSelectedGateway(gateway.id)}
                    className={styles.radio}
                  />
                  <span className={styles.gatewayCopy}>
                    <span className={styles.gatewayName}>{gatewayLabel(gateway)}</span>
                    {selected && gateway.description && (
                      <span className={styles.gatewayDescription}>
                        {gateway.provider === "sequra"
                          ? "en 3, 6, 9, 12 o 18 meses"
                          : gateway.description}
                      </span>
                    )}
                  </span>
                  {gateway.provider === "sequra" && (
                    <span className={styles.sequraBadge}>seQura</span>
                  )}
                  {gateway.provider !== "sequra" && (
                    <GatewayLogo provider={gateway.provider} />
                  )}
                  {selected && gateway.provider === "sequra" && (
                    <span className={styles.gatewayExtra}>
                      <span>desde {installmentLabel}/cuota</span>
                      <span>+información</span>
                    </span>
                  )}
                </label>
              );
            })}
            <FieldError errors={state.fieldErrors?.gatewayId} />
          </fieldset>

          <p className={styles.privacy}>
            Tus datos personales se utilizarán para procesar tu pedido, mejorar tu
            experiencia en esta web y otros propósitos descritos en nuestra{" "}
            <a href="/politica-de-privacidad">política de privacidad</a>.
          </p>

          <label className={styles.terms}>
            <input type="checkbox" name="terms" value="accepted" required />
            <span>
              He leído y estoy de acuerdo con los{" "}
              <a href="/terminos-y-condiciones">términos y condiciones de la web</a> *
            </span>
          </label>
          <FieldError errors={state.fieldErrors?.terms} />

          {state.error && <p className={styles.formError}>{state.error}</p>}

          <button
            type="submit"
            disabled={isPending || updatingQuote || !quote.available || !selectedGateway}
            className={styles.submit}
          >
            {isPending ? "Procesando…" : checkoutButtonLabel(selectedGatewayDetails)}
          </button>

          <p className={styles.help}>
            Si estás encontrando problemas para realizar el pago, por favor escríbenos
            al <a href="https://wa.me/34666600867">Whatsapp (666 600 867)</a> o{" "}
            <a href="mailto:info@tradersbusinessschool.com?subject=Quiero%20agendar%20una%20llamada">
              agenda una llamada
            </a>{" "}
            con nosotros en la que te resolveremos todas las dudas y te ayudaremos
            personalmente.
          </p>
        </section>
      </div>
    </form>
    <CheckoutPaymentModal state={state} />
    </>
  );
}
