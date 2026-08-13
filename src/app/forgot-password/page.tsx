"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
      <p className="mt-2 text-sm text-muted">
        Enter your account email and we&apos;ll send you a link to set a new password.
      </p>

      {status === "sent" ? (
        <div className="mt-6 rounded-md border border-emerald-highlight/40 bg-emerald-highlight/10 px-4 py-3 text-sm text-emerald-highlight">
          If an account exists for {email}, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm text-muted">Email</label>
            <input
              id="email"
              type="email"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-2 rounded-md border border-gold bg-teal-active px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted">
        <Link href="/login" className="text-emerald-highlight hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
