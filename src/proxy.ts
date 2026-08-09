import { type NextRequest, type NextFetchEvent } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function logVisit(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    request.method !== "GET" ||
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next")
  ) {
    return Promise.resolve();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return Promise.resolve();

  return fetch(`${url}/rest/v1/site_visits`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ path }),
  }).catch(() => {});
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(logVisit(request));
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
