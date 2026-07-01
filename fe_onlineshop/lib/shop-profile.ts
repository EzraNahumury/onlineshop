// Identitas toko/gudang yang dipakai sebagai data SHIPPER saat membuat resi
// JNE otomatis (API Pickup/Cashless). Field kritis (phone, addr1, zip) SENGAJA
// tidak diberi default — harus diisi lewat environment variable dengan data
// gudang ASLI. isShopProfileComplete() di bawah memblokir pembuatan resi
// kalau salah satunya kosong, supaya kurir tidak pernah dijemput ke alamat
// palsu.
export const SHOP_PROFILE = {
  name: process.env.SHOP_NAME || "AYRES",
  contact: process.env.SHOP_CONTACT_NAME || "Admin AYRES",
  phone: process.env.SHOP_PHONE || "",
  addr1: process.env.SHOP_ADDRESS_1 || "",
  addr2: process.env.SHOP_ADDRESS_2 || "",
  district: process.env.SHOP_DISTRICT || "BANTUL",
  city: process.env.SHOP_CITY || "BANTUL",
  zip: process.env.SHOP_ZIP || "",
  region: process.env.SHOP_REGION || "DI YOGYAKARTA",
};

// Data pengirim di resi (AWB) harus alamat gudang yang nyata — membuat resi
// live dengan alamat placeholder akan mengirim kurir ke tempat yang salah.
// Tiga field ini wajib diisi via env sebelum resi otomatis boleh jalan.
export function isShopProfileComplete(): boolean {
  return Boolean(SHOP_PROFILE.phone && SHOP_PROFILE.addr1 && SHOP_PROFILE.zip);
}
