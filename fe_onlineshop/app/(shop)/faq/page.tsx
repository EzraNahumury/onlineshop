"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const sections = [
  { id: "cara-order", title: "Cara Order" },
  { id: "minimal-order-harga", title: "Minimal Order & Harga" },
  { id: "pembayaran", title: "Pembayaran" },
  { id: "custom-desain", title: "Custom & Desain" },
  { id: "produksi-pengiriman", title: "Produksi & Pengiriman" },
  { id: "ukuran-bahan", title: "Ukuran & Bahan" },
  { id: "retur-komplain", title: "Retur & Komplain" },
];

function QA({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
      <p className="text-sm font-medium text-black">Q: {question}</p>
      <p className="text-sm text-neutral-600 leading-relaxed">A: {answer}</p>
    </div>
  );
}

const content: Record<string, React.ReactNode> = {
  "cara-order": (
    <div className="space-y-4">
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-sm text-neutral-600">
          Proses order kami mudah dan bisa dilakukan langsung via WhatsApp.
        </p>
      </div>
      <QA
        question="Kalau mau order, caranya gimana?"
        answer="Untuk order bisa langsung kirim format pesanan (nama, alamat, produk, size, jumlah) ya kak."
      />
      <QA
        question="Bisa pesan langsung lewat WA?"
        answer="Bisa kak, langsung order via WA di sini saja."
      />
      <a
        href="https://wa.me/6282327123299"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 p-5 bg-green-50 border border-green-100 rounded-xl hover:border-green-400 hover:shadow transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center group-hover:bg-green-600 transition-colors shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Order via WhatsApp</p>
          <p className="font-medium text-black">0823-2712-3299</p>
        </div>
      </a>
    </div>
  ),

  "minimal-order-harga": (
    <div className="space-y-4">
      <QA
        question="Minimal order berapa pcs?"
        answer="Minimal order bisa 1 pcs kak, tapi ada biaya tambahan. Untuk minimal 6 pcs tidak ada biaya tambahan."
      />
      <QA
        question="Ada diskon atau harga khusus kalau beli banyak?"
        answer="Ada kak, untuk pembelian banyak nanti kami berikan harga khusus."
      />
      <QA
        question="Bisa COD atau tidak?"
        answer="Untuk saat ini belum melayani COD kak."
      />
      <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-sm font-medium text-black mb-1">Info Pembelian Massal</p>
        <p className="text-sm text-neutral-600">
          Untuk pembelian dalam jumlah besar, hubungi kami langsung via WhatsApp agar kami bisa memberikan penawaran harga terbaik.
        </p>
      </div>
    </div>
  ),

  "pembayaran": (
    <div className="space-y-4">
      <QA
        question="Metode pembayarannya apa saja?"
        answer="Pembayaran bisa via transfer atau QRIS kak."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm font-medium text-black mb-1">Transfer Bank</p>
          <p className="text-sm text-neutral-600">Tersedia pilihan transfer antar bank.</p>
        </div>
        <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl">
          <p className="text-sm font-medium text-black mb-1">QRIS</p>
          <p className="text-sm text-neutral-600">Scan QR untuk pembayaran cepat dari semua aplikasi e-wallet.</p>
        </div>
      </div>
    </div>
  ),

  "custom-desain": (
    <div className="space-y-4">
      <QA
        question="Bisa custom desain sendiri atau tambah logo?"
        answer="Bisa kak, kami melayani custom desain dan logo."
      />
      <QA
        question="Kalau custom ada biaya tambahan tidak?"
        answer="Untuk custom ada tambahan biaya tergantung desain kak."
      />
      <QA
        question="Minimal order untuk custom berapa pcs?"
        answer="Minimal order custom fleksibel, tapi lebih hemat di 6 pcs ke atas kak."
      />
      <QA
        question="Kalau mau revisi desain bisa tidak?"
        answer="Untuk revisi desain maksimal 1x dengan mengulang antrian dari awal."
      />
      <div className="p-5 bg-neutral-900 text-white rounded-xl">
        <p className="text-sm font-medium mb-1">Tertarik Custom?</p>
        <p className="text-sm text-neutral-400">
          Hubungi kami via WhatsApp dan ceritakan kebutuhan desain kamu. Tim kami siap membantu mewujudkan ide kamu.
        </p>
      </div>
    </div>
  ),

  "produksi-pengiriman": (
    <div className="space-y-4">
      <QA
        question="Berapa lama proses produksi termasuk custom?"
        answer="Proses produksi estimasi 21 hari kerja setelah acc proofing kak."
      />
      <QA
        question="Kalau urgent bisa dipercepat tidak?"
        answer="Produksi bisa dipercepat menyesuaikan antrian, dan tersedia paket express dengan tambahan biaya."
      />
      <QA
        question="Berapa lama pengiriman ke kota saya?"
        answer="Estimasi pengiriman tergantung lokasi dan ekspedisi yang dipilih kak."
      />
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-sm font-medium text-black mb-1">Catatan Produksi</p>
        <p className="text-sm text-neutral-600">
          Waktu produksi dihitung mulai dari konfirmasi proofing. Pastikan desain sudah disetujui agar proses tidak tertunda.
        </p>
      </div>
    </div>
  ),

  "ukuran-bahan": (
    <div className="space-y-4">
      <QA
        question="Size chart-nya ada?"
        answer="Ada kak, kami kirimkan size chart-nya ya."
      />
      <QA
        question="Kalau tinggi dan berat segini cocok pakai size apa?"
        answer="Untuk rekomendasi size bisa disesuaikan dengan tinggi dan berat, nanti kami bantu sarankan kak."
      />
      <QA
        question="Kalau tidak muat bisa tukar ukuran tidak?"
        answer="Penukaran size bisa sesuai syarat dan ketentuan yang berlaku ya kak."
      />
      <QA
        question="Bahannya apa dan nyaman dipakai tidak?"
        answer="Bahan menggunakan dryfit, nyaman dipakai dan menyerap keringat kak."
      />
      <div className="p-5 bg-green-50 border border-green-100 rounded-xl">
        <p className="text-sm font-medium text-black mb-1">Tips Pilih Size</p>
        <p className="text-sm text-neutral-600">
          Ragu pilih ukuran? Kirimkan tinggi dan berat badan kamu via WhatsApp, kami bantu rekomendasikan size yang paling pas.
        </p>
      </div>
    </div>
  ),

  "retur-komplain": (
    <div className="space-y-4">
      <QA
        question="Kalau barang cacat atau salah kirim bisa retur atau tidak?"
        answer="Jika ada cacat atau salah kirim bisa kami bantu retur sesuai prosedur ya kak."
      />
      <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-sm font-medium text-black mb-2">Prosedur Retur</p>
        <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
          <li>Hubungi kami via WhatsApp dalam 2x24 jam setelah barang diterima</li>
          <li>Sertakan foto bukti kerusakan atau kesalahan produk</li>
          <li>Tim kami akan memproses sesuai ketentuan yang berlaku</li>
        </ul>
      </div>
      <a
        href="https://wa.me/6282327123299"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 p-5 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-black hover:shadow transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center group-hover:bg-red-600 transition-colors shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Laporkan Masalah</p>
          <p className="font-medium text-black">Hubungi via WhatsApp</p>
        </div>
      </a>
    </div>
  ),
};

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState("cara-order");
  const [openSection, setOpenSection] = useState<string | null>("cara-order");
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(200,169,110,0.15),transparent_60%),radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3">
            FAQ
          </p>
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-4">
            Pertanyaan Umum
          </h1>
          <p className="text-sm text-neutral-400 max-w-md">
            Temukan jawaban atas pertanyaan yang sering diajukan
          </p>
        </div>
      </section>

      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="hover:text-black cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-black font-medium">FAQ</span>
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
                  onClick={() =>
                    setOpenSection(openSection === section.id ? null : section.id)
                  }
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
