"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Search, Heart, User, ShoppingCart, Lock } from "lucide-react";
import { selectCartCount } from "@/app/store/slices/cartSlice";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Special Offers", href: "/special-offers" },
];

export default function Header({ variant }) {
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useSelector(selectCartCount);
  const [query, setQuery] = useState("");

  // Auto-switch to the secure-checkout variant on /checkout routes, since
  // the (customer) layout renders one shared Header for every page in the group.
  const resolvedVariant =
    variant ?? (pathname?.startsWith("/checkout") ? "checkout" : "default");

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  }

  if (resolvedVariant === "checkout") {
    // Checkout suppresses nav + actions and shows a secure-checkout badge instead.
    return (
      <header className="bg-[var(--color-brand-bg)] border-b border-[var(--color-brand-border)] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] w-full">
        <div className="flex items-center justify-between max-w-[1280px] mx-auto px-[48px] py-[16px]">
          <Link
            href="/"
            className="font-[var(--font-family-serif)] font-bold text-[40px] leading-[48px] text-[var(--color-brand-text)]"
          >
            Shop Zone
          </Link>
          <div className="flex gap-[8px] items-center text-[var(--color-brand-text)]">
            <Lock size={16} strokeWidth={1.5} />
            <span className="font-[var(--font-family-nav)] font-semibold text-[14px] tracking-[0.7px]">
              Secure Checkout
            </span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[var(--color-brand-bg)] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] w-full">
      <div className="flex items-center justify-between max-w-[1280px] mx-auto px-[48px] py-[16px]">
        {/* Brand logo */}
        <Link
          href="/"
          className="font-[var(--font-family-serif)] font-medium text-[32px] leading-[38.4px] text-[var(--color-brand-text)]"
        >
          Shop Zone
        </Link>

        {/* Nav links */}
        <nav className="flex gap-[24px] items-center">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "font-[var(--font-family-nav)] text-[14px] tracking-[0.7px] pb-[2px]",
                  "border-b-2 transition-colors duration-150",
                  "hover:text-[var(--color-brand-accent)]",
                  isActive
                    ? "font-bold text-[var(--color-brand-text)] border-[var(--color-brand-accent)]"
                    : "font-semibold text-[var(--color-brand-text-muted)] border-transparent",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions: search, favorites, profile, cart */}
        <div className="flex gap-[16px] items-center">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="bg-white border border-[var(--color-brand-border)] rounded-full text-[16px] text-[var(--color-brand-text-muted)] font-[var(--font-family-nav)] pl-[17px] pr-[41px] py-[11px] w-[220px] focus:outline-none focus:border-[var(--color-brand-accent)]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[var(--color-brand-text-muted)]"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </form>

          <Link
            href="/favorites"
            aria-label="Favorites"
            className="text-[var(--color-brand-text)] hover:opacity-70"
          >
            <Heart size={20} strokeWidth={1.5} />
          </Link>

          <Link
            href="/dashboard/profile"
            aria-label="Profile"
            className="text-[var(--color-brand-text)] hover:opacity-70"
          >
            <User size={16} strokeWidth={1.5} />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-[var(--color-brand-text)] hover:opacity-70"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-brand-accent)] text-white text-[10px] leading-none rounded-full size-[16px] flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
