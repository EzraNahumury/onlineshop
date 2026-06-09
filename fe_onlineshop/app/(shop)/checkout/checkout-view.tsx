"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, selectCartTotal } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop";

export interface CheckoutAddress {
  id: number;
  receiver_name: string;
  phone: string;
  label: string;
  address_line: string;
  address_detail: string | null;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export function CheckoutView({
  addresses,
  freeShippingThreshold,
  flatShippingFee,
}: {
  addresses: CheckoutAddress[];
  freeShippingThreshold: number;
  flatShippingFee: number;
}) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return useCart.persist.hasHydrated();
  });
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectCartTotal);
  const clear = useCart((s) => s.clear);

  const [selectedAddress, setSelectedAddress] = useState<number | null>(
    addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useCart.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useCart.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  const shipping = subtotal >= freeShippingThreshold ? 0 : flatShippingFee;
  const estTotal = subtotal + shipping;

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setError("Pilih alamat pengiriman dulu.");
      return;
    }
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address_id: selectedAddress,
          items: items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat pesanan.");
        return;
      }
      clear();
      router.push(`/payment/${data.order_number}`);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="text-center py-20 text-neutral-400 text-sm">Memuat…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-base text-neutral-700 font-medium mb-1">Keranjang kosong</p>
        <p className="text-sm text-neutral-500 mb-6">
          Tambahkan produk dulu sebelum checkout.
        </p>
        <Link href="/collections">
          <Button>Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Alamat */}
        <section className="bg-white rounded-2xl border border-neutral-100 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-500" />
              Alamat Pengiriman
            </h2>
            <Link
              href="/account/addresses"
              className="text-xs text-neutral-500 hover:text-black inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Kelola Alamat
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="text-sm text-neutral-500 py-4 text-center">
              Belum ada alamat.{" "}
              <Link href="/account/addresses" className="text-black font-medium hover:underline">
                Tambah alamat dulu
              </Link>{" "}
              untuk melanjutkan.
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddress === a.id
                      ? "border-black bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === a.id}
                    onChange={() => setSelectedAddress(a.id)}
                    className="mt-1"
                  />
                  <div className="text-sm min-w-0">
                    <div className="font-medium text-black">
                      {a.receiver_name}{" "}
                      <span className="text-xs uppercase tracking-wide text-neutral-400 ml-1">
                        {a.label}
                      </span>
                      {a.is_default && (
                        <span className="ml-2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded">
                          Utama
                        </span>
                      )}
                    </div>
                    <div className="text-neutral-500">{a.phone}</div>
                    <div className="text-neutral-600">
                      {a.address_line}
                      {a.address_detail ? `, ${a.address_detail}` : ""}
                    </div>
                    <div className="text-neutral-500">
                      {[a.district, a.city, a.province, a.postal_code].filter(Boolean).join(", ")}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Item */}
        <section className="bg-white rounded-2xl border border-neutral-100 p-5 sm:p-6">
          <h2 className="text-base font-medium mb-4">Ringkasan Item ({items.length})</h2>
          <ul className="divide-y divide-neutral-100">
            {items.map((it) => (
              <li
                key={`${it.productId}-${it.variantId ?? "none"}`}
                className="py-3 flex gap-3 items-center"
              >
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                  <Image
                    src={it.imageUrl || PLACEHOLDER}
                    alt={it.productName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black line-clamp-1">
                    {it.productName}
                  </div>
                  {it.variantLabel && (
                    <div className="text-xs text-neutral-500">{it.variantLabel}</div>
                  )}
                  <div className="text-xs text-neutral-500">
                    {it.quantity} × {formatPrice(it.unitPrice)}
                  </div>
                </div>
                <div className="text-sm font-medium tabular-nums">
                  {formatPrice(it.unitPrice * it.quantity)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Ringkasan pembayaran */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
          <h2 className="text-base font-medium">Ringkasan Pembayaran</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Ongkir</span>
              <span className="tabular-nums">
                {shipping === 0 ? "Gratis" : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-neutral-400">
                Gratis ongkir untuk belanja ≥ {formatPrice(freeShippingThreshold)}
              </p>
            )}
          </div>
          <div className="border-t border-neutral-100 pt-3 flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(estTotal)}</span>
          </div>
          <p className="text-xs text-neutral-400">
            Kode unik 3 digit akan ditambahkan ke total saat pembayaran agar mudah
            diverifikasi.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handlePlaceOrder}
            loading={submitting}
            disabled={addresses.length === 0}
          >
            Buat Pesanan
          </Button>
          <Link
            href="/cart"
            className="block text-center text-xs text-neutral-500 hover:text-black"
          >
            Kembali ke Keranjang
          </Link>
        </div>
      </aside>
    </div>
  );
}
