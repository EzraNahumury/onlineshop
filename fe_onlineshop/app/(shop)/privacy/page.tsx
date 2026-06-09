"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const sections = [
  { id: "informasi-umum", title: "Informasi Umum" },
  { id: "pengumpulan-data", title: "Pengumpulan Data Pribadi" },
  { id: "penggunaan-data", title: "Penggunaan Data Pribadi" },
  { id: "pembagian-data", title: "Pembagian Data Pribadi" },
  { id: "retensi-data", title: "Retensi Data" },
  { id: "transfer-data", title: "Transfer Data" },
  { id: "hapus-data", title: "Hapus Data Pribadi" },
  { id: "keamanan", title: "Keamanan Data" },
  { id: "anak-anak", title: "Privasi Anak-Anak" },
  { id: "tautan-luar", title: "Tautan ke Situs Lain" },
  { id: "perubahan", title: "Perubahan Kebijakan" },
  { id: "kontak", title: "Hubungi Kami" },
];

const content: Record<string, React.ReactNode> = {
  "informasi-umum": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500">
        Terakhir diperbarui: 23 April 2026
      </p>
      <p>
        Kebijakan Privasi ini menjelaskan kebijakan dan prosedur Kami tentang pengumpulan, penggunaan, dan
        pengungkapan informasi Anda saat Anda menggunakan Layanan dan memberi tahu Anda tentang hak-hak
        privasi Anda dan bagaimana hukum melindungi Anda.
      </p>
      <div className="mt-6 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
        <h4 className="font-medium text-black mb-4">Definisi Penting</h4>
        <dl className="space-y-3 text-sm">
          {[
            { term: "Akun", def: "Akun unik yang dibuat untuk Anda agar dapat mengakses Layanan Kami." },
            { term: "Aplikasi", def: "AYRES Online Shop, program perangkat lunak yang disediakan oleh Perusahaan." },
            { term: "Perusahaan", def: "CV AYRES Kreasi, Jl. Wonocatur No.427, Banguntapan, Kotagede, D.I. Yogyakarta." },
            { term: "Data Pribadi", def: "Setiap informasi yang berkaitan dengan individu yang teridentifikasi atau dapat diidentifikasi." },
            { term: "Penyedia Layanan", def: "Orang alami atau badan hukum yang memproses data atas nama Perusahaan." },
            { term: "Anda", def: "Individu yang mengakses atau menggunakan Layanan, atau perusahaan, atau entitas hukum lain atas nama individu tersebut." },
          ].map(({ term, def }) => (
            <div key={term} className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="font-medium text-black">{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  ),
  "pengumpulan-data": (
    <div className="space-y-6 text-neutral-600 leading-relaxed">
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Data Pribadi yang Kami Kumpulkan</h4>
        <ul className="space-y-2 text-sm">
          {["Nama lengkap", "Alamat email", "Nomor telepon", "Alamat pengiriman", "Data pembayaran", "Informasi akun media sosial (jika login dengan Google atau media sosial lainnya)"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-3">Data Penggunaan</h4>
        <p className="text-sm">Dikumpulkan secara otomatis saat menggunakan Layanan:</p>
        <ul className="mt-3 space-y-2 text-sm">
          {["Alamat IP perangkat Anda", "Jenis peramban dan versinya", "Halaman yang dikunjungi", "Waktu dan tanggal kunjungan", "Waktu yang dihabiskan di halaman", "Pengenal perangkat unik", "Data diagnostik lainnya"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Informasi dari Aplikasi</h4>
        <p className="text-sm">Saat menggunakan Aplikasi Kami, dengan izin sebelumnya, Kami dapat mengumpulkan:</p>
        <ul className="mt-3 space-y-2 text-sm">
          {["Informasi mengenai lokasi Anda", "Gambar dan informasi dari kamera dan perpustakaan foto Perangkat Anda"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-neutral-500 mt-3">Anda dapat mengaktifkan atau menonaktifkan akses ini kapan saja melalui pengaturan Perangkat Anda.</p>
      </div>
    </div>
  ),
  "penggunaan-data": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500 mb-4">Kami menggunakan Data Pribadi Anda untuk tujuan berikut:</p>
      <div className="grid gap-3">
        {[
          { num: "01", title: "Menyediakan Layanan", desc: "Memantau penggunaan Layanan Kami" },
          { num: "02", title: "Mengelola Akun Anda", desc: "Mengelola pendaftaran dan akses ke fungsi Layanan" },
          { num: "03", title: "Pelaksanaan Kontrak", desc: "Pengembangan, kepatuhan, dan pelaksanaan kontrak pembelian" },
          { num: "04", title: "Menghubungi Anda", desc: "Email, panggilan telepon, SMS, atau pemberitahuan push mengenai pembaruan" },
          { num: "05", title: "Berita & Penawaran", desc: "Berita, penawaran khusus, dan informasi umum tentang barang dan layanan baru" },
          { num: "06", title: "Mengelola Permintaan", desc: "Attend dan mengelola permintaan Anda kepada Kami" },
          { num: "07", title: "Transfer Bisnis", desc: "Evaluasi atau melakukan merger, divestasi, restrukturisasi, atau penjualan aset" },
          { num: "08", title: "Analisis Data", desc: "Mengidentifikasi tren penggunaan dan meningkatkan Layanan" },
        ].map(({ num, title, desc }) => (
          <div key={num} className="flex gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-300 transition-colors">
            <span className="text-2xl font-light text-neutral-300">{num}</span>
            <div>
              <h4 className="font-medium text-black text-sm">{title}</h4>
              <p className="text-sm text-neutral-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  "pembagian-data": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500 mb-4">Kami dapat membagikan informasi pribadi Anda dalam situasi berikut:</p>
      <div className="grid gap-3">
        {[
          { icon: "🏢", title: "Dengan Penyedia Layanan", desc: "Untuk memantau dan menganalisis penggunaan Layanan Kami, untuk menghubungi Anda" },
          { icon: "📊", title: "Transfer Bisnis", desc: "Dalam merger, penjualan aset, pembiayaan, atau akuisisi seluruh atau sebagian bisnis Kami" },
          { icon: "🔗", title: "Dengan Afiliasi", desc: "Afiliasi termasuk perusahaan induk, anak perusahaan, mitra joint venture, atau perusahaan lain yang Kami kontrol" },
          { icon: "🤝", title: "Dengan Mitra Bisnis", desc: "Untuk menawarkan produk, layanan, atau promosi tertentu kepada Anda" },
          { icon: "👥", title: "Dengan Pengguna Lain", desc: "Ketika Anda berbagi informasi di area publik, informasi tersebut dapat dilihat oleh semua pengguna" },
          { icon: "✓", title: "Dengan Persetujuan Anda", desc: "Kami dapat mengungkapkan informasi pribadi Anda untuk tujuan lain dengan persetujuan Anda" },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-300 transition-colors">
            <span className="text-2xl">{icon}</span>
            <div>
              <h4 className="font-medium text-black text-sm">{title}</h4>
              <p className="text-sm text-neutral-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  "retensi-data": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <div className="p-6 bg-green-50 border border-green-100 rounded-2xl">
        <h4 className="font-medium text-black mb-3">Retensi Data Pribadi</h4>
        <p className="text-sm">
          Perusahaan akan menyimpan Data Pribadi Anda hanya selama diperlukan untuk tujuan yang
          ditetapkan dalam Kebijakan Privasi ini.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Mematuhi kewajiban hukum
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Menyelesaikan sengketa
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Menegakkan perjanjian dan kebijakan hukum Kami
          </li>
        </ul>
      </div>
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl">
        <h4 className="font-medium text-black mb-3">Retensi Data Penggunaan</h4>
        <p className="text-sm">
          Data Penggunaan umumnya disimpan untuk jangka waktu yang lebih singkat, kecuali ketika
          data ini digunakan untuk memperkuat keamanan atau meningkatkan fungsionalitas Layanan Kami.
        </p>
      </div>
    </div>
  ),
  "transfer-data": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Informasi Anda, termasuk Data Pribadi, diproses di kantor operasional Perusahaan dan di tempat
        lain di mana pihak-pihak yang terlibat dalam pemrosesan berada.
      </p>
      <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
        <h4 className="font-medium text-black mb-3 flex items-center gap-2">
          <span className="text-amber-500">⚠️</span> Perhatian
        </h4>
        <p className="text-sm">
          Transfer informasi berarti data dapat ditransfer ke komputer yang berlokasi di luar negara,
          provinsi, negara, atau yurisdiksi pemerintahan Anda yang hukum perlindungan datanya mungkin
          berbeda dari yurisdiksi Anda.
        </p>
      </div>
      <p className="text-sm">
        Persetujuan Anda terhadap Kebijakan Privasi ini diikuti dengan pengiriman informasi tersebut
        oleh Anda menunjukkan persetujuan Anda untuk transfer tersebut.
      </p>
      <p className="text-sm">
        Perusahaan akan mengambil semua langkah yang wajar dan perlu untuk memastikan bahwa data Anda
        diperlakukan dengan aman dan sesuai dengan Kebijakan Privasi ini.
      </p>
    </div>
  ),
  "hapus-data": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Anda memiliki hak untuk menghapus atau meminta Kami membantu dalam menghapus Data Pribadi
        yang telah Kami kumpulkan tentang Anda.
      </p>
      <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Hak Anda</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-medium shrink-0">1</span>
            <span>Hapus informasi tertentu dari dalam Layanan</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-medium shrink-0">2</span>
            <span>Perbarui, ubah, atau hapus informasi melalui Akun Anda</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-medium shrink-0">3</span>
            <span>Hubungi Kami untuk mengakses, koreksi, atau menghapus informasi pribadi</span>
          </li>
        </ul>
      </div>
      <p className="text-xs text-neutral-500 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <strong>Catatan:</strong> Kami mungkin perlu menyimpan informasi tertentu ketika Kami memiliki
        kewajiban hukum atau dasar hukum untuk melakukannya.
      </p>
    </div>
  ),
  "keamanan": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-100 rounded-xl">
        <span className="text-3xl">🔒</span>
        <div>
          <h4 className="font-medium text-black">Keamanan Data Pribadi Anda</h4>
          <p className="text-sm text-neutral-500 mt-1">Keamanan Data Pribadi Anda penting bagi Kami</p>
        </div>
      </div>
      <p className="text-sm">
        Tidak ada metode transmisi melalui Internet, atau metode penyimpanan elektronik yang 100% aman.
        Sementara Kami berusaha untuk menggunakan cara yang diterima secara komersial untuk melindungi
        Data Pribadi Anda, Kami tidak dapat menjamin keamanan mutlaknya.
      </p>
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <p className="text-sm text-neutral-500">
          Kami berkomitmen untuk melindungi data Anda dengan langkah-langkah keamanan yang wajar dan
          terus meningkatkan sistem kami untuk menghadapi ancaman yang berkembang.
        </p>
      </div>
    </div>
  ),
  "anak-anak": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">👶</span>
          <div>
            <h4 className="font-medium text-black">Layanan Tidak Untuk Anak-Anak</h4>
            <p className="text-sm text-neutral-500">Usia minimum: 13 tahun</p>
          </div>
        </div>
        <p className="text-sm">
          Layanan Kami tidak ditujukan kepada siapa pun yang berusia di bawah 13 tahun. Kami tidak
          secara sengaja mengumpulkan informasi pengenal pribadi dari siapa pun yang berusia di bawah 13 tahun.
        </p>
      </div>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-3">Jika Anda adalah orang tua</h4>
        <p className="text-sm text-neutral-500">
          Jika Anda adalah orang tua atau wali dan Anda mengetahui bahwa anak Anda telah memberikan
          Data Pribadi kepada Kami, silakan hubungi Kami. Jika Kami mengetahui bahwa Kami telah
          mengumpulkan Data Pribadi dari siapa pun yang berusia di bawah 13 tahun tanpa verifikasi
          persetujuan orang tua, Kami mengambil langkah untuk menghapus informasi tersebut dari server Kami.
        </p>
      </div>
    </div>
  ),
  "tautan-luar": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Layanan Kami dapat berisi tautan ke situs web lain yang tidak dioperasikan oleh Kami. Jika
        Anda mengklik tautan pihak ketiga, Anda akan diarahkan ke situs pihak ketiga tersebut.
      </p>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-4">⚠️ Kami sangat menyarankan Anda untuk:</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">1</span>
            <span>Mengecek Kebijakan Privasi setiap situs yang Anda kunjungi</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">2</span>
            <span>Memahami praktik pengumpulan data mereka</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">3</span>
            <span>Meninjau kebijakan privasi mereka sebelum memberikan data</span>
          </li>
        </ul>
      </div>
      <p className="text-sm text-neutral-500 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <strong>Catatan:</strong> Kami tidak memiliki kontrol atas dan tidak bertanggung jawab atas
        konten, kebijakan privasi, atau praktik situs atau layanan pihak ketiga mana pun.
      </p>
    </div>
  ),
  "perubahan": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Kami dapat memperbarui Kebijakan Privasi Kami dari waktu ke waktu. Perubahan akan efektif
        ketika diposting di halaman ini.
      </p>
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-4">📋 Bagaimana Kami Memberitahu Anda:</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-0.5">1</span>
            <span>Memposting Kebijakan Privasi baru di halaman ini</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-0.5">2</span>
            <span>Memberitahu Anda melalui email</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-0.5">3</span>
            <span>Pemberitahuan mencolok di Layanan Kami</span>
          </li>
        </ul>
      </div>
      <p className="text-xs text-neutral-500 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <strong>Saran:</strong> Kami menyarankan Anda untuk meninjau Kebijakan Privasi ini secara
        berkala untuk setiap perubahan. Perubahan pada Kebijakan Privasi ini efektif ketika diposting di halaman ini.
      </p>
    </div>
  ),
  "kontak": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, Anda dapat menghubungi kami:
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

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("informasi-umum");
  const [openSection, setOpenSection] = useState<string | null>("informasi-umum");
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
      {/* Hero Banner */}
      <section className="relative h-64 sm:h-80 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.15),transparent_60%),radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-neutral-400 max-w-md">
            Kami berkomitmen untuk melindungi privasi Anda dan menjelaskan bagaimana data Anda digunakan
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="hover:text-black cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-black font-medium">Kebijakan Privasi</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Sticky Sidebar Navigation */}
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

          {/* Main Content */}
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

            {/* Footer CTA */}
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