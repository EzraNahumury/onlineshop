// Konfigurasi pembayaran transfer manual.
// Edit daftar rekening di sini bila berubah.

export interface BankAccount {
  code: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  logoUrl?: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    code: "bca",
    bank: "BCA",
    accountNumber: "8465109668",
    accountName: "Arya Chandratama Rahadhyan",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
  },
];

export function bankAccountLabel(b: BankAccount): string {
  return `${b.bank} - ${b.accountName} - ${b.accountNumber}`;
}

export function findBankAccount(code: string): BankAccount | null {
  return BANK_ACCOUNTS.find((b) => b.code === code) || null;
}

// Batas waktu pembayaran (menit) — countdown di halaman pembayaran.
export const PAYMENT_WINDOW_MINUTES = 60;

// Ongkir gratis bila subtotal >= ambang ini, selain itu kena tarif flat.
export const FREE_SHIPPING_THRESHOLD = 500_000;
export const FLAT_SHIPPING_FEE = 20_000;
