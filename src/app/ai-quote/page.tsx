import AiQuoteForm from "./AiQuoteForm";
import { getSiteSettings } from "@/lib/settings";

export default async function AiQuotePage() {
  const settings = await getSiteSettings();

  if (!settings.enable_ai_features) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">AI Quote is paused</h1>
        <p className="mt-3 text-muted">
          This feature isn&apos;t available right now. Please use the regular Bulk Pricing form,
          or reach out directly via the contact details in the footer.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="mono text-xs uppercase tracking-wider text-gold">AI-Assisted</span>
      <h1 className="mt-2 text-3xl font-bold text-foreground">Upload a Drawing or Estimate</h1>
      <p className="mt-3 text-muted">
        Have a drawing, BOM, spec sheet, or even a handwritten list? Upload it and we&apos;ll read
        it, match the parts against our catalog, and put together a quote request for you to
        review before submitting.
      </p>
      <AiQuoteForm />
    </div>
  );
}
