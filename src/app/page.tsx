import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";

const tickerItems = [
  "MS TURNINGS: 42 MT LIFTED TODAY",
  "HMS 1 & 2: DISPATCHED TO RENEWAL MILL",
  "ALUMINIUM SCRAP: LOT GRADED [READY]",
  "COPPER ARMATURE: WEIGHBRIDGE CLEARED",
  "SS 304 OFFCUTS: PICKUP SCHEDULED",
  "WELDING RODS & SPARES: SAME-WEEK DISPATCH",
];

const services = [
  {
    title: "Scrap Procurement",
    description:
      "We buy metal wastage directly from manufacturing facilities — graded, weighed and lifted on a schedule that suits your production cycle.",
    points: ["Plant-side grading & weighment", "Scheduled lot pickups", "Transparent rate contracts"],
    icon: (
      <path d="M8 30 L8 16 L20 16 L20 30 M20 20 L30 20 L36 26 L36 30 M8 30 L36 30 M13 34 a3 3 0 1 0 0.1 0 M31 34 a3 3 0 1 0 0.1 0" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Mill & Foundry Supply",
    description:
      "Consistent, segregated feedstock delivered to renewal mills and foundries with documentation and dispatch tracking end to end.",
    points: ["Segregated ferrous & non-ferrous", "Weighbridge-verified dispatch", "Pan-India transport lanes"],
    icon: (
      <path d="M8 34 L8 18 L16 12 L24 18 L24 34 M32 34 L32 22 L40 22 L40 34 M4 34 L44 34 M16 34 L16 24 M32 34 L32 28" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Consumables & Spares",
    description:
      "Welding rods, industrial hardware and machine spares supplied to keep maintenance schedules and production lines running.",
    points: ["Welding rods & electrodes", "Industrial hardware & fasteners", "Machine spares on demand"],
    icon: (
      <path d="M14 14 L22 22 M26 10 L38 22 L34 26 L22 14 Z M18 18 L10 26 Q8 30 12 34 Q16 38 20 34 L22 32" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

const materials = [
  {
    name: "MS Turnings",
    color: "#0d6e5e",
    icon: <path d="M14 34 Q14 24 24 24 Q34 24 34 14 M34 14 L28 14 M34 14 L34 20" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    name: "HMS 1 & 2",
    color: "#0f3d5c",
    icon: <><rect x="12" y="18" width="12" height="12" rx="1.5" /><rect x="26" y="12" width="12" height="12" rx="1.5" /><rect x="20" y="26" width="12" height="12" rx="1.5" /></>,
  },
  {
    name: "Aluminium",
    color: "#15803d",
    icon: <rect x="10" y="18" width="28" height="12" rx="3" strokeLinejoin="round" />,
  },
  {
    name: "Copper",
    color: "#7c6a1f",
    icon: <path d="M12 24 Q18 14 24 24 Q30 34 36 24" strokeLinecap="round" />,
  },
  {
    name: "SS 304 / 316",
    color: "#0d6e5e",
    icon: <><rect x="10" y="14" width="24" height="6" rx="1" /><rect x="10" y="21" width="24" height="6" rx="1" /><rect x="10" y="28" width="24" height="6" rx="1" /></>,
  },
  {
    name: "Brass & Alloys",
    color: "#0f3d5c",
    icon: <><circle cx="24" cy="24" r="10" /><circle cx="24" cy="24" r="3.5" /><path d="M24 10 L24 14 M24 34 L24 38 M10 24 L14 24 M34 24 L38 24" strokeLinecap="round" /></>,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Submit a request",
    description: "Tell us what scrap you have or which spares you need, right from the website.",
  },
  {
    step: "02",
    title: "We grade & quote",
    description: "Our team reviews it, confirms material grade or stock, and follows up with pricing.",
  },
  {
    step: "03",
    title: "Pickup or dispatch",
    description: "Scrap is lifted from your plant, or your spares order is packed and shipped.",
  },
  {
    step: "04",
    title: "Settle & repeat",
    description: "Payment or invoice settled, documentation shared — ready for the next cycle.",
  },
];

export default async function Home() {
  const settings = await getSiteSettings();
  const supabase = await createClient();
  const { data: rawStats } = await supabase.from("homepage_stats").select("*").order("sort_order");
  const stats = (rawStats ?? []).filter((s) => s.stat_value?.trim() && s.stat_label?.trim());
  return (
    <div>
      <section className="relative overflow-hidden border-b border-card-border">
        <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_800px_500px_at_70%_0%,black,transparent)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(700px circle at 85% 10%, rgba(21,128,61,0.10), transparent 60%), radial-gradient(500px circle at 0% 100%, rgba(15,61,92,0.08), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-highlight/40 bg-emerald-highlight/10 px-3 py-1 text-xs font-medium text-emerald-highlight">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-highlight" />
              INDIA · B2B SCRAP LOGISTICS &amp; INDUSTRIAL SUPPLY
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              Powering India&apos;s Industrial Supply Chain
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              We buy metal wastage from manufacturing plants, supply graded scrap to renewal
              mills and foundries, and keep your shop floor stocked with welding rods, hardware
              and machine spares.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/sell-scrap"
                className="rounded-md border border-gold bg-teal-active px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep"
              >
                Sell Your Industrial Scrap
              </Link>
              <Link
                href="/catalog"
                className="rounded-md border border-charcoal px-6 py-3 text-sm font-semibold text-foreground transition hover:border-emerald-highlight"
              >
                Order Spare Parts &amp; Consumables
              </Link>
            </div>
            {settings.enable_bulk_pricing && (
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
                <Link href="/bulk-quote" className="mono underline decoration-dotted underline-offset-4 hover:text-emerald-highlight">
                  Buying in bulk? Request a custom price →
                </Link>
              </div>
            )}
            {settings.show_stats && stats && stats.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-8 border-t border-card-border pt-6 lg:hidden">
                {stats.map((stat) => (
                  <div key={stat.id}>
                    <div className="font-heading mono text-2xl font-bold text-gold">{stat.stat_value}</div>
                    <div className="mt-1 text-xs text-muted">{stat.stat_label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
            {(() => {
              const showStats = settings.show_stats && stats && stats.length > 0;
              const centerStat = showStats ? stats[0] : null;
              const orbitStats = showStats ? stats.slice(1, 5) : [];
              const orbitRadius = 155;
              const orbitItems = orbitStats.map((stat, i) => {
                const angleDeg = -90 + i * (360 / orbitStats.length);
                const angleRad = (angleDeg * Math.PI) / 180;
                return {
                  stat,
                  x: 200 + orbitRadius * Math.cos(angleRad),
                  y: 200 + orbitRadius * Math.sin(angleRad),
                };
              });

              return (
                <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
                  <circle cx="200" cy="200" r="170" fill="none" stroke="var(--card-border)" strokeWidth="1.5" />
                  <g className="spin-slow-reverse">
                    <circle cx="200" cy="200" r="130" fill="none" stroke="var(--card-border)" strokeWidth="1.5" strokeDasharray="4 6" />
                  </g>

                  {orbitItems.length > 0 ? (
                    <g className="orbit">
                      {orbitItems.map(({ stat, x, y }) => (
                        <g key={stat.id} className="orbit-counter" style={{ transformOrigin: `${x}px ${y}px` }}>
                          <foreignObject x={x - 58} y={y - 30} width="116" height="60">
                            <div className="glass-card flex h-full flex-col items-center justify-center px-2 text-center">
                              <div className="font-heading mono text-lg font-bold leading-tight text-gold">
                                {stat.stat_value}
                              </div>
                              <div className="mt-0.5 text-[10px] leading-tight text-muted">{stat.stat_label}</div>
                            </div>
                          </foreignObject>
                        </g>
                      ))}
                    </g>
                  ) : (
                    <g className="spin-slow" stroke="var(--teal-active)" strokeWidth="3" strokeLinecap="round" opacity="0.5">
                      <line x1="200" y1="38" x2="200" y2="22" />
                      <line x1="200" y1="362" x2="200" y2="378" />
                      <line x1="38" y1="200" x2="22" y2="200" />
                      <line x1="362" y1="200" x2="378" y2="200" />
                    </g>
                  )}

                  <foreignObject x="120" y="150" width="160" height="100">
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      {centerStat ? (
                        <>
                          <span className="mono inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-muted">
                            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-highlight" />
                            Live snapshot
                          </span>
                          <div className="mt-2 font-heading mono text-3xl font-bold leading-tight text-gold">
                            {centerStat.stat_value}
                          </div>
                          <div className="mt-1 text-xs text-muted">{centerStat.stat_label}</div>
                        </>
                      ) : (
                        <span className="h-3 w-3 rounded-full bg-emerald-highlight" />
                      )}
                    </div>
                  </foreignObject>
                </svg>
              );
            })()}
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-card-border bg-surface py-3">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="mono text-xs text-emerald-highlight">
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Three services, one industrial supply chain
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          From lifting scrap off your shop floor to putting spares back on it — Primemet
          closes the loop.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group glass-card relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-teal-active hover:shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-teal-active via-emerald-highlight to-gold transition-transform duration-300 group-hover:scale-x-100" />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-active/10 transition group-hover:bg-teal-active/20">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--teal-active)" strokeWidth="2" className="h-7 w-7">
                  {service.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{service.title}</h3>
              <p className="mt-3 text-sm text-muted">{service.description}</p>
              <ul className="mt-4 space-y-1.5">
                {service.points.map((point) => (
                  <li key={point} className="mono flex items-start gap-2 text-xs text-emerald-highlight">
                    <span className="text-sm leading-none" aria-hidden="true">✦</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">On the ground, every day</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Scrap lifted, spares supplied, lots dispatched — this is the work behind the numbers.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 md:grid-rows-2">
          <div className="group relative h-52 overflow-hidden rounded-xl md:row-span-2 md:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/scrap-metal.jpg"
              alt="Crane grab lifting baled metal scrap"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="mono text-[10px] uppercase tracking-widest text-white/70">Scrap Procurement</span>
              <p className="mt-1 text-lg font-semibold text-white">Graded, weighed, lifted on schedule</p>
            </div>
          </div>
          <div className="group relative h-40 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/welding.jpg"
              alt="Welding sparks on a steel structure"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="mono text-[10px] uppercase tracking-widest text-white/70">Consumables</span>
              <p className="mt-1 text-lg font-semibold text-white">Welding rods that keep lines running</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative h-40 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/spares.jpg"
                alt="Spanners and machine spares arranged in a circle"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-sm font-semibold text-white">Machine spares</p>
              </div>
            </div>
            <div className="group relative h-40 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/logistics.jpg"
                alt="Aerial view of a cargo port"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-sm font-semibold text-white">Pan-India logistics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(settings.enable_bulk_pricing || settings.enable_subscriptions) && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {settings.enable_bulk_pricing && (
              <div className="glass-card overflow-hidden p-8">
                <span className="mono text-xs uppercase tracking-wider text-gold">Buying in volume?</span>
                <h3 className="mt-2 text-xl font-bold text-foreground">Get a custom bulk price</h3>
                <p className="mt-3 text-sm text-muted">
                  Ordering spares or consumables at scale? Tell us what you need and how much —
                  we&apos;ll work out a special rate for your business.
                </p>
                <Link
                  href="/bulk-quote"
                  className="mt-5 inline-block rounded-md border border-gold bg-teal-active px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep"
                >
                  Request Bulk Pricing
                </Link>
              </div>
            )}
            {settings.enable_subscriptions && (
              <div className="glass-card overflow-hidden p-8">
                <span className="mono text-xs uppercase tracking-wider text-gold">Recurring scrap volumes?</span>
                <h3 className="mt-2 text-xl font-bold text-foreground">Set up a pickup subscription</h3>
                <p className="mt-3 text-sm text-muted">
                  Weekly, twice-monthly or monthly scrap pickups on a fixed schedule — with
                  preferred rates for committed volume.
                </p>
                <Link
                  href="/sell-scrap"
                  className="mt-5 inline-block rounded-md border border-charcoal px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-emerald-highlight"
                >
                  Set Up a Subscription
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Materials we buy, grade and supply
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Six core scrap streams, graded and handled to spec before they leave your plant.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {materials.map((material) => (
            <div
              key={material.name}
              className="group glass-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="flex aspect-square items-center justify-center transition group-hover:scale-105"
                style={{
                  background: `linear-gradient(155deg, ${material.color}22, ${material.color}0a)`,
                }}
              >
                <svg viewBox="0 0 48 48" fill="none" stroke={material.color} strokeWidth="2" className="h-14 w-14">
                  {material.icon}
                </svg>
              </div>
              <div className="p-3 text-center">
                <span className="mono text-xs font-medium text-foreground">{material.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-card-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">How it works</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Four steps from your shop floor back to your shop floor.
          </p>
          <div className="relative mt-12 grid gap-8 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-card-border to-transparent md:block" />
            {processSteps.map((item) => (
              <div key={item.step} className="relative">
                <div className="font-heading mono relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-teal-active bg-background text-sm font-bold text-teal-active">
                  {item.step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-card-border">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Create your account to request a scrap pickup or order spares — track every
            request from submission to dispatch.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-md border border-gold bg-teal-active px-8 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
