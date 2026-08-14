import Link from "next/link";
import { signup } from "./actions";
import { getSiteSettings } from "@/lib/settings";
import PasswordInput from "@/components/PasswordInput";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/";
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="relative hidden h-full min-h-[420px] overflow-hidden rounded-2xl lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/scrap-metal.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />
        <div className="absolute bottom-0 left-0 p-6">
          <p className="text-lg font-semibold text-white">Join Primemet</p>
          <p className="mt-1 text-sm text-white/70">Scrap procurement and spares supply, in one account.</p>
        </div>
      </div>
      <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-muted">
        Sign up to order spares or request a scrap pickup.
      </p>

      {params.error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </div>
      )}

      <form action={signup} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        {settings.require_signup_code && (
          <div>
            <label htmlFor="inviteCode" className="block text-sm text-muted">Invite code</label>
            <input
              id="inviteCode"
              name="inviteCode"
              required
              placeholder="Provided by Primemet"
              className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
            />
          </div>
        )}
        <div>
          <label htmlFor="companyName" className="block text-sm text-muted">Company name</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="contactName" className="block text-sm text-muted">Contact person</label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm text-muted">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
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
          <label htmlFor="password" className="block text-sm text-muted">Password</label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-md border border-gold bg-teal-active px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep"
        >
          Sign up
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-emerald-highlight hover:underline">
          Log in
        </Link>
      </p>
      </div>
    </div>
  );
}
