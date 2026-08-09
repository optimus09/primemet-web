"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setError("This reset link is invalid or has expired. Request a new one.");
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setStatus("saving");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    router.push("/login?redirect=%2F");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>

      {!ready && !error && <p className="mt-4 text-sm text-muted">Checking your reset link...</p>}

      {ready && (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="block text-sm text-muted">New password</label>
            <PasswordInput
              id="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-muted">Confirm password</label>
            <PasswordInput
              id="confirmPassword"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            disabled={status === "saving"}
            className="mt-2 rounded-md border border-gold bg-teal-active px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
          >
            {status === "saving" ? "Saving..." : "Update password"}
          </button>
        </form>
      )}

      {error && !ready && (
        <p className="mt-6 text-sm text-muted">
          <Link href="/forgot-password" className="text-emerald-highlight hover:underline">
            Request a new reset link
          </Link>
        </p>
      )}
    </div>
  );
}
