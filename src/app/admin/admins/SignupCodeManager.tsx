"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSignupCode, setSignupCodeActive } from "./actions";

type Code = { code: string; note: string | null; is_active: boolean };

function EmailCodeRow({ code }: { code: string }) {
  const [recipient, setRecipient] = useState("");
  const [open, setOpen] = useState(false);

  const mailtoHref = () => {
    const subject = encodeURIComponent("Your Primemet signup invite code");
    const body = encodeURIComponent(
      `Hi,\n\nUse this code to create your Primemet account: ${code}\n\nGo to https://primemet.in/signup and enter it when prompted.\n\nThanks,\nPrimemet`
    );
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-emerald-highlight hover:underline">
        Email this code
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="customer@example.com"
        className="w-40 rounded-md border border-card-border bg-surface px-2 py-1 text-xs text-foreground outline-none focus:border-teal-active"
      />
      <a
        href={recipient ? mailtoHref() : undefined}
        aria-disabled={!recipient}
        className={`text-xs ${recipient ? "text-emerald-highlight hover:underline" : "pointer-events-none text-muted"}`}
      >
        Open email draft
      </a>
    </div>
  );
}

export default function SignupCodeManager({ codes }: { codes: Code[] }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createSignupCode(note);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNote("");
      router.refresh();
    });
  };

  const handleToggle = (code: string, isActive: boolean) => {
    startTransition(async () => {
      await setSignupCodeActive(code, isActive);
      router.refresh();
    });
  };

  return (
    <div className="glass-card mt-4 max-w-xl p-4">
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label htmlFor="codeNote" className="block text-xs text-muted">
            Label (optional, e.g. &quot;Vadodara sales team&quot;)
          </label>
          <input
            id="codeNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-gold bg-teal-active px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
        >
          Generate code
        </button>
      </form>
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
      <p className="mt-2 text-xs text-muted">
        No email service is connected yet, so &quot;Email this code&quot; opens a pre-filled
        draft in your own email app to send manually.
      </p>

      {codes.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 border-t border-card-border pt-3">
          {codes.map((c) => (
            <div key={c.code} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <span className={`mono font-semibold ${c.is_active ? "text-foreground" : "text-muted line-through"}`}>
                  {c.code}
                </span>
                {c.note && <span className="ml-2 text-xs text-muted">{c.note}</span>}
              </div>
              <div className="flex items-center gap-3">
                {c.is_active && <EmailCodeRow code={c.code} />}
                <button
                  onClick={() => handleToggle(c.code, !c.is_active)}
                  disabled={isPending}
                  className={`text-xs ${c.is_active ? "text-red-700 hover:underline" : "text-emerald-highlight hover:underline"}`}
                >
                  {c.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {codes.length === 0 && <p className="mt-3 text-sm text-muted">No codes yet — generate one to hand out.</p>}
    </div>
  );
}
