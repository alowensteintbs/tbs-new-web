"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SequraFormElement?: string;
    SequraFormInstance?: {
      show: () => void;
      setCloseCallback?: (callback: () => void) => void;
    };
  }
}

/**
 * SeQura identification form, embedded on our checkout page.
 *
 * The returned snippet already contains the provider's own hidden iframe plus
 * its bootstrap script. It must be mounted in the checkout document as-is;
 * wrapping it in a second iframe prevents that bootstrap from showing it.
 */
export function SequraCheckout({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // React Strict Mode replays effects in development. seQura's snippet owns
    // a live iframe and a global bootstrap variable, so tearing it down during
    // that replay cancels the iframe request and leaves the second bootstrap
    // pointing at a half-initialized form. Keep the provider mount idempotent;
    // React will remove the whole container when the modal actually unmounts.
    if (container.dataset.sequraMounted === "true") return;
    container.dataset.sequraMounted = "true";

    const mount = async () => {
      // Scripts added with innerHTML never execute. Replace each one with a
      // live script, in sequence, because the seQura bootstrap relies on the
      // inline configuration immediately before its external bundle.
      container.innerHTML = html;
      const scripts = Array.from(container.querySelectorAll("script"));

      for (const oldScript of scripts) {
        const script = document.createElement("script");
        for (const attribute of Array.from(oldScript.attributes)) {
          script.setAttribute(attribute.name, attribute.value);
        }
        script.textContent = oldScript.textContent;

        if (script.src) {
          const loaded = await new Promise<boolean>((resolve) => {
            script.addEventListener("load", () => resolve(true), { once: true });
            script.addEventListener("error", () => resolve(false), { once: true });
            oldScript.replaceWith(script);
          });
          if (!loaded) {
            setStatus("error");
            return;
          }
        } else {
          oldScript.replaceWith(script);
        }
      }

      // `form_v2` returns a hidden fixed iframe by design. seQura's documented
      // final step is to make its instance visible after its bundle has loaded.
      if (!window.SequraFormInstance) {
        setStatus("error");
        return;
      }
      window.SequraFormInstance.show();
      setStatus("ready");
    };

    void mount();
  }, [html]);

  return (
    <>
      {status === "loading" && (
        <div className="fixed inset-0 z-[999998] grid place-items-center bg-black/30" role="status">
          <span className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-xl">
            Cargando formulario de seQura…
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="fixed inset-0 z-[999998] grid place-items-center bg-black/30 p-4" role="alert">
          <p className="max-w-md rounded-lg bg-white p-5 text-sm text-red-700 shadow-xl">
            No se pudo cargar el formulario de seQura. Elige otro medio de pago o inténtalo de nuevo.
          </p>
        </div>
      )}
      <div ref={containerRef} className="contents" />
    </>
  );
}
