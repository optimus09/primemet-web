"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitScrapRequest } from "./actions";

type Material = { id: string; name: string; description: string | null; image_url?: string | null };

export default function ScrapForm({
  materials,
  enableSubscriptions = true,
}: {
  materials: Material[];
  enableSubscriptions?: boolean;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [plantLocation, setPlantLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubscription, setIsSubscription] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState("monthly");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleMaterial = (name: string, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[name] = next[name] ?? "";
      else delete next[name];
      return next;
    });
  };

  const setWeight = (name: string, weight: string) => {
    setSelected((prev) => ({ ...prev, [name]: weight }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const items = Object.entries(selected)
      .filter(([, weight]) => Number(weight) > 0)
      .map(([materialName, weight]) => ({ materialName, estimatedWeight: Number(weight) }));

    if (items.length === 0) {
      setError("Select at least one material and enter an estimated weight.");
      return;
    }

    startTransition(async () => {
      const result = await submitScrapRequest({
        items,
        plantLocation,
        preferredDate,
        notes,
        isSubscription,
        subscriptionFrequency: isSubscription ? subscriptionFrequency : null,
      });
      if (!result.success) {
        if (result.error?.includes("logged in")) {
          router.push(`/login?redirect=${encodeURIComponent("/sell-scrap")}`);
          return;
        }
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/orders?placed=1");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Select materials &amp; estimated weight</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {materials.map((material) => {
            const checked = material.name in selected;
            return (
              <div
                key={material.id}
                className={`glass-card flex items-center gap-3 overflow-hidden p-0 transition ${checked ? "border-teal-active" : ""}`}
              >
                {material.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={material.image_url}
                    alt={material.name}
                    className="h-16 w-16 shrink-0 object-cover"
                  />
                )}
                <input
                  type="checkbox"
                  id={material.id}
                  checked={checked}
                  onChange={(e) => toggleMaterial(material.name, e.target.checked)}
                  className="h-4 w-4 shrink-0 accent-emerald-highlight"
                />
                <label htmlFor={material.id} className="flex-1 text-sm text-foreground">
                  {material.name}
                </label>
                {checked && (
                  <input
                    type="number"
                    min={1}
                    placeholder="kg"
                    value={selected[material.name]}
                    onChange={(e) => setWeight(material.name, e.target.value)}
                    className="mr-4 w-20 rounded-md border border-card-border bg-surface px-2 py-1 text-sm text-foreground"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="plantLocation" className="block text-sm text-muted">Plant / pickup location</label>
          <input
            id="plantLocation"
            value={plantLocation}
            onChange={(e) => setPlantLocation(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="preferredDate" className="block text-sm text-muted">Preferred pickup date</label>
          <input
            id="preferredDate"
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
      </div>

      {enableSubscriptions && (
        <div className="glass-card p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={isSubscription}
              onChange={(e) => setIsSubscription(e.target.checked)}
              className="h-4 w-4 accent-emerald-highlight"
            />
            Set this up as a recurring pickup subscription
          </label>
          <p className="mt-1 text-xs text-muted">
            Regular volumes get preferred rates — we&apos;ll confirm pricing when we follow up.
          </p>
          {isSubscription && (
            <div className="mt-3">
              <label htmlFor="subscriptionFrequency" className="block text-sm text-muted">Pickup frequency</label>
              <select
                id="subscriptionFrequency"
                value={subscriptionFrequency}
                onChange={(e) => setSubscriptionFrequency(e.target.value)}
                className="mt-1 w-full max-w-xs rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
              >
                <option value="weekly">Weekly</option>
                <option value="twice_monthly">Twice a month</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm text-muted">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
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
        disabled={isPending}
        className="self-start rounded-md border border-gold bg-teal-active px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit scrap pickup request"}
      </button>
    </form>
  );
}
