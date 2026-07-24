<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TBS E-commerce — guía del proyecto

TBS (Traders Business School) está construyendo un e-commerce propio en Next.js para reemplazar WordPress + WooCommerce. Vende cursos de trading por links de venta directa: **flujo de un solo producto, sin carrito**. El dominio y el código están en **español** — respetalo.

## Stack

- **Next.js 16.2.7** (App Router, React Compiler activo) · **React 19** · **TypeScript strict**
- **Tailwind v4** (import en `src/app/globals.css`, sin `tailwind.config`; theme vía `@theme inline`)
- **Prisma v7** con driver adapter **`@prisma/adapter-mariadb`** sobre **MySQL/MariaDB**
- **zod** (validación) · **jose** (JWT de sesión) · **bcryptjs** (hash) · **@anthropic-ai/sdk** · **shiki**

## Convenciones que rompen con tu training data (CRÍTICO)

- **`middleware.ts` está deprecado → usá `src/proxy.ts`** con `export function proxy(request)`. Protege `/admin/*` salvo `/admin/login`.
- **Prisma v7 requiere adapter** — no hay constructor por URL plano. Patrón: `new PrismaClient({ adapter: new PrismaMariaDb({ ... }) })` (ver `src/lib/db.ts`).
- **Cliente Prisma generado en `src/generated/prisma/client`** — importá desde `/client`, no desde la carpeta. No hay `index.ts`.
- **Route groups**: `(public)` para la tienda, `admin/(auth)` para login (sin layout de admin), `admin/(panel)` para el panel autenticado.
- Ante cualquier duda de API de Next 16, **leé `node_modules/next/dist/docs/` antes de escribir**.

## Mapa del código

- `src/app/(public)/` — tienda: `[slug]` (páginas generadas), `products/[slug]`, `checkout/[productId]`, `orders/[number]`.
- `src/app/admin/(panel)/` — panel: `dashboard`, `products`, `categories`, `currencies`, `gateways`, `orders`, `pages`, `redirects`.
- `src/app/admin/api/` — `generate` (Figma→React), `upload`.
- `src/lib/` — `db.ts`, `auth/` (`session.ts`, `dal.ts`), `payments/` (registry + adapters), `catalog.ts`, `seo.ts`, `crypto.ts` (AES-256-GCM), `figma-clone.ts`, `page-files.ts`, `currency-resolver.ts`, `settings.ts`, `bunny.ts`.
- `src/components/` — `ui/`, `catalog/`, `seo/`. `src/app/admin/_components/` — chrome del panel.
- `prisma/schema.prisma` · migraciones en `prisma/migrations/` · seed en `prisma/seed.ts`.

## Pipeline Figma → página (distintivo del proyecto)

Las páginas de marketing se **clonan** desde Figma de forma **determinística** (no reconstrucción por LLM): `src/lib/figma-clone.ts` camina el árbol de nodos y emite un `.tsx` con posición absoluta + estilos inline; los assets van a `public/generated/<slug>/`. El código se escribe en `src/generated/pages/<slug>.tsx` (`src/lib/page-files.ts`) y el registro vive en el modelo `Page`. La ruta pública `(public)/[slug]/page.tsx` importa el módulo generado si la página está `PUBLISHED`.

## Pagos (registry, sin migración por proveedor)

Selección de gateway automática por moneda (`Currency.countryCodes`). Proveedores declarados en `src/lib/payments/providers.ts`; agregar uno = entrada nueva + adapter en `src/lib/payments/adapters/`, **sin migración**. `config` del gateway está **cifrado en reposo** (AES-256-GCM, `src/lib/crypto.ts`, clave derivada de `SESSION_SECRET`). Los campos secretos nunca se envían al cliente; blank-on-edit conserva el valor guardado. Manual/transferencia ya funciona de punta a punta.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` (eslint)
- `npx prisma migrate dev --name <nombre>` · `npm run db:seed`
- Conexión DB y `SESSION_SECRET` en `.env.local`.

## Agentes del proyecto

Este repo define tres subagentes en `.claude/agents/`:
- **`tbs-pm`** — descompone features, define criterios de aceptación, evalúa impacto. No escribe código de producción.
- **`tbs-designer`** — frontend/UI de la tienda pública, componentes, Tailwind y el pipeline Figma→React.
- **`tbs-dev`** — backend/full-stack: Prisma, server actions, API routes, auth, pagos, catálogo/pedidos.
