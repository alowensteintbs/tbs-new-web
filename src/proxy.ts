import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tbs_session";
const COUNTRY_COOKIE = "tbs_country";
const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin/dashboard";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

// --- Redirects cache (replaces the Redirection plugin) ---
// Prisma (native MariaDB adapter) can't run inside the proxy bundle, so we
// fetch the redirect table from an internal route handler instead. Proxy runs
// on every matched request, so we cache the result in memory and refresh it at
// most every REDIRECT_TTL_MS. Admin CRUD changes take effect within the TTL.
const REDIRECT_TTL_MS = 60_000;
let redirectCache: Map<string, { to: string; statusCode: number }> | null = null;
let redirectCacheAt = 0;

type RedirectRow = { from: string; to: string; statusCode: number };

async function getRedirects(request: NextRequest) {
  const now = Date.now();
  if (redirectCache && now - redirectCacheAt < REDIRECT_TTL_MS) {
    return redirectCache;
  }
  try {
    const res = await fetch(new URL("/api/redirects", request.url), {
      cache: "no-store",
    });
    const rows = (await res.json()) as RedirectRow[];
    redirectCache = new Map(
      rows.map((r) => [r.from, { to: r.to, statusCode: r.statusCode }])
    );
    redirectCacheAt = now;
  } catch {
    // On failure, fall back to the last known cache (or empty) and retry later.
    redirectCache = redirectCache ?? new Map();
  }
  return redirectCache;
}

/** Detect the visitor country from the hosting platform's geo header. */
function detectCountry(request: NextRequest): string | undefined {
  return (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country") ??
    undefined
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");

  // 1) Redirects (public + admin), checked before anything else.
  const redirects = await getRedirects(request);
  const match = redirects.get(pathname);
  if (match) {
    const dest = match.to.startsWith("http")
      ? match.to
      : new URL(match.to, request.url);
    return NextResponse.redirect(dest, match.statusCode);
  }

  // 2) Admin auth gate (unchanged behaviour).
  if (isAdmin) {
    const isLoginPage = pathname === LOGIN_PATH;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    let isAuthenticated = false;

    if (token) {
      try {
        await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
        isAuthenticated = true;
      } catch {
        isAuthenticated = false;
      }
    }

    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }
    if (!isAuthenticated && !isLoginPage) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3) Public requests: persist detected country in a cookie for currency/i18n.
  const response = NextResponse.next();
  const country = detectCountry(request);
  if (country && request.cookies.get(COUNTRY_COOKIE)?.value !== country) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  // Run on admin (auth) and all public routes (redirects + geo), excluding
  // API routes, static assets, image optimization and SEO metadata files.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
