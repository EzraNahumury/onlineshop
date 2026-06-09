"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const sections = [
  { id: "informasi-umum", title: "Informasi Umum" },
  { id: "syarat-toko-online", title: "Syarat & Ketentuan Toko Online" },
  { id: "ketentuan-umum", title: "Ketentuan Umum" },
  { id: "akurasi-informasi", title: "Akurasi, Kelengkapan & Keterkinian Informasi" },
  { id: "modifikasi-layanan-harga", title: "Modifikasi Layanan dan Harga" },
  { id: "produk-layanan", title: "Produk atau Layanan" },
  { id: "akurasi-penagihan", title: "Akurasi Informasi Penagihan dan Akun" },
  { id: "pengiriman-pengembalian", title: "Kebijakan Pengiriman & Pengembalian" },
  { id: "alat-opsional", title: "Alat Opsional" },
  { id: "tautan-ketiga", title: "Tautan Pihak Ketiga" },
  { id: "komentar-pengguna", title: "Komentar, Masukan & Submit Lainnya" },
  { id: "informasi-pribadi", title: "Informasi Pribadi" },
  { id: "kesalahan-kati", title: "Kesalahan, Ketidakakuratan & Kekeliruan" },
  { id: "penggunaan-terlarang", title: "Penggunaan Terlarang" },
  { id: "penafian", title: "Penafian Garantii; Batasan Tanggung Jawab" },
  { id: "ganti-rugi", title: "Ganti Rugi" },
  { id: "keterpisahan", title: "Keterpisahan" },
  { id: "penghentian", title: "Penghentian" },
  { id: "keseluruhan-perjanjian", title: "Keseluruhan Perjanjian" },
  { id: "hukum-yang-berlaku", title: "Hukum yang Berlaku" },
  { id: "perubahan-syarat", title: "Perubahan Syarat Layanan" },
  { id: "kontak", title: "Hubungi Kami" },
];

const content: Record<string, React.ReactNode> = {
  "informasi-umum": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500">
        Terakhir diperbarui: 23 April 2026
      </p>
      <p>
        Dengan mengunjungi situs kami dan/atau membeli sesuatu dari kami, Anda terlibat dalam "Layanan" kami dan agree untuk terikat oleh syarat dan ketentuan berikut ("Terms of Service", "Terms"), termasuk those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Syarat Layanan berlaku untuk semua pengguna situs, termasuk tanpa batasan pengguna yang merupakan browser, vendor, pelanggan, pedagang, dan/atau kontributor konten.
      </p>
      <p>
        Silakan baca Syarat Layanan ini dengan seksama sebelum mengakses atau menggunakan situs web kami. Dengan mengakses atau menggunakan bagian mana pun dari situs, Anda agree untuk terikat oleh Syarat Layanan ini. Jika Anda tidak agree untuk semua syarat dan ketentuan agreement ini, maka Anda tidak boleh mengakses situs web atau menggunakan Layanan apa pun. Jika Syarat Layanan ini dianggap sebagai penawaran, acceptance secara tegas dibatasi untuk Syarat Layanan ini.
      </p>
      <p>
        Setiap fitur atau alat baru yang ditambahkan ke toko saat ini juga akan tunduk pada Syarat Layanan. Anda dapat meninjau versi paling terkini dari Syarat Layanan kapan saja di halaman ini. Kami berhak untuk memperbarui, mengubah atau mengganti bagian mana pun dari Syarat Layanan ini dengan memposting pembaruan dan/atau perubahan di situs web kami. Adalah tanggung jawab Anda untuk memeriksa halaman ini secara berkala untuk melihat perubahan. Continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
      </p>
      <div className="mt-6 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
        <h4 className="font-medium text-black mb-4">Definisi Penting</h4>
        <dl className="space-y-3 text-sm">
          {[
            { term: "Layanan", def: "Layanan e-commerce online yang disediakan oleh AYRES melalui situs web kami." },
            { term: "Aplikasi", def: "AYRES Online Shop, program perangkat lunak yang disediakan oleh Perusahaan." },
            { term: "Perusahaan", def: "CV AYRES Kreasi, Jl. Wonocatur No.427, Banguntapan, Kotagede, D.I. Yogyakarta." },
            { term: "Produk", def: "Barang atau layanan yang tersedia untuk dijual di toko online kami." },
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
  "syarat-toko-online": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500 mb-4">
        Dengan menyetujui Syarat Layanan ini, Anda menyatakan bahwa Anda setidaknya berusia mayoritas di negara bagian atau tempat tinggal Anda, atau bahwa Anda berusia mayoritas di negara bagian atau tempat tinggal Anda dan Anda telah memberikan persetujuan kami untuk mengizinkan salah satu tanggungan kecil Anda untuk menggunakan situs ini.
      </p>
      <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Penggunaan Dilarang</h4>
        <p className="text-sm mb-3">Anda tidak boleh menggunakan produk kami untuk tujuan ilegal atau tidak sah, dan Anda tidak boleh, dalam penggunaan Layanan, melanggar hukum apa pun di yurisdiksi Anda (termasuk tetapi tidak terbatas pada hukum hak cipta).</p>
        <ul className="space-y-2 text-sm">
          {[
            "Tidak boleh transmitsikan worms atau viruses atau kode berbahaya lainnya",
            "Tidak boleh transmit any worms or viruses or any code of a destructive nature",
            "Melanggar atau melanggar hak kekayaan intelektual kami atau hak kekayaan intelektual orang lain",
            "Mengumpulkan atau melacak informasi pribadi orang lain",
            "Mengirim spam, phish, pharm, pretext, spider, crawl, atau scrape",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <strong>Catatan:</strong> Pelanggaran atau pelanggaran salah satu Syarat akan mengakibatkan penghentian Layanan Anda secara sofort.
      </p>
    </div>
  ),
  "ketentuan-umum": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Kami berhak untuk menolak Layanan kepada siapa pun karena alasan apa pun kapan saja.
      </p>
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Transfer Data</h4>
        <p className="text-sm">
          Anda memahami bahwa konten Anda (tidak termasuk informasi kartu kredit), dapat ditransfer tanpa enkripsi dan melibatkan (a) transmisi melalui berbagai jaringan; dan (b) perubahan untuk menyesuaikan dan menyesuaikan dengan kebutuhan teknis dari jaringan atau perangkat yang terhubung. Informasi kartu kredit selalu dienkripsi selama transfer melalui jaringan.
        </p>
      </div>
      <p className="text-sm">
        Anda setuju untuk tidak mereproduksi, menduplikasi, menyalin, menjual, menjual kembali atau mengeksploitasi bagian mana pun dari Layanan, penggunaan Layanan, atau akses ke Layanan atau kontak apa pun di situs web yang menyediakan Layanan, tanpa izin tertulis dari kami.
      </p>
      <p className="text-sm">
        Judul yang digunakan dalam perjanjian ini dilertakan hanya untuk kemudahan saja dan tidak akan membatasi atau mempengaruhi Syarat ini.
      </p>
    </div>
  ),
  "akurasi-informasi": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Kami tidak bertanggung jawab jika informasi yang tersedia di situs ini tidak akurat, lengkap atau terkini. Materi di situs ini disediakan untuk informasi umum saja dan tidak boleh digunakan sebagai satu-satunya dasar untuk membuat keputusan tanpa berkonsultasi dengan sumber informasi primer yang lebih akurat, lengkap atau lebih tepat waktu. Ketergantungan apa pun pada materi di situs ini adalah atas risiko Anda sendiri.
      </p>
      <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
        <h4 className="font-medium text-black mb-3 flex items-center gap-2">
          <span className="text-amber-500">⚠️</span> Informasi Historis
        </h4>
        <p className="text-sm">
          Situs ini mungkin berisi informasi historis tertentu. Informasi historis, tentulah, bukan yang terkini dan disediakan untuk referensi Anda saja. Kami berhak untuk memodifikasi konten situs ini kapan saja, tetapi kami tidak memiliki kewajiban untuk memperbarui informasi apa pun di situs kami. Anda setuju bahwa itu adalah tanggung jawab Anda untuk memantau perubahan di situs kami.
        </p>
      </div>
    </div>
  ),
  "modifikasi-layanan-harga": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Harga</h4>
        <p className="text-sm">
          Harga untuk produk kami dapat berubah sewaktu-waktu tanpa notice.
        </p>
      </div>
      <p className="text-sm">
        Kami berhak kapan saja untuk mengubah atau menghentikan Layanan (atau bagian atau konten apa pun di dalamnya) tanpa notice kapan saja.
      </p>
      <p className="text-sm">
        Kami tidak akan bertanggung jawab kepada Anda atau pihak ketiga mana pun untuk setiap modifikasi, perubahan harga, penangguhan atau penghentian Layanan.
      </p>
    </div>
  ),
  "produk-layanan": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm text-neutral-500 mb-4">
        Produk atau Layanan tertentu mungkin tersedia secara eksklusif online melalui situs web. Produk atau Layanan ini mungkin memiliki kuantitas terbatas dan tunduk pada pengembalian atau pertukaran hanya sesuai dengan Kebijakan Pengembalian Dana kami.
      </p>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-3">Tampilan Produk</h4>
        <p className="text-sm">
          Kami telah berusaha menampilkan seakurat mungkin warna dan gambar produk yang muncul di toko. Kami tidak dapat menjamin bahwa tampilan warna mana pun di monitor komputer Anda akan akurat.
        </p>
      </div>
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Ketersediaan dan Batasan</h4>
        <p className="text-sm mb-3">Kami berhak, tetapi tidak wajib, untuk membatasi penjualan produk atau Layanan kami kepada siapa pun, wilayah geografis atau yurisdiksi. Kami dapat menggunakan hak ini berdasarkan kasus per kasus.</p>
        <ul className="space-y-2 text-sm">
          {[
            "Berhak membatasi kuantitas produk atau Layanan yang kami tawarkan",
            "Semua deskripsi produk atau harga produk dapat berubah sewaktu-waktu tanpa notice",
            "Berhak menghentikan produk apa pun kapan saja",
            "Penawaran apa pun untuk produk atau Layanan apa pun yang dibuat di situs ini tidak valid di mana pun dilarang"
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <strong>Catatan:</strong> Kami tidak menjamin bahwa kualitas produk, Layanan, informasi, atau materi lain yang dibeli atau diperoleh oleh Anda akan memenuhi harapan Anda, atau bahwa kesalahan apa pun dalam Layanan akan diperbaiki.
      </p>
    </div>
  ),
  "akurasi-penagihan": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Kami berhak untuk menolak pesanan apa pun yang Anda buat kepada kami. Kami dapat, atas kebijaksanaan kami sendiri, membatasi atau membatalkan jumlah yang dibeli per orang, rumah tangga atau pesanan. Pembatasan ini mungkin termasuk pesanan yang ditempatkan oleh atau di bawah akun pelanggan yang sama, kartu kredit yang sama, dan/atau pesanan yang menggunakan alamat penagihan dan/atau pengiriman yang sama.
      </p>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-3">Pemberitahuan Pesanan</h4>
        <p className="text-sm">
          Jika kami melakukan perubahan pada atau membatalkan pesanan, kami dapat mencoba memberi tahu Anda dengan menghubungi email dan/atau alamat penagihan/nomor telepon yang provided saat pesanan dibuat. Kami berhak untuk membatasi atau melarang pesanan yang, menurut penilaian kami, tampaknya ditempatkan oleh dealer, pengecer atau distributor.
        </p>
      </div>
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Tanggung Jawab Anda</h4>
        <p className="text-sm">
          Anda setuju untuk memberikan informasi pembelian dan akun yang terkini, lengkap dan akurat untuk semua pembelian yang dilakukan di toko kami. Anda setuju untuk segera memperbarui akun dan informasi lain Anda, termasuk alamat email dan nomor kartu kredit serta tanggal kedaluwarsa, sehingga kami dapat menyelesaikan transaksi Anda dan menghubungi Anda sesuai kebutuhan.
        </p>
      </div>
      <p className="text-xs text-neutral-500 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        Untuk detail lebih lanjut, silakan tinjau Kebijakan Pengembalian Dana kami.
      </p>
    </div>
  ),
  "pengiriman-pengembalian": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Pengiriman</h4>
        <p className="text-sm">
          Mohon tunggu 2–3 hari kerja untuk proses pemenuhan dan pengemasan pesanan Anda. Setelah itu, pesanan akan diserahkan kepada layanan pengiriman yang Anda pilih. Kami akan berusaha semaksimal mungkin agar paket Anda sampai secepat mungkin.
        </p>
      </div>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-3">Kebijakan Pengembalian & Penukaran</h4>
        <p className="text-sm">
          Barang harus dalam kondisi asli, belum dipakai, dengan semua tag dan kemasan masih lengkap. Bukti pembelian wajib disertakan untuk setiap pengembalian atau penukaran.
        </p>
      </div>
      <p className="text-sm text-neutral-500 italic">
        Terima kasih atas pengertian dan dukungan Anda.
      </p>
    </div>
  ),
  "alat-opsional": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Kami dapat memberi Anda akses ke alat pihak ketiga yang tidak kami pantau nor memiliki kendali atau masukan apa pun atasnya.
      </p>
      <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Penafian</h4>
        <p className="text-sm">
          Anda mengakui dan setuju bahwa kami menyediakan akses ke alat tersebut "sebagaimana adanya" dan "sebagaimana tersedia" tanpa jaminan, representasi atau kondisi apa pun dan tanpa dukungan apa pun. Kami tidak akan memiliki tanggung jawab apa pun yang timbul dari atau relating ke penggunaan Anda atas alat opsional pihak ketiga.
        </p>
      </div>
      <p className="text-sm">
        Penggunaan Anda atas alat opsional yang ditawarkan melalui situs ini sepenuhnya merupakan risiko dan kebijaksanaan Anda sendiri dan Anda harus memastikan bahwa Anda terbiasa dengan dan menyetujui syarat-syarat yang alat disediakan oleh penyedia pihak ketiga yang relevan.
      </p>
      <div className="p-5 bg-green-50 border border-green-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Fitur Baru</h4>
        <p className="text-sm">
          Kami dapat juga, di masa depan, menawarkan Layanan dan/atau fitur baru melalui situs web (termasuk rilis alat dan sumber daya baru). Fitur dan/atau Layanan baru tersebut juga akan tunduk pada Syarat Layanan ini.
        </p>
      </div>
    </div>
  ),
  "tautan-ketiga": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Konten, produk dan Layanan tertentu yang tersedia melalui Layanan kami may include materi dari pihak ketiga.
      </p>
      <p className="text-sm">
        Tautan pihak ketiga di situs ini dapat mengarahkan Anda ke situs web pihak ketiga yang tidak terafiliasi dengan kami. Kami tidak bertanggung jawab untuk memeriksa atau mengevaluasi konten atau keakuratan dan kami tidak warranty dan tidak akan memiliki tanggung jawab atau bertanggung jawab atas materi atau situs web pihak ketiga mana pun, atau untuk materi, produk, atau Layanan lain dari pihak ketiga.
      </p>
      <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">⚠️ Tanggung Jawab</h4>
        <p className="text-sm">
          Kami tidak bertanggung jawab atas bahaya atau kerusakan yang terkait dengan purchase atau penggunaan barang, Layanan, sumber daya, konten, atau transaksi lain yang dilakukan sehubungan dengan situs web pihak ketiga mana pun. Harap tinjau dengan cermat kebijakan dan praktik pihak ketiga dan pastikan Anda memahaminya sebelum terlibat dalam transaksi apa pun. Keluhan, klaim, kekhawatiran, atau pertanyaan mengenai produk pihak ketiga harus directed ke pihak ketiga.
        </p>
      </div>
    </div>
  ),
  "komentar-pengguna": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Jika, atas permintaan kami, Anda mengirimkan kiriman tertentu (misalnya entri kontes) atau tanpa permintaan dari kami, Anda mengirimkan ide, saran, proposal, rencana, atau materi lain secara online, melalui email, melalui surat biasa, atau sebaliknya (secara kolektif, 'komentar'), Anda setuju bahwa kami dapat, kapan saja, tanpa batasan, mengedit, menyalin, mempublikasikan, mendistribusikan, menerjemahkan dan dengan cara lain menggunakan dalam media apa pun komentar apa pun yang Anda teruskan kepada kami. Kami tidak berkewajiban untuk (1) menjaga komentar apa pun kerahasiaan; (2) membayar kompensasi untuk komentar apa pun; atau (3) menanggapi komentar apa pun.
      </p>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-3">Konten yang Dilarang</h4>
        <p className="text-sm mb-3">Kami dapat, tetapi tidak memiliki kewajiban untuk, memantau, mengedit atau menghapus konten yang menurut kami sendiri penilaian adalah ilegal, ofensif, mengancam, memfitnah, defamatory, pornografi, obscena atau else objected atau melanggar hak kekayaan intelektual pihak mana pun atau Syarat Layanan ini.</p>
        <ul className="space-y-2 text-sm">
          {[
            "Komentar melanggar hak pihak ketiga mana pun, termasuk hak cipta, merek dagang, privasi, kepribadian atau hak pribadi atau kepemilikan lainnya",
            "Komentar berisi materi yang memfitnah atau tidak lawful, abusive or obscene material",
            "Berisi virus atau malware lain yang dapat mempengaruhi pengoperasian Layanan atau situs web terkait mana pun",
            "Menggunakan alamat email palsu, berpura-pura menjadi orang selain diri Anda sendiri, atau menipu kami atau pihak ketiga tentang asal komentar"
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm">
        Anda sepenuhnya bertanggung jawab atas komentar yang Anda buat dan keakuratannya. Kami tidak bertanggung jawab dan tidak bertanggung jawab atas komentar apa pun yang posted oleh Anda atau pihak ketiga mana pun.
      </p>
    </div>
  ),
  "informasi-pribadi": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Penyampaian informasi pribadi Anda melalui toko diatur oleh Kebijakan Privasi kami, yang dapat viewed di sini.
      </p>
      <div className="p-5 bg-black text-white rounded-xl">
        <h4 className="font-medium mb-3">Kebijakan Privasi</h4>
        <p className="text-sm text-neutral-400">
          Kunjungi halaman Kebijakan Privasi kami untuk memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
        </p>
        <a href="/privacy" className="inline-flex items-center gap-2 mt-4 text-sm text-white hover:text-neutral-300 transition-colors">
          Lihat Kebijakan Privasi
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  ),
  "kesalahan-kati": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability.
      </p>
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Hak Kami</h4>
        <p className="text-sm">
          Kami berhak untuk memperbaiki setiap kesalahan, ketidakakuratan atau kelalaian, dan untuk mengubah atau memperbarui informasi atau membatalkan pesanan jika informasi dalam Layanan atau di situs web terkait mana pun tidak akurat kapan saja tanpa notice sebelumnya (terminggu setelah Anda mengajukan pesanan).
        </p>
      </div>
      <p className="text-sm">
        Kami tidak memiliki kewajiban untuk memperbarui, mengamandemen atau memperjelaskan informasi dalam Layanan atau di situs web terkait mana pun, termasuk tanpa batasan, informasi harga, kecuali sebagaimana disyaratkan oleh hukum. Tidak ada refresh atau tanggal pembaruan yang ditentukan diterapkan dalam Layanan atau di situs web terkait mana pun, akan menunjukkan bahwa semua informasi dalam Layanan atau di situs web terkait mana pun telah dimodifikasi atau diperbarui.
      </p>
    </div>
  ),
  "penggunaan-terlarang": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm mb-4">
        Selain larangan lain yang forth dalam Syarat Layanan, Anda dilarang menggunakan situs atau kontennya: (a) untuk tujuan unlawful; (b) untuk meminta orang lain untuk melakukan atau berpartisipasi dalam tindakan ilegal; (c) untuk melanggar internasional, federal, provincial atau state regulations, rules, laws, or local ordinances; (d) untuk infring upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, Disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) untuk menyerahkan false or misleading information; (g) untuk mengunggah atau transmitsikan viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the Internet; (h) untuk collect or track the personal information of others; (i) untuk spam, phish, pharm, pretext, spider, crawl, or scrape; (j) untuk obscene or immoral purpose; or (k) untuk interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet.
      </p>
      <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Konsekuensi</h4>
        <p className="text-sm">
          Kami berhak untuk menghentikan penggunaan Anda atas Layanan atau situs web terkait mana pun untuk melanggar salah satu penggunaan terlarang.
        </p>
      </div>
    </div>
  ),
  "penafian": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Batasan Garantii</h4>
        <p className="text-sm">
          Kami tidak menjamin, mewakili atau warranted bahwa penggunaan layanan kami akan uninterrupted, timely, secure or error-free.
        </p>
        <p className="text-sm mt-3">
          Kami tidak menjamin bahwa hasil yang may be obtained from the use of the Service will be accurate or reliable.
        </p>
        <p className="text-sm mt-3">
          Anda setuju bahwa dari waktu ke waktu kami dapat menghapus Layanan untuk periode waktu yang tidak terbatas atau membatalkan Layanan kapan saja, tanpa notice kepada Anda.
        </p>
      </div>
      <p className="text-sm p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        Anda secara tegas agree bahwa penggunaan Anda, atau ketidakmampuan untuk menggunakan, Layanan adalah atas risiko Anda sendiri. Layanan dan semua produk dan Layanan delivered kepada Anda melalui Layanan adalah (kecuali sebagaimana expressly stated oleh kami) provided 'as is' dan 'as available' untuk penggunaan Anda, tanpa representasi, jaminan atau kondisi apa pun, baik yang tegas maupun yang tersirat, termasuk semua jaminan atau ketentuan tersirat dari merchantability, merchantable quality, kesesuaian untuk tujuan tertentu, daya tahan, title, dan non-infringement.
      </p>
      <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Batasan Tanggung Jawab</h4>
        <p className="text-sm">
          Dalam kasus apa pun, AYRES, direktur, pejabat, karyawan, afiliasi, agen, kontraktor, magang, pemasok, penyedia Layanan atau pemberi lisensi kami tidak akan bertanggung jawab atas cedera, kehilangan, klaim, atau damages langsung, tidak langsung, insidental, punishif, khusus, atau konseensial dari segala kind, termasuk, tanpa batasan, kehilangan keuntungan, kehilangan pendapatan, kehilangan tabungan, kehilangan data, biaya penggantian, atau damages serupa, apakah berdasarkan contract, tort (including negligence), strict liability atau lainnya, arising dari penggunaan Anda atas salah satu Layanan atau produk apa pun yang procured menggunakan Layanan, atau untuk klaim lain dalam bentuk apa pun yang berkaitan dengan penggunaan Anda atas Layanan atau produk apa pun, termasuk, tetapi tidak terbatas pada, kesalahan atau kelalaian dalam konten apa pun, atau kehilangan atau kerusakan apa pun yang ditimbulkan sebagai akibat dari penggunaan Layanan atau konten apa pun (atau produk) yang dipos, ditransmisikan, atau dibuat tersedia dengan cara lain melalui Layanan, bahkan jika telah disarankan of their possibility.
        </p>
      </div>
      <p className="text-xs text-neutral-500 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <strong>Catatan:</strong> Karena beberapa negara bagian atau yurisdiksi tidak mengizinkan pengecualian atau pembatasan tanggung jawab untuk damages konseensial atau insidental, dalam negara bagian atau yurisdiksi tersebut, tanggung jawab kami akan limited to batas maksimum yang diizinkan oleh hukum.
      </p>
    </div>
  ),
  "ganti-rugi": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Anda setuju untuk indemnify, membela dan menahan harmless AYRES dan induk, anak perusahaan, afiliasi, mitra, pejabat, direktur, agen, kontraktor, pemberi lisensi, penyedia Layanan, subkontraktor, pemasok, magang dan karyawan kami, dari klaim atau permintaan, termasuk attorneys' fees yang wajar, yang dibuat oleh pihak ketiga mana pun karena atau arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.
      </p>
    </div>
  ),
  "keterpisahan": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Dalam hal ketentuan mana pun dari Syarat Layanan ini ditemukan unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and bagian yang tidak dapat dipaksakan akan dianggap terputus dari Syarat Layanan ini, penentuan tersebut tidak akan mempengaruhi validitas dan enforceability of any other remaining provisions.
      </p>
    </div>
  ),
  "penghentian": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Kewajiban dan liabilitas parties yang terjadi sebelum tanggal penghentian akan survive penghentian agreement ini untuk semua keperluan.
      </p>
      <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-black mb-3">Penghentian</h4>
        <p className="text-sm">
          Syarat Layanan ini efektif kecuali dan sampai diakhiri oleh Anda atau kami. Anda dapat mengakhiri Syarat Layanan ini kapan saja dengan memberi tahu kami bahwa Anda tidak lagi Wish to use our Services, atau saat Anda berhenti menggunakan situs kami.
        </p>
        <p className="text-sm mt-3">
          Jika dalam penilaian kami Anda gagal, atau kami menduga bahwa Anda telah gagal, untuk comply with any term or provision of these Terms of Service, kami juga dapat menghentikan agreement ini kapan saja tanpa notice dan Anda akan tetap bertanggung jawab untuk semua jumlah yang terhutang hingga dan termasuk tanggal penghentian; dan/atau dengan demikian dapat menolak Anda access to our Services (or any part thereof).
        </p>
      </div>
    </div>
  ),
  "keseluruhan-perjanjian": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Kegagalan kami untuk menggunakan atau menerapkan hak atau provision dari Syarat Layanan ini tidak akan constitue a waiver of such right or provision.
      </p>
      <p className="text-sm">
        Syarat Layanan ini dan kebijakan atau aturan pengoperasian apa pun yang posted oleh kami di situs ini atau sehubungan dengan Layanan merupakan keseluruhan agreement dan understanding antara Anda dan kami dan mengatur penggunaan Anda atas Layanan, superseded semua agreement, komunikasi dan proposal sebelumnya atau kontemporer, baik oral atau written, antara Anda dan kami (termasuk, tetapi tidak terbatas pada, versi sebelumnya dari Syarat Layanan).
      </p>
      <p className="text-sm">
        Setiap ambiguities dalam interpretasi Syarat Layanan ini tidak boleh ditafsirkan tegen pihak yang menyusunnya.
      </p>
    </div>
  ),
  "hukum-yang-berlaku": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Syarat Layanan ini dan agreement terpisah apa pun yang mana kami menyediakan Layanan kepada Anda akan diatur oleh dan ditafsirkan sesuai dengan hukum Indonesia.
      </p>
      <div className="p-6 bg-black text-white rounded-2xl">
        <p className="text-sm text-neutral-400 mb-2">Yurisdiksi</p>
        <p className="font-medium">Hukum Republik Indonesia</p>
        <p className="text-sm text-neutral-400 mt-1">Semua sengketa akan diselesaikan di pengadilan yang berwenang di Indonesia</p>
      </div>
    </div>
  ),
  "perubahan-syarat": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Anda dapat meninjau versi paling terkini dari Syarat Layanan kapan saja di halaman ini.
      </p>
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-black mb-3">Hak Kami</h4>
        <p className="text-sm">
          Kami berhak, atas kebijaksanaan kami sendiri, untuk memperbarui, mengubah atau mengganti bagian mana pun dari Syarat Layanan ini dengan memposting pembaruan dan perubahan di situs web kami. Adalah tanggung jawab Anda untuk memeriksa situs web kami secara berkala untuk melihat perubahan. Continued use of or access to our website or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes.
        </p>
      </div>
    </div>
  ),
  "kontak": (
    <div className="space-y-4 text-neutral-600 leading-relaxed">
      <p className="text-sm">
        Pertanyaan tentang Syarat Layanan harus dikirim kepada kami di:
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

export default function TermsOfServicePage() {
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
      <section className="relative h-64 sm:h-80 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.15),transparent_60%),radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-4">
            Syarat Layanan
          </h1>
          <p className="text-sm text-neutral-400 max-w-md">
            Dengan menggunakan situs kami, Anda agreeing untuk terikat pada syarat dan ketentuan ini
          </p>
        </div>
      </section>

      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="hover:text-black cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-black font-medium">Syarat Layanan</span>
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