"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatThousands } from "@/lib/utils";

interface BankOption {
  code: string;
  bank: string;
  accountNumber: string;
  accountName: string;
}

export function ConfirmForm({
  orderNumber,
  amount,
  banks,
}: {
  orderNumber: string;
  amount: number;
  banks: BankOption[];
}) {
  const router = useRouter();
  const [senderName, setSenderName] = useState("");
  const [bankCode, setBankCode] = useState(banks[0]?.code ?? "");
  const selectedBank = banks.find((b) => b.code === bankCode);
  const [transferDate, setTransferDate] = useState("");
  // Jumlah transfer dikunci ke total tagihan (termasuk kode unik) — tidak bisa diubah.
  const transferAmount = String(Math.round(amount));
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!senderName.trim()) return setError("Nama pemilik rekening wajib diisi.");
    if (!bankCode) return setError("Pilih rekening tujuan.");
    if (!transferDate) return setError("Tanggal transfer wajib diisi.");
    const amt = Number(transferAmount);
    if (!Number.isFinite(amt) || amt <= 0) return setError("Jumlah transfer tidak valid.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("order_number", orderNumber);
      fd.append("sender_name", senderName.trim());
      fd.append("bank_code", bankCode);
      fd.append("transfer_date", transferDate);
      fd.append("amount", String(amt));
      if (file) fd.append("proof", file);

      const res = await fetch("/api/payment/confirm", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim konfirmasi.");
        return;
      }
      toast.success("Konfirmasi pembayaran terkirim. Menunggu verifikasi admin.");
      router.push(`/payment/${orderNumber}`);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7">
      <Link
        href={`/payment/${orderNumber}`}
        className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-black mb-5"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Kembali ke halaman pembayaran
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <Field label="Order ID" required>
          <input
            value={orderNumber}
            readOnly
            className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-600"
          />
        </Field>

        <Field label="Atas Nama Rekening" required>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Pemilik Rekening"
            className="w-full h-11 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </Field>

        <Field label="Transfer ke" required>
          <div className="relative">
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full h-11 pl-3 pr-10 rounded-lg border border-neutral-300 text-sm bg-white appearance-none truncate focus:outline-none focus:ring-2 focus:ring-black"
              required
            >
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.bank} - {b.accountNumber}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          </div>
          {selectedBank && (
            <p className="text-xs text-neutral-500 mt-1.5">
              a.n. <span className="font-medium text-neutral-700">{selectedBank.accountName}</span>
            </p>
          )}
        </Field>

        <Field label="Tanggal Transfer" required>
          <input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </Field>

        <Field label="Jumlah Transfer" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
              Rp
            </span>
            <input
              type="text"
              value={formatThousands(transferAmount)}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 focus:outline-none cursor-default"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1.5">
            Sesuai total tagihan (termasuk kode unik) — tidak bisa diubah.
          </p>
        </Field>

        <Field label="Bukti Transfer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-neutral-300 file:bg-neutral-50 file:text-sm file:font-medium hover:file:bg-neutral-100"
          />
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG, atau WEBP (maks 5MB).</p>
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Kirim
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
