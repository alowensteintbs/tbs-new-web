"use client";

import { useEffect, useRef } from "react";

/**
 * SeQura identification form, embedded inline on our checkout page.
 *
 * The server fetches an HTML+JS snippet from SeQura's Order API and passes it
 * here verbatim. Setting `innerHTML` does NOT execute the snippet's `<script>`
 * tags (browsers never run scripts inserted that way), so we walk the injected
 * DOM and replace each `<script>` with a freshly created one — that re-execution
 * is what boots SeQura's widget, which then drives the flow and, on approval,
 * triggers the IPN to our webhook that confirms the order.
 */
export function SequraCheckout({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = html;

    // Re-create every script node so the browser actually executes it.
    const scripts = Array.from(container.querySelectorAll("script"));
    for (const old of scripts) {
      const script = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      script.textContent = old.textContent;
      old.replaceWith(script);
    }

    return () => {
      container.innerHTML = "";
    };
  }, [html]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div ref={containerRef} />
    </div>
  );
}
