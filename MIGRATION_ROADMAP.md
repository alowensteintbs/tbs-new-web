# Migración WordPress/WooCommerce → Next.js 16 — Roadmap

## Context

TBS migra su tienda WordPress + WooCommerce (~45 plugins) a **Next.js 16** (full migration: catálogo,
carrito, checkout, pagos, pedidos y post-compra nativos — WooCommerce desaparece), conservando un
**panel de administración** para que el equipo actual siga operando la web.

**Decisiones de alcance (confirmadas):**
- Full migration. WooCommerce se elimina al final.
- **Dolor principal = performance/SEO de las landings** → las páginas públicas + SEO van primero.
- Marketing/tracking esencial (GTM, SEO, redirects) entra temprano.
- Integraciones custom (TBS Academy v2, LearnWorlds, Stripe multi-cuenta): hay código PHP propio
  que se portará al llegar a esa fase.
- **DB limpia**: no se migran productos/pedidos/clientes históricos.

**Ya construido (no rehacer):** Next.js 16.2.7 + React 19 + Prisma 7.8 (`@prisma/adapter-mariadb`) +
Tailwind v4 + Zod 4 + jose (JWT) + bcryptjs. Auth JWT propio (`src/lib/auth`, `src/proxy.ts`). Panel
con CRUD de Productos, Monedas y Maquetador Figma→IA. Helper `cn()` en `src/lib/utils.ts`.

> AGENTS.md: esta versión de Next.js tiene breaking changes. Antes de codear cada fase, leer la guía
> relevante en `node_modules/next/dist/docs/`.

---

## Mapeo plugins → solución Next.js (resumen)

- **Ya resueltos**: Elementor/ACF/Duplicate/Folders → Maquetador Figma→IA. WP Rocket / Asset CleanUp /
  Image Optimizer / Local Fonts → nativo (next/image, next/font, RSC, caching).
- **Fase 1**: Rank Math → Metadata + sitemap + JSON-LD nativos. Redirection → `Redirect` model. GTM4WP/
  Stape → `@next/third-parties`. Geolocation IP → `proxy.ts`.
- **Fases siguientes** (catálogo, carrito, pagos, post-compra, CRM, operativa): ver "Fases futuras" abajo.

---

## ALCANCE ACTUAL: Fase 0 + Fase 1

### FASE 0 — Fundaciones

**0.1 — `src/lib/env.ts`** (validación de env con Zod)
- Validar al boot: `SESSION_SECRET`, `DATABASE_URL`, `FIGMA_TOKEN`, `ANTHROPIC_API_KEY`, y nuevos
  (`NEXT_PUBLIC_GTM_ID` opcional). Exportar objeto `env` tipado. Reutilizar en `proxy.ts` y `db.ts`.

**0.2 — Modelo `SiteSetting`** (config editable key/value) en `prisma/schema.prisma`
```prisma
model SiteSetting {
  key       String   @id          // p.ej. "gtm_id", "default_currency"
  value     String   @db.Text
  updatedAt DateTime @updatedAt
}
```
- Helper `src/lib/settings.ts`: `getSetting(key)` / `getSettings()` cacheados con `React.cache`.

**0.3 — UI pública reutilizable** en `src/components/ui/` (Button, Input, Container) con Tailwind v4,
usando `cn()` de `src/lib/utils.ts`. (Los `_components` del admin se quedan donde están.)

### FASE 1 — Páginas públicas, SEO, performance y tracking

**1.1 — Campos SEO en `Page`** (`prisma/schema.prisma`)
```
metaTitle, metaDescription, ogImage, canonical  (String?)
noindex Boolean @default(false)
```
- Extender `page-form.tsx` y las server actions de `pages/actions.ts` (validación Zod) con estos campos.

**1.2 — `generateMetadata` en páginas públicas** — `src/app/(public)/[slug]/page.tsx`
- Añadir `export async function generateMetadata({ params })` que lee la `Page` y devuelve
  `Metadata` (title/description/openGraph/alternates.canonical/robots). Helper en `src/lib/seo.ts`.
- Reemplazar la metadata placeholder de `src/app/layout.tsx` (hoy "Create Next App") por defaults reales.

**1.3 — Sitemap + robots** (reemplazo Rank Math)
- `src/app/sitemap.ts`: lista las `Page` con `status: PUBLISHED` (excluye `noindex`).
- `src/app/robots.ts`: reglas base + referencia al sitemap.

**1.4 — JSON-LD / structured data** (reemplazo Rank Math schema)
- `src/components/seo/json-ld.tsx`: componente que inyecta `<script type="application/ld+json">`
  (Organization en layout; ampliable a Product/Breadcrumb en fases futuras).

**1.5 — Redirects** (reemplazo Redirection)
- Modelo `Redirect { id, from @unique, to, statusCode Int @default(301), enabled Boolean }`.
- Aplicar en `proxy.ts`: al entrar una request, buscar match de `from` y redirigir.
- Admin: módulo CRUD `src/app/admin/(panel)/redirects/` siguiendo el patrón de `currencies/`
  (page.tsx server component + actions.ts con Zod + _components/redirect-table.tsx).

**1.6 — GTM / tracking** (reemplazo GTM4WP / Stape)
- Instalar `@next/third-parties`. Añadir `<GoogleTagManager gtmId={...}>` en `src/app/(public)` layout,
  con el ID desde `SiteSetting` (fallback `NEXT_PUBLIC_GTM_ID`).
- `src/lib/analytics.ts`: helper `pushDataLayer(event)` para eventos (base para e-commerce events).

**1.7 — Geolocalización** (reemplazo Geolocation IP)
- En `proxy.ts`: leer país (header de geo de la plataforma de hosting, o servicio) y setear cookie
  `tbs_country`. Base para preseleccionar moneda en Fase 2.
- **Ampliar el `matcher` de `proxy.ts`**: hoy es solo `["/admin/:path*"]`. Para redirects + geo en el
  sitio público, ampliar a un matcher que cubra rutas públicas excluyendo assets/_next. Mantener la
  lógica de auth limitada a `/admin`.

---

## Archivos a crear / modificar (Fase 0 + 1)

**Crear:** `src/lib/env.ts`, `src/lib/settings.ts`, `src/lib/seo.ts`, `src/lib/analytics.ts`,
`src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/ui/*`, `src/components/seo/json-ld.tsx`,
`src/app/admin/(panel)/redirects/` (page.tsx, actions.ts, new/, [id]/, _components/redirect-table.tsx),
`src/app/(public)/layout.tsx` (para GTM + JSON-LD si no existe).

**Modificar:** `prisma/schema.prisma` (SiteSetting, Page SEO, Redirect), `src/proxy.ts` (matcher + geo +
redirects), `src/app/(public)/[slug]/page.tsx` (generateMetadata), `src/app/layout.tsx` (metadata real),
`src/app/admin/(panel)/pages/_components/page-form.tsx` + `pages/actions.ts` (campos SEO),
`src/app/admin/_components/sidebar.tsx` (link a Redirects), `package.json` (`@next/third-parties`).

**Reutilizar:** `cn()` (`src/lib/utils.ts`), patrón de `currencies/` para el CRUD de redirects,
`db` singleton (`src/lib/db.ts`), helpers de paginación (`src/lib/pagination.ts`).

---

## Verificación (Fase 0 + 1)
- Leer guías Next 16 en `node_modules/next/dist/docs/` (metadata, sitemap, middleware/proxy) antes de codear.
- `prisma migrate dev` contra la DB local para SiteSetting / Page SEO / Redirect.
- `npm run dev` y validar:
  - `/sitemap.xml` y `/robots.txt` responden y listan páginas publicadas.
  - Una página pública muestra `<title>`/OG/canonical correctos (devtools → head).
  - JSON-LD válido (Rich Results Test).
  - Un redirect creado en el admin redirige (301) en el front.
  - GTM carga (Tag Assistant) con el ID desde SiteSetting.
  - Cookie `tbs_country` se setea según geo.
- Seguir el patrón existente: Server Components, Server Actions con Zod, `revalidatePath`.

---

## Fases futuras (fuera del alcance actual — referencia)
- **Fase 2** — Catálogo: Category, ProductImage, slug/sku, detalle de producto, moneda por geo.
- **Fase 3** — Carrito + Checkout (sin página de carrito; embudos/upsells estilo CartFlows/FunnelKit).
- **Fase 4** — Pagos: Stripe (multi-cuenta custom) → PayPal → seQura → Aplazame; webhooks.
- **Fase 5** — Post-compra: TBS Academy + LearnWorlds (portar PHP propio) + emails (FunnelKit Automations).
- **Fase 6** — CRM/Forms: HubSpot vía API; Dynamic Multistep Forms.
- **Fase 7** — Operativa: usuarios del panel, 2FA, audit log (WP Activity Log), reportes reales.
