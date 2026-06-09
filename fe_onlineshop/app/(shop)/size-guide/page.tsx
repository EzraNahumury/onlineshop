"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const sections = [
  { id: "panduan-ukuran", title: "Panduan Ukuran" },
  { id: "atasan", title: "Atasan" },
  { id: "bawahan", title: "Bawahan" },
  { id: "aksesoris", title: "Aksesoris" },
  { id: "ketentuan", title: "Ketentuan & Catatan Penting" },
];

const content: Record<string, React.ReactNode> = {
  "panduan-ukuran": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500">
        Terakhir diperbarui: 23 April 2026
      </p>
      <div className="p-6 bg-black text-white rounded-2xl">
        <h4 className="font-medium mb-3">Panduan Ukuran (Size Guide) AYRES</h4>
        <p className="text-sm text-neutral-300">
          Memilih ukuran yang tepat akan memastikan kenyamanan dan performa maksimal saat digunakan.
        </p>
        <p className="text-sm text-neutral-300 mt-2">
          Gunakan panduan berikut sebagai referensi sebelum melakukan pemesanan.
        </p>
      </div>

      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Panduan Pengukuran</h4>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Panjang (P)", desc: "diukur dari bahu tertinggi hingga bagian bawah pakaian" },
            { label: "Lebar (L)", desc: "diukur dari ketiak kiri ke kanan" },
            { label: "Lengan (PL)", desc: "diukur dari bahu hingga ujung lengan" },
            { label: "Pinggang", desc: "lebar bagian pinggang celana (tidak ditarik)" },
            { label: "Paha", desc: "lebar bagian paha celana" },
            { label: "Tangan", desc: "diukur dari ujung telapak hingga pangkal pergelangan" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex gap-3">
              <span className="font-medium text-black min-w-[80px]">{label}:</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">📏 Cara Mengukur</h4>
        <p className="text-sm">
          Gunakan pita pengukur dan ukur langsung di tubuh Anda. Pastikan pita tidak terlalu ketat atau terlalu longgar.
          Jika berada di antara dua ukuran, disarankan memilih ukuran yang lebih besar.
        </p>
      </div>
    </div>
  ),
  "atasan": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Regular Fit (Dewasa)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-black">Ukuran</th>
                <th className="text-right py-2 font-medium text-black">Panjang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Lebar (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: "XS", p: 64, l: 47 },
                { size: "S", p: 66, l: 49 },
                { size: "M", p: 68, l: 51 },
                { size: "L", p: 72, l: 54 },
                { size: "XL", p: 74, l: 56 },
                { size: "XXL", p: 76, l: 58 },
              ].map(({ size, p, l }) => (
                <tr key={size} className="border-b border-neutral-100">
                  <td className="py-2 font-medium text-black">{size}</td>
                  <td className="py-2 text-right">{p}</td>
                  <td className="py-2 text-right">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Wanita</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-black">Ukuran</th>
                <th className="text-right py-2 font-medium text-black">Panjang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Lebar (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: "S", p: 62, l: 46 },
                { size: "M", p: 64, l: 48 },
                { size: "L", p: 66, l: 50 },
                { size: "XL", p: 68, l: 52 },
                { size: "XXL", p: 68, l: 54 },
              ].map(({ size, p, l }) => (
                <tr key={size} className="border-b border-neutral-100">
                  <td className="py-2 font-medium text-black">{size}</td>
                  <td className="py-2 text-right">{p}</td>
                  <td className="py-2 text-right">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Anak</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-black">Ukuran</th>
                <th className="text-right py-2 font-medium text-black">Panjang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Lebar (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: "S", p: 58, l: 39 },
                { size: "M", p: 60, l: 41 },
                { size: "L", p: 62, l: 43 },
                { size: "XL", p: 64, l: 45 },
              ].map(({ size, p, l }) => (
                <tr key={size} className="border-b border-neutral-100">
                  <td className="py-2 font-medium text-black">{size}</td>
                  <td className="py-2 text-right">{p}</td>
                  <td className="py-2 text-right">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="font-medium text-black mb-4">Oversize Fit</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-200">
                    <th className="text-left py-2 font-medium text-black">Ukuran</th>
                    <th className="text-right py-2 font-medium text-black">Panjang (cm)</th>
                    <th className="text-right py-2 font-medium text-black">Lebar (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "M", p: 70, l: 56 },
                    { size: "L", p: 72, l: 58 },
                    { size: "XL", p: 74, l: 60 },
                  ].map(({ size, p, l }) => (
                    <tr key={size} className="border-b border-amber-100">
                      <td className="py-2 font-medium text-black">{size}</td>
                      <td className="py-2 text-right">{p}</td>
                      <td className="py-2 text-right">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="px-4 py-2 bg-amber-100 rounded-lg">
            <span className="text-sm font-medium text-amber-800">+Rp10.000</span>
          </div>
        </div>
        <p className="text-xs text-amber-700 mt-3">*Produk oversize dikenakan tambahan biaya Rp10.000</p>
      </div>

      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Jersey Boxy Cut</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-black">Ukuran</th>
                <th className="text-right py-2 font-medium text-black">Lebar (cm)</th>
                <th className="text-right py-2 font-medium text-black">Panjang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Lengan (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: "S", l: 54, p: 60, pl: 24 },
                { size: "M", l: 56, p: 62, pl: 26 },
                { size: "L", l: 58, p: 65, pl: 27 },
                { size: "XL", l: 60, p: 67, pl: 29 },
                { size: "XXL", l: 62, p: 70, pl: 31 },
                { size: "XXXL", l: 64, p: 72, pl: 33 },
              ].map(({ size, l, p, pl }) => (
                <tr key={size} className="border-b border-neutral-100">
                  <td className="py-2 font-medium text-black">{size}</td>
                  <td className="py-2 text-right">{l}</td>
                  <td className="py-2 text-right">{p}</td>
                  <td className="py-2 text-right">{pl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-500 mt-3">*Toleransi ukuran ±1–2 cm untuk Jersey Boxy Cut</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <img src="/size_guide/size chart reguler.png" alt="Size Chart Regular" className="w-full rounded-xl border border-neutral-200" />
        <img src="/size_guide/size chart oversize & celana jersey.png" alt="Size Chart Oversize" className="w-full rounded-xl border border-neutral-200" />
      </div>
      <img src="/size_guide/size jersey boxy cut.png" alt="Size Chart Jersey Boxy Cut" className="w-full rounded-xl border border-neutral-200" />
    </div>
  ),
  "bawahan": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Celana Dewasa</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-black">Ukuran</th>
                <th className="text-right py-2 font-medium text-black">Panjang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Pinggang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Paha (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: "XS", p: 42, pinggang: 26, paha: 26 },
                { size: "S", p: 43, pinggang: 28, paha: 28 },
                { size: "M", p: 45, pinggang: 30, paha: 30 },
                { size: "L", p: 47, pinggang: 30, paha: 30 },
                { size: "XL", p: 48, pinggang: 32, paha: 32 },
                { size: "XXL", p: 50, pinggang: 34, paha: 34 },
              ].map(({ size, p, pinggang, paha }) => (
                <tr key={size} className="border-b border-neutral-100">
                  <td className="py-2 font-medium text-black">{size}</td>
                  <td className="py-2 text-right">{p}</td>
                  <td className="py-2 text-right">{pinggang}</td>
                  <td className="py-2 text-right">{paha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Celana Anak</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-black">Ukuran</th>
                <th className="text-right py-2 font-medium text-black">Panjang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Pinggang (cm)</th>
                <th className="text-right py-2 font-medium text-black">Paha (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: "S", p: 30, pinggang: 22, paha: 22 },
                { size: "M", p: 33, pinggang: 24, paha: 24 },
                { size: "L", p: 36, pinggang: 26, paha: 26 },
                { size: "XL", p: 38, pinggang: 27, paha: 27 },
              ].map(({ size, p, pinggang, paha }) => (
                <tr key={size} className="border-b border-neutral-100">
                  <td className="py-2 font-medium text-black">{size}</td>
                  <td className="py-2 text-right">{p}</td>
                  <td className="py-2 text-right">{pinggang}</td>
                  <td className="py-2 text-right">{paha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <img src="/size_guide/size chart oversize & celana jersey.png" alt="Size Chart Celana" className="w-full rounded-xl border border-neutral-200" />
    </div>
  ),
  "aksesoris": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Sarung Tangan (Gloves)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-black">Size</th>
                <th className="text-left py-2 font-medium text-black">Lingkar Tangan (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: "6", range: "15.5 cm – 16.5 cm" },
                { size: "7", range: "16.5 cm – 17.5 cm" },
                { size: "8", range: "17.5 cm – 18.5 cm" },
                { size: "9", range: "18.5 cm – 19.5 cm" },
                { size: "10", range: "19.5 cm – 20.5 cm" },
              ].map(({ size, range }) => (
                <tr key={size} className="border-b border-neutral-100">
                  <td className="py-3 font-medium text-black">{size}</td>
                  <td className="py-3">{range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <img src="/size_guide/size chart gloves.png" alt="Size Chart Gloves" className="w-full rounded-xl border border-neutral-200" />
    </div>
  ),
  "ketentuan": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-4">Ketentuan & Catatan Penting</h4>
        <ul className="space-y-3 text-sm">
          {[
            "Seluruh ukuran menggunakan satuan centimeter (cm)",
            "Perbedaan ukuran dapat terjadi karena proses produksi",
            "Disarankan memilih satu ukuran lebih besar jika berada di antara dua ukuran",
            "Tidak menerima penukaran/retur akibat kesalahan pemilihan ukuran"
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium shrink-0">{idx + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
        <h4 className="font-medium text-black mb-3 flex items-center gap-2">
          <span className="text-amber-500">⚠️</span> Toleransi Ukuran
        </h4>
        <p className="text-sm">
          Toleransi ukuran ±1–2 cm hanya berlaku untuk produk <strong>Jersey Boxy Cut</strong>.
        </p>
        <p className="text-sm mt-2">
          Untuk produk lainnya, ukuran mengikuti standar yang telah ditetapkan.
        </p>
      </div>

      <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
        <h4 className="font-medium text-black mb-3">🔄 Kebijakan Pengembalian</h4>
        <p className="text-sm">
          Kami tidak menerima penukaran atau pengembalian barang akibat kesalahan pemilihan ukuran oleh pelanggan.
          Mohon gunakan panduan ukuran ini dengan seksama sebelum melakukan pemesanan.
        </p>
      </div>
    </div>
  ),
};

export default function SizeGuidePage() {
  const [activeSection, setActiveSection] = useState("panduan-ukuran");
  const [openSection, setOpenSection] = useState<string | null>("panduan-ukuran");
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
            Guide
          </p>
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-4">
            Panduan Ukuran
          </h1>
          <p className="text-sm text-neutral-400 max-w-md">
            Panduan lengkap untuk memilih ukuran yang tepat
          </p>
        </div>
      </section>

      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="hover:text-black cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-black font-medium">Panduan Ukuran</span>
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
              <h3 className="text-xl font-light mb-2">Butuh Bantuan?</h3>
              <p className="text-neutral-400 text-sm mb-6">
                Tim kami siap membantu Anda memilih ukuran yang tepat
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