"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Globe } from "lucide-react";
import { useT, type DictKey } from "@/lib/i18n";

const footerLinks: {
  shop: { key: DictKey; href: string }[];
  help: { key: DictKey; href: string }[];
  company: { key: DictKey; href: string }[];
} = {
  shop: [
    { key: "nav.tshirt", href: "/collections/t-shirt" },
    { key: "nav.poloShirt", href: "/collections/polo-shirt" },
    { key: "nav.jersey", href: "/collections/jersey" },
    { key: "nav.jacket", href: "/collections/jacket" },
    { key: "nav.shorts", href: "/collections/shorts" },
    { key: "nav.cap", href: "/collections/cap" },
  ],
  help: [
    { key: "footer.contactUs", href: "/contact" },
    { key: "footer.shippingReturns", href: "/shipping-returns" },
    { key: "footer.sizeGuide", href: "/size-guide" },
    { key: "footer.faq", href: "/faq" },
  ],
  company: [
    { key: "footer.aboutUs", href: "/about" },
    { key: "footer.privacy", href: "/privacy" },
    { key: "footer.terms", href: "/terms" },
  ],
};

export function Footer() {
  const { t } = useT();
  return (
    <footer className="bg-black text-white">
      {/* Newsletter */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-sm tracking-[0.3em] uppercase text-neutral-400 mb-3">
              {t("footer.newsletter")}
            </h3>
            <p className="text-2xl font-light mb-8">{t("footer.newsletterTitle")}</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="flex-1 h-12 px-5 bg-transparent border border-neutral-700 rounded-full text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-8 bg-white text-black rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors active:scale-[0.98]"
              >
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 relative md:-mt-6">
            <div
              aria-hidden
              className="absolute -top-4 -left-4 w-40 h-40 rounded-full bg-gradient-to-br from-red-600/15 to-transparent blur-2xl pointer-events-none"
            />
            <Image
              src="/logo/ayres-logo.png"
              alt="AYRES"
              width={360}
              height={96}
              className="h-20 w-auto relative"
            />

            <div className="relative mb-8 -mt-3">
              <h3 className="font-display text-3xl sm:text-[2rem] font-bold leading-[1.05] tracking-tight">
                <span className="block text-white">DEADLINE</span>
                <span className="block bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent">
                  AMAN.
                </span>
                <span className="block text-white mt-2">POLA AYRES</span>
                <span className="block text-white/90">BEDA KELAS.</span>
              </h3>
              <div className="mt-4 h-px w-16 bg-gradient-to-r from-red-600/70 to-transparent" />
            </div>

            <div className="flex items-center gap-2">
              <SocialIcon href="https://www.instagram.com/ayresapparel/?hl=en" label="Instagram">
                <InstagramIcon />
              </SocialIcon>
              <SocialIcon href="https://www.tiktok.com/@ayres_apparel" label="TikTok">
                <TiktokIcon />
              </SocialIcon>
              <SocialIcon href="https://ayreslab.id/" label="Website">
                <Globe className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon
                href="https://mail.google.com/mail/?view=cm&fs=1&to=admin@ayresapparel.com"
                label="Email"
              >
                <Mail className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
              {t("footer.shop")}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.shop.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
              {t("footer.help")}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.help.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
              {t("footer.company")}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-neutral-500 text-center">
            &copy; {new Date().getFullYear()} AYRES. {t("footer.allRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isExternalWebLink = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternalWebLink ? "_blank" : undefined}
      rel={isExternalWebLink ? "noreferrer" : undefined}
      aria-label={label}
      className="group relative w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-black hover:bg-white hover:border-white transition-all duration-200 active:scale-95"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}
