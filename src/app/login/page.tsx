import Link from "next/link";
import { login } from "./actions";
import PasswordInput from "@/components/PasswordInput";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="relative hidden h-full min-h-[420px] overflow-hidden rounded-2xl lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/logistics.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />
        <div className="absolute bottom-0 left-0 p-6">
          <p className="text-lg font-semibold text-white">Track your orders, one login away.</p>
          <p className="mt-1 text-sm text-white/70">Sell scrap, order spares, manage it all.</p>
        </div>
      </div>
      <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-foreground">Log in to your account</h1>
      <p className="mt-2 text-sm text-muted">
        Access your order history and submit new requests.
      </p>

      {params.error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </div>
      )}

      <form action={login} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label htmlFor="email" className="block text-sm text-muted">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm text-muted">Password</label>
            <Link href="/forgot-password" className="text-xs text-emerald-highlight hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            required
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-md border border-gold bg-teal-active px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-emerald-highlight hover:underline">
          Sign up
        </Link>
      </p>
      </div>
    </div>
  );
}
