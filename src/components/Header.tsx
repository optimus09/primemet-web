"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import type { User } from "@supabase/supabase-js";

export default function Header({
  enableBulkPricing = true,
  enableAiFeatures = true,
}: {
  enableBulkPricing?: boolean;
  enableAiFeatures?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    const loadUser = async (currentUser: User | null) => {
      if (!active) return;
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();
      if (active) setIsAdmin(profile?.role === "admin");
    };

    supabase.auth.getUser().then(({ data }) => loadUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/catalog", label: "Order Spare Parts" },
    { href: "/sell-scrap", label: "Sell Your Scrap" },
    ...(enableBulkPricing ? [{ href: "/bulk-quote", label: "Bulk Pricing" }] : []),
    ...(enableAiFeatures ? [{ href: "/ai-quote", label: "AI Quote" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/primemet-mark.png" alt="" className="h-9 w-9" />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            PRIME<span className="text-emerald-highlight">MET</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/orders" className="text-sm text-muted transition hover:text-foreground">
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-emerald-highlight transition hover:text-teal-active">
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {!isAdmin && (
            <Link href="/cart" className="relative text-sm text-muted hover:text-foreground">
              Cart
              {count > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-teal-active text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <>
              <Link href="/account" className="text-sm text-muted hover:text-foreground">
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-card-border px-3 py-1.5 text-sm text-foreground transition hover:border-gold"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-gold bg-teal-active px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-deep"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-card-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!isAdmin && (
              <Link href="/cart" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                Cart ({count})
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-emerald-highlight" onClick={() => setMenuOpen(false)}>
                Admin Panel
              </Link>
            )}
            {user ? (
              <>
                <Link href="/orders" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                  My Orders
                </Link>
                <Link href="/account" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                  Account
                </Link>
                <button onClick={handleLogout} className="text-left text-sm text-foreground">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link href="/signup" className="text-sm text-foreground" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
