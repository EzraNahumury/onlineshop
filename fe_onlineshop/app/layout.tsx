import type { Metadata } from "next";
import { Manrope, Bricolage_Grotesque, Barlow_Condensed, Space_Mono } from "next/font/google";
import "./globals.css";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Toaster } from "@/components/ui/toast";
import { ensureMigrated } from "@/lib/migrate";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const athletic = Barlow_Condensed({
  variable: "--font-athletic",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
});

const monoRetro = Space_Mono({
  variable: "--font-mono-retro",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Ayres Modern Essentials",
    template: "%s | Ayres Modern Essentials",
  },
  description:
    "Modern essentials crafted with intention. Quality materials, timeless design.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auto-apply pending DB migrations on first use after a (re)deploy.
  // Wrapped so a DB hiccup (or a build with no DB) never breaks rendering.
  try {
    await ensureMigrated();
  } catch (err) {
    console.error("[migrate] failed:", err);
  }

  return (
    <html
      lang="id"
      className={`${sans.variable} ${display.variable} ${athletic.variable} ${monoRetro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <ConfirmDialog />
        <Toaster />
      </body>
    </html>
  );
}
