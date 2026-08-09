import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-card-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/primemet-mark.png" alt="" className="h-7 w-7" />
              <span className="font-heading text-lg font-bold text-foreground">
                PRIME<span className="text-emerald-highlight">MET</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              India&apos;s industrial scrap procurement and spare parts supply partner —
              closing the loop from shop-floor scrap to shop-floor spares.
            </p>
          </div>
          <div>
            <h3 className="mono text-xs uppercase tracking-wider text-gold">Services</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/sell-scrap" className="hover:text-foreground">Scrap Procurement</Link></li>
              <li><Link href="/catalog" className="hover:text-foreground">Consumables &amp; Spares</Link></li>
              <li><Link href="/catalog" className="hover:text-foreground">Mill &amp; Foundry Supply</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mono text-xs uppercase tracking-wider text-gold">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Pan-India logistics</li>
              <li>
                <a href="mailto:info@primemet.in" className="hover:text-foreground">Info@Primemet.in</a>
              </li>
              <li>
                <a href="https://www.primemet.in" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  www.primemet.in
                </a>
              </li>
              <li>
                <a
                  href="https://services.gst.gov.in/services/searchtp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-xs hover:text-foreground"
                  title="Opens the official GST portal to verify this GSTIN"
                >
                  GSTIN: 24ABJFP4844R1ZH ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-card-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Primemet. All rights reserved. ·{" "}
          <a
            href="https://services.gst.gov.in/services/searchtp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GSTIN 24ABJFP4844R1ZH
          </a>
        </div>
      </div>
    </footer>
  );
}
