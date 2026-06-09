"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const sections = [
  { id: "informasi-pengiriman", title: "Informasi Pengiriman" },
  { id: "pengembalian-penukaran", title: "Kebijakan Pengembalian & Penukaran" },
  { id: "kontak", title: "Hubungi Kami" },
];

const content: Record<string, React.ReactNode> = {
  "informasi-pengiriman": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500">
        Terakhir diperbarui: 23 April 2026
      </p>
      <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Waktu Pemenuhan Pesanan</h4>
        <p className="text-sm">
          Mohon tunggu 2–3 hari kerja untuk proses pemenuhan dan pengemasan pesanan Anda. Setelah itu, pesanan akan diserahkan kepada layanan pengiriman yang Anda pilih.
        </p>
      </div>
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Informasi Pengiriman</h4>
        <p className="text-sm">
          Kami akan berusaha semaksimal mungkin agar paket Anda sampai secepat mungkin. Waktu pengiriman bervariasi tergantung lokasi dan metode pengiriman yang Anda pilih.
        </p>
      </div>
      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
        <h4 className="font-medium text-black mb-3 flex items-center gap-2">
          <span className="text-amber-500">⚠️</span> Perhatian
        </h4>
        <p className="text-sm">
          Harap pastikan alamat pengiriman yang Anda berikan sudah benar dan lengkap. Kami tidak bertanggung jawab atas keterlambatan atau kehilangan paket yang disebabkan oleh alamat yang salah atau tidak lengkap.
        </p>
      </div>
    </div>
  ),
  "pengembalian-penukaran": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Syarat Pengembalian & Penukaran</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium shrink-0">1</span>
            <span>Barang harus dalam kondisi asli</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium shrink-0">2</span>
            <span>Belum dipakai</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium shrink-0">3</span>
            <span>Semua tag dan kemasan masih lengkap</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium shrink-0">4</span>
            <span>Bukti pembelian wajib disertakan</span>
          </li>
        </ul>
      </div>
      <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
        <h4 className="font-medium text-black mb-3">Barang yang Tidak Dapat Dikembalikan</h4>
        <ul className="space-y-2 text-sm">
          {[
            "Barang yang sudah dipakai atau dicuci",
            "Barang dengan tag yang sudah dilepas",
            "Barang yang dimodifikasi sesuai permintaan pelanggan",
            "Barangsale/diskon"
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
        <h4 className="font-medium text-black mb-3">Proses Pengembalian</h4>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium shrink-0">1</span>
            <span>Hubungi kami melalui email untuk mengajukan pengembalian</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium shrink-0">2</span>
            <span>Lampirkan bukti pembelian dan foto barang</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium shrink-0">3</span>
            <span>Tunggu persetujuan dari tim kami</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium shrink-0">4</span>
            <span>Kirimkan barang kembali sesuai instruksi</span>
          </li>
        </ol>
      </div>
      <p className="text-sm text-neutral-500 italic p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        Terima kasih atas pengertian dan dukungan Anda.
      </p>
    </div>
  ),
  "kontak": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Jika Anda memiliki pertanyaan tentang kebijakan pengiriman atau pengembalian, silakan hubungi kami:
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <a href="mailto:admin@ayresapparel.com" className="group p-6 bg-neutral-50 border border-neutral-200 rounded-2xl hover:border-black hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Email</p>
              <p className="font-medium text-black">admin@ayresapparel.com</p>
            </div>
          </div>
        </a>
        <a href="https://ayreslab.id" target="_blank" rel="noreferrer" className="group p-6 bg-neutral-50 border border-neutral-200 rounded-2xl hover:border-black hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Website</p>
              <p className="font-medium text-black">ayreslab.id</p>
            </div>
          </div>
        </a>
      </div>
      <div className="p-6 bg-black text-white rounded-2xl mt-4">
        <p className="text-sm text-neutral-400 mb-2">Perusahaan</p>
        <p className="font-medium">CV AYRES Kreasi</p>
        <p className="text-sm text-neutral-400 mt-1">Jl. Wonocatur No.427, Banguntapan, Kotagede, D.I. Yogyakarta</p>
      </div>
    </div>
  ),
};

export default function ShippingReturnsPage() {
  const [activeSection, setActiveSection] = useState("informasi-pengiriman");
  const [openSection, setOpenSection] = useState<string | null>("informasi-pengiriman");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setOpenSection(id);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-64 sm:h-80 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.15),transparent_60%),radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3">
            Policy
          </p>
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-4">
            Pengiriman & Pengembalian
          </h1>
          <p className="text-sm text-neutral-400 max-w-md">
            Informasi lengkap tentang pengiriman dan kebijakan pengembalian barang kami
          </p>
        </div>
      </section>

      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="hover:text-black cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-black font-medium">Pengiriman & Pengembalian</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <aside className={`hidden lg:block ${isScrolled ? "sticky top-24" : ""} self-start`}>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    activeSection === section.id
                      ? "bg-black text-white font-medium"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          <div className="space-y-3">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="border border-neutral-100 rounded-2xl overflow-hidden bg-white hover:border-neutral-300 transition-colors"
              >
                <button
                  onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <h2 className="text-lg sm:text-xl font-medium text-black pr-4">
                    {section.title}
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-400 shrink-0 transition-transform ${
                      openSection === section.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === section.id && (
                  <div className="px-5 sm:px-6 pb-6 sm:pb-8 border-t border-neutral-100 pt-5">
                    {content[section.id]}
                  </div>
                )}
              </section>
            ))}

            <div className="mt-8 p-8 bg-black text-white rounded-2xl text-center">
              <h3 className="text-xl font-light mb-2">Ada pertanyaan?</h3>
              <p className="text-neutral-400 text-sm mb-6">
                Tim kami siap membantu Anda
              </p>
              <a
                href="mailto:admin@ayresapparel.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors"
              >
                Hubungi Kami
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}