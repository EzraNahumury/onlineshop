"use client";

import { useEffect, useState } from "react";
import { useLanguage, type Lang } from "@/lib/store/language";

export const dictionary = {
  // Announcement & header
  "announcement.freeShipping": {
    id: "Gratis ongkir untuk pesanan di atas Rp 500.000",
    en: "Free shipping on orders over Rp 500.000",
  },
  "nav.newArrivals": { id: "Produk Baru", en: "New Arrivals" },
  "nav.tops": { id: "Atasan", en: "Tops" },
  "nav.bottoms": { id: "Bawahan", en: "Bottoms" },
  "nav.outerwear": { id: "Outerwear", en: "Outerwear" },
  "nav.dresses": { id: "Dress", en: "Dresses" },
  "nav.accessories": { id: "Aksesoris", en: "Accessories" },
  "nav.products": { id: "Produk", en: "Products" },
  "nav.apparel": { id: "Pakaian", en: "Apparel" },
  "nav.protective": { id: "Pelindung", en: "Protective Gear" },
  "nav.sale": { id: "Diskon", en: "Sale" },
  "nav.col.apparel": { id: "Pakaian", en: "Apparel" },
  "nav.col.protective": { id: "Pelindung", en: "Protective Gear" },
  "nav.col.accessories": { id: "Aksesoris", en: "Accessories" },
  "nav.tshirt": { id: "Kaos", en: "T-Shirt" },
  "nav.poloShirt": { id: "Polo Shirt", en: "Polo Shirt" },
  "nav.shirt": { id: "Kemeja", en: "Shirt" },
  "nav.vest": { id: "Rompi", en: "Vest" },
  "nav.jersey": { id: "Jersey", en: "Jersey" },
  "nav.jacket": { id: "Jaket", en: "Jackets" },
  "nav.shorts": { id: "Celana Pendek", en: "Shorts" },
  "nav.pants": { id: "Celana Panjang", en: "Pants" },
  "nav.shinguard": { id: "Custom Shinguard", en: "Custom Shinguard" },
  "nav.elbowPad": { id: "Elbow Pad", en: "Elbow Pad" },
  "nav.kneePad": { id: "Knee Pad", en: "Knee Pad" },
  "nav.cap": { id: "Topi", en: "Caps" },
  "nav.socks": { id: "Kaos Kaki", en: "Socks" },
  "nav.viewAll": { id: "Lihat Semua →", en: "View All →" },
  "search.title": { id: "Hasil pencarian", en: "Search results" },
  "search.for": { id: "untuk", en: "for" },
  "search.empty": {
    id: "Tidak ada produk yang cocok dengan pencarian Anda.",
    en: "No products match your search.",
  },
  "search.tryOther": {
    id: "Coba kata kunci lain atau jelajahi semua produk.",
    en: "Try a different keyword or browse all products.",
  },
  "search.browseAll": { id: "Lihat semua produk", en: "Browse all products" },
  "search.noQuery": {
    id: "Ketik kata kunci di kolom pencarian untuk mulai mencari.",
    en: "Type a keyword in the search box to begin.",
  },
  "search.results": {
    id: "{n} produk ditemukan",
    en: "{n} products found",
  },
  "nav.search": { id: "Cari", en: "Search" },
  "nav.account": { id: "Akun", en: "Account" },
  "nav.wishlist": { id: "Favorit", en: "Wishlist" },
  "nav.cart": { id: "Keranjang", en: "Cart" },
  "nav.signInRegister": { id: "Masuk / Daftar", en: "Sign In / Register" },
  "nav.searchPlaceholder": {
    id: "Cari produk…",
    en: "Search products…",
  },

  // Cart page
  "cart.title": { id: "Keranjang Belanja", en: "Shopping Cart" },
  "cart.loading": { id: "Memuat keranjang…", en: "Loading cart…" },
  "cart.empty.title": {
    id: "Keranjang Anda kosong",
    en: "Your cart is empty",
  },
  "cart.empty.subtitle": {
    id: "Yuk lihat produk-produk kami dan tambahkan ke keranjang.",
    en: "Browse our products and add items to your cart.",
  },
  "cart.empty.cta": { id: "Mulai Belanja", en: "Start Shopping" },
  "cart.summary": { id: "Ringkasan", en: "Summary" },
  "cart.subtotal": { id: "Subtotal", en: "Subtotal" },
  "cart.shipping": { id: "Ongkir", en: "Shipping" },
  "cart.shippingNote": {
    id: "Dihitung saat checkout",
    en: "Calculated at checkout",
  },
  "cart.total": { id: "Total", en: "Total" },
  "cart.checkout": { id: "Lanjut ke Checkout", en: "Proceed to Checkout" },
  "cart.continue": { id: "Lanjut Belanja", en: "Continue Shopping" },
  "cart.clear": { id: "Kosongkan keranjang", en: "Clear cart" },
  "cart.clearConfirm": {
    id: "Kosongkan seluruh keranjang?",
    en: "Clear the entire cart?",
  },
  "cart.removeTitle": {
    id: "Hapus dari keranjang",
    en: "Remove from cart",
  },

  // Product detail / variant selector
  "product.color": { id: "Warna", en: "Color" },
  "product.size": { id: "Ukuran", en: "Size" },
  "product.quantity": { id: "Jumlah", en: "Quantity" },
  "product.addToCart": { id: "Tambah ke Keranjang", en: "Add to Cart" },
  "product.added": { id: "Berhasil Ditambahkan!", en: "Added to Cart!" },
  "product.selectOptions": { id: "Pilih Opsi", en: "Select Options" },
  "product.buyNow": { id: "Beli Sekarang", en: "Buy Now" },
  "product.onlyLeft": {
    id: "Hanya tersisa {n}",
    en: "Only {n} left in stock",
  },
  "product.each": { id: "{p} per item", en: "({p} each)" },
  "product.sold": { id: "{n} terjual", en: "{n} sold" },
  "product.description": { id: "Deskripsi", en: "Description" },
  "product.shippingReturns": {
    id: "Pengiriman & Retur",
    en: "Shipping & Returns",
  },
  "product.youMayLike": { id: "Anda Mungkin Suka", en: "You May Also Like" },
  "product.weight": { id: "Berat: {n}g", en: "Weight: {n}g" },
  "product.shippingDays": {
    id: "Pengiriman standar: 2-5 hari kerja",
    en: "Standard delivery: 2-5 business days",
  },
  "product.returnPolicy": {
    id: "Kebijakan retur 30 hari",
    en: "30-day easy return policy",
  },
  "product.freeShippingMin": {
    id: "Gratis ongkir untuk pesanan di atas Rp 500.000",
    en: "Free shipping on orders over Rp 500.000",
  },

  // Footer
  "footer.newsletter": { id: "Newsletter", en: "Newsletter" },
  "footer.newsletterTitle": {
    id: "Jadilah yang pertama tahu tentang koleksi baru dan penawaran eksklusif",
    en: "Be the first to know about new collections and exclusive offers",
  },
  "footer.emailPlaceholder": {
    id: "Alamat email Anda",
    en: "Your email address",
  },
  "footer.subscribe": { id: "Berlangganan", en: "Subscribe" },
  "footer.brandTagline": {
    id: "DEADLINE AMAN!\nPOLA AYRES\nBEDA KELAS.",
    en: "DEADLINE AMAN!\nPOLA AYRES\nBEDA KELAS.",
  },
  "footer.shop": { id: "Belanja", en: "Shop" },
  "footer.help": { id: "Bantuan", en: "Help" },
  "footer.company": { id: "Perusahaan", en: "Company" },
  "footer.contactUs": { id: "Kontak Kami", en: "Contact Us" },
  "footer.shippingReturns": {
    id: "Pengiriman & Retur",
    en: "Shipping & Returns",
  },
  "footer.sizeGuide": { id: "Panduan Ukuran", en: "Size Guide" },
  "footer.faq": { id: "FAQ", en: "FAQ" },
  "footer.aboutUs": { id: "Tentang Kami", en: "About Us" },
  "footer.careers": { id: "Karir", en: "Careers" },
  "footer.privacy": { id: "Kebijakan Privasi", en: "Privacy Policy" },
  "footer.terms": { id: "Syarat Layanan", en: "Terms of Service" },
  "footer.allRights": {
    id: "Semua hak dilindungi.",
    en: "All rights reserved.",
  },
} as const;

export type DictKey = keyof typeof dictionary;

export function translate(key: DictKey, lang: Lang, vars?: Record<string, string | number>): string {
  let str: string = dictionary[key]?.[lang] ?? (key as string);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function useT() {
  const lang = useLanguage((s) => s.lang);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const effective: Lang = mounted ? lang : "id";

  return {
    lang: effective,
    t: (key: DictKey, vars?: Record<string, string | number>) =>
      translate(key, effective, vars),
  };
}
