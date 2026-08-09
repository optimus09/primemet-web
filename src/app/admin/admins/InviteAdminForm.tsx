"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inviteAdmin, cancelInvite } from "./actions";

export default function InviteAdminForm({ pendingInvites }: { pendingInvites: string[] }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await inviteAdmin(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEmail("");
      router.refresh();
    });
  };

  const handleCancel = (inviteEmail: string) => {
    startTransition(async () => {
      await cancelInvite(inviteEmail);
      router.refresh();
    });
  };

  return (
    <div className="glass-card mt-4 max-w-xl p-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label htmlFor="inviteEmail" className="block text-xs text-muted">
            Invite someone by email
          </label>
          <input
            id="inviteEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-gold bg-teal-active px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
        >
          Invite
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">
        When that email signs up at <span className="mono text-emerald-highlight">/signup</span>, they&apos;ll
        automatically become an admin — no extra step needed.
      </p>
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}

      {pendingInvites.length > 0 && (
        <div className="mt-4 border-t border-card-border pt-3">
          <div className="text-xs font-medium text-muted">Waiting to sign up:</div>
          <div className="mt-2 flex flex-col gap-1.5">
            {pendingInvites.map((invitedEmail) => (
              <div key={invitedEmail} className="flex items-center justify-between text-sm">
                <span className="mono text-foreground">{invitedEmail}</span>
                <button
                  onClick={() => handleCancel(invitedEmail)}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
