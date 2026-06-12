/**
 * Client-side analytics helper (replaces GTM4WP / Stape dataLayer pushes).
 * Pushes events to the GTM dataLayer. Safe to call before GTM loads — GTM
 * processes any pre-existing dataLayer entries on init.
 */
type DataLayerEvent = { event: string } & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushDataLayer(payload: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}
