"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  links: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Return Center", href: "/returns" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--color-brand-bg-dark)] text-[var(--color-brand-text-footer)] w-full">
      <div className="max-w-[1280px] mx-auto px-[48px] py-[56px] grid grid-cols-1 md:grid-cols-12 gap-[32px] md:gap-[48px]">
        {/* Brand & Description Column */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-[24px]">
          <div className="space-y-[12px]">
            <Link
              href="/"
              className="font-[var(--font-family-serif)] font-bold text-[32px] leading-[38.4px] text-[var(--color-brand-accent-gold)] inline-block"
            >
              Shop Zone
            </Link>
            <p className="font-[var(--font-family-nav)] text-[14px] leading-[22px] max-w-[340px]">
              Curated essentials for the modern home. Elegance in every detail.
            </p>
          </div>
          <p className="font-[var(--font-family-nav)] text-[13px] leading-[18px] text-[var(--color-brand-accent-gold)]">
            © 2024 Shop Zone. All rights reserved. Premium Quality Goods.
          </p>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 flex flex-col space-y-[12px]">
          <h3 className="font-[var(--font-family-serif)] font-bold text-[18px] leading-[24px] text-[var(--color-brand-accent-gold)]">
            Links
          </h3>
          <ul className="flex flex-col space-y-[10px]">
            {FOOTER_LINKS.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-[var(--font-family-nav)] text-[14px] text-[var(--color-brand-text-footer)] hover:text-[var(--color-brand-accent-gold)] transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Column */}
        <div className="md:col-span-3 flex flex-col space-y-[12px]">
          <h3 className="font-[var(--font-family-serif)] font-bold text-[18px] leading-[24px] text-[var(--color-brand-accent-gold)]">
            Legal
          </h3>
          <ul className="flex flex-col space-y-[10px]">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-[var(--font-family-nav)] text-[14px] text-[var(--color-brand-text-footer)] hover:text-[var(--color-brand-accent-gold)] transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
