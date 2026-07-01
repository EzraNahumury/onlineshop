"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { BankAccount } from "@/lib/payment-config";

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Tersalin" : label}
    </button>
  );
}

export function PaymentView({
  orderNumber,
  amount,
  expiresAt,
  alreadyConfirmed,
  bank,
}: {
  orderNumber: string;
  amount: number;
  expiresAt: string | null;
  alreadyConfirmed: boolean;
  bank: BankAccount;
}) {
  const router = useRouter();
  const remaining = useCountdown(expiresAt);
  const minutes = remaining != null ? Math.floor(remaining / 60) : 0;
  const seconds = remaining != null ? remaining % 60 : 0;
  const expired = remaining != null && remaining <= 0;

  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showThanks, setShowThanks] = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error || "Gagal mengonfirmasi pembayaran.");
        return;
      }
      setShowThanks(true);
    } catch {
      setConfirmError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setConfirming(false);
    }
  }

  function closeThanks() {
    setShowThanks(false);
    router.refresh();
  }

  const deadlineText = expiresAt
    ? new Date(expiresAt).toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Countdown */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-6 py-5 text-center">
        <p className="text-xs text-neutral-500 mb-3">Sisa waktu pembayaran anda</p>
        <div className="flex items-center justify-center gap-4">
          <TimeBox value={minutes} label="Menit" expired={expired} />
          <span className="text-2xl font-light text-neutral-400">:</span>
          <TimeBox value={seconds} label="Detik" expired={expired} />
        </div>
        {deadlineText && (
          <p className="text-xs text-neutral-400 mt-3 italic">
            (Sebelum {deadlineText} WIB)
          </p>
        )}
      </div>

      {expired ? (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl text-center">
          Batas waktu pembayaran sudah lewat. Silakan hubungi admin atau buat pesanan baru.
        </div>
      ) : (
        <>
          <div className="text-center space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl font-light leading-snug">
              Untuk menyelesaikan proses order,
              <br />
              silahkan transfer sejumlah
            </h1>
          </div>

          <div className="text-center space-y-3">
            <p className="text-3xl font-bold text-emerald-600 tabular-nums">
              {formatPrice(amount)}
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-3 py-2 rounded-md inline-block">
              PENTING! Mohon transfer sesuai sampai dengan 3 digit terakhir
            </div>
            <div className="flex justify-center">
              <CopyButton value={String(Math.round(amount))} label="Salin Jumlah" />
            </div>
          </div>

          {/* Bank card */}
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-3">ke rekening bank berikut ini:</p>
            <div className="border border-dashed border-neutral-300 rounded-xl p-5 max-w-xs mx-auto space-y-2">
              <p className="font-bold text-blue-700 text-lg tracking-wide">{bank.bank}</p>
              <p className="text-sm">
                No. Rek: <span className="font-semibold">{bank.accountNumber}</span>
              </p>
              <p className="text-sm">
                Atas nama: <span className="font-semibold">{bank.accountName}</span>
              </p>
              <div className="pt-1 flex justify-center">
                <CopyButton value={bank.accountNumber} label="Salin No. Rekening" />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="text-center text-sm text-neutral-600">
        {alreadyConfirmed ? (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl">
            Konfirmasi pembayaran sudah dikirim & sedang menunggu verifikasi admin.
          </div>
        ) : (
          <div className="space-y-2">
            {confirmError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
                {confirmError}
              </div>
            )}
            <p className="text-neutral-500">Sudah transfer sejumlah di atas?</p>
            <Button onClick={handleConfirm} loading={confirming} disabled={expired}>
              Konfirmasi Pembayaran
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <Clock className="h-3 w-3" />
        Order: {orderNumber}
      </div>

      {showThanks && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm ui-fade-in"
            onClick={closeThanks}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden ui-dialog-in p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-1.5">
              Terima kasih sudah memesan!
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Konfirmasi pembayaran Anda sudah kami terima. Tim kami akan segera
              memeriksa &amp; memverifikasi pesanan Anda.
            </p>
            <Button className="w-full" onClick={() => router.push("/account/orders/pending")}>
              Lihat Status Pesanan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeBox({ value, label, expired }: { value: number; label: string; expired: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-4xl font-light tabular-nums ${expired ? "text-red-500" : "text-black"}`}
      >
        {value}
      </span>
      <span className="text-xs text-neutral-500 mt-1">{label}</span>
    </div>
  );
}
