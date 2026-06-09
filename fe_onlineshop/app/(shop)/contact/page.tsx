"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const sections = [
  { id: "hubungi-kami", title: "Hubungi Kami" },
  { id: "informasi-kontak", title: "Informasi Kontak" },
];

const content: Record<string, React.ReactNode> = {
  "hubungi-kami": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500">
        Terakhir diperbarui: 23 April 2026
      </p>
      <div className="p-6 bg-black text-white rounded-2xl">
        <h4 className="font-medium mb-3">Hubungi Kami</h4>
        <p className="text-sm text-neutral-300">
          Kami siap membantu Anda. Silakan hubungi tim kami melalui berbagai渠道 di bawah ini.
        </p>
      </div>
      <p className="text-sm">
        Jika Anda memiliki pertanyaan, saran, atau butuh bantuan, jangan ragu untuk menghubungi kami. Tim kami akan berusaha sebaik mungkin untuk merespons setiap pertanyaan Anda.
      </p>
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3 flex items-center gap-2">
          <span className="text-blue-500">💬</span> Waktu Respons
        </h4>
        <p className="text-sm">
          Kami akan merespons pesan Anda dalam waktu 1x24 jam pada hari kerja.
        </p>
      </div>
    </div>
  ),
  "informasi-kontak": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <div className="grid gap-4 sm:grid-cols-2">
        <a href="https://wa.me/6282327123299" target="_blank" rel="noreferrer" className="group p-6 bg-green-50 border border-green-100 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center group-hover:bg-green-600 group-hover:scale-110 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">WhatsApp</p>
              <p className="font-medium text-black">0823-2712-3299</p>
            </div>
          </div>
        </a>
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
      </div>

      <a href="https://ayreslab.id" target="_blank" rel="noreferrer" className="group p-6 bg-neutral-50 border border-neutral-200 rounded-2xl hover:border-black hover:shadow-lg transition-all block">
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

      <div className="p-6 bg-black text-white rounded-2xl">
        <p className="text-sm text-neutral-400 mb-2">Perusahaan</p>
        <p className="font-medium">CV AYRES Kreasi</p>
        <p className="text-sm text-neutral-400 mt-1">Jl. Wonocatur No.427, Banguntapan, Kotagede, D.I. Yogyakarta</p>
      </div>

      <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
        <h4 className="font-medium text-black mb-3 flex items-center gap-2">
          <span className="text-amber-500">⚠️</span> Catatan
        </h4>
        <p className="text-sm">
          Untuk pertanyaan terkait pesanan, harap sertakan nomor order atau email yang digunakan saat checkout agar kami dapat membantu Anda lebih cepat.
        </p>
      </div>
    </div>
  ),
};

export default function ContactPage() {
  const [activeSection, setActiveSection] = useState("hubungi-kami");
  const [openSection, setOpenSection] = useState<string | null>("hubungi-kami");
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
            Contact
          </p>
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-4">
            Hubungi Kami
          </h1>
          <p className="text-sm text-neutral-400 max-w-md">
            Tim kami siap membantu Anda
          </p>
        </div>
      </section>

      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="hover:text-black cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-black font-medium">Hubungi Kami</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}