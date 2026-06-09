import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getPromotionDetail,
  getStoreItems,
  getPackageTiers,
  getPackageItems,
  getComboMain,
  getComboAddons,
} from "@/lib/queries/admin/promotions";
import { PromoStatusBadge, PromoTypeLabel } from "@/components/admin/status-badge";
import { formatPrice } from "@/lib/utils";
import { PromoActionBar } from "./action-bar";
import { ItemActiveToggle } from "./item-toggle";

export const dynamic = "force-dynamic";

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promoId = Number(id);
  if (!Number.isInteger(promoId) || promoId <= 0) notFound();

  const promo = await getPromotionDetail(promoId);
  if (!promo) notFound();

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/admin/promotions"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Pusat Promosi
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 text-xs text-neutral-500">
            <PromoTypeLabel type={promo.type} />
          </div>
          <h1 className="text-2xl font-light text-black">{promo.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
            <PromoStatusBadge status={promo.status} />
            <span>·</span>
            <span>
              {new Date(promo.start_at).toLocaleString("id-ID")} –{" "}
              {new Date(promo.end_at).toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      <PromoActionBar id={promo.id} status={promo.status} />

      <div className="space-y-6 mt-6">
        {promo.type === "store_promo" && <StorePromoSection promotionId={promo.id} />}
        {promo.type === "package_discount" && <PackagePromoSection promotionId={promo.id} />}
        {promo.type === "combo_deal" && <ComboPromoSection promotionId={promo.id} />}
      </div>
    </div>
  );
}

async function StorePromoSection({ promotionId }: { promotionId: number }) {
  const items = await getStoreItems(promotionId);
  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200">
        <h2 className="text-sm font-medium text-neutral-700">Produk Promo ({items.length})</h2>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-neutral-500">Belum ada produk.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="text-left px-5 py-2 font-medium">Produk</th>
                <th className="text-right px-3 py-2 font-medium">Harga Awal</th>
                <th className="text-right px-3 py-2 font-medium">Harga Diskon</th>
                <th className="text-right px-3 py-2 font-medium">Diskon</th>
                <th className="text-right px-3 py-2 font-medium">Stok</th>
                <th className="text-right px-3 py-2 font-medium">Terjual</th>
                <th className="text-right px-3 py-2 font-medium">Batas</th>
                <th className="text-center px-3 py-2 font-medium">Aktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-5 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                        {it.primary_image && (
                          <Image src={it.primary_image} alt="" fill sizes="36px" className="object-cover" />
                        )}
                      </div>
                      <div className="text-sm text-black truncate">{it.product_name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-500 line-through">
                    {formatPrice(Number(it.original_price))}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">
                    {formatPrice(Number(it.discount_price))}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-emerald-600 font-medium">
                    −{Math.round(Number(it.discount_percent || 0))}%
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{it.promo_stock}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-600">{it.promo_sold}</td>
                  <td className="px-3 py-2 text-right text-neutral-600">
                    {it.purchase_limit ?? "∞"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <ItemActiveToggle
                      promotionId={promotionId}
                      itemId={it.id}
                      kind="store"
                      defaultActive={it.is_active === 1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

async function PackagePromoSection({ promotionId }: { promotionId: number }) {
  const [tiers, items] = await Promise.all([
    getPackageTiers(promotionId),
    getPackageItems(promotionId),
  ]);

  function formatTier(t: typeof tiers[0]) {
    if (t.discount_type === "percentage") return `${Number(t.discount_value)}% off`;
    if (t.discount_type === "fixed_amount") return `Potongan ${formatPrice(Number(t.discount_value))}`;
    return `Harga paket ${formatPrice(Number(t.discount_value))}`;
  }

  return (
    <>
      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-medium text-neutral-700">Tingkatan Diskon ({tiers.length})</h2>
        </div>
        {tiers.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">Belum ada tingkatan.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {tiers.map((t) => (
              <li key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-black">Beli {t.min_quantity}+</span>
                  <span className="text-neutral-500"> · {formatTier(t)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-medium text-neutral-700">Produk Paket ({items.length})</h2>
        </div>
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">Belum ada produk.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {items.map((it) => (
              <li key={it.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                  {it.primary_image && (
                    <Image src={it.primary_image} alt="" fill sizes="36px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{it.product_name}</div>
                  <div className="text-xs text-neutral-500">{formatPrice(Number(it.base_price))}</div>
                </div>
                <ItemActiveToggle
                  promotionId={promotionId}
                  itemId={it.id}
                  kind="package"
                  defaultActive={it.is_active === 1}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

async function ComboPromoSection({ promotionId }: { promotionId: number }) {
  const [main, addons] = await Promise.all([
    getComboMain(promotionId),
    getComboAddons(promotionId),
  ]);

  return (
    <>
      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-medium text-neutral-700">Produk Utama ({main.length})</h2>
        </div>
        {main.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">Belum ada produk utama.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {main.map((m) => (
              <li key={m.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                  {m.primary_image && (
                    <Image src={m.primary_image} alt="" fill sizes="36px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{m.product_name}</div>
                  <div className="text-xs text-neutral-500">{formatPrice(Number(m.base_price))}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-medium text-neutral-700">Produk Tambahan ({addons.length})</h2>
        </div>
        {addons.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">Belum ada produk tambahan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Produk</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Normal</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Kombo</th>
                  <th className="text-right px-3 py-2 font-medium">Diskon</th>
                  <th className="text-right px-3 py-2 font-medium">Stok</th>
                  <th className="text-right px-3 py-2 font-medium">Batas</th>
                  <th className="text-center px-3 py-2 font-medium">Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {addons.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                          {a.primary_image && (
                            <Image src={a.primary_image} alt="" fill sizes="36px" className="object-cover" />
                          )}
                        </div>
                        <div className="text-sm text-black truncate">{a.product_name}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-neutral-500 line-through">
                      {formatPrice(Number(a.original_price))}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">
                      {formatPrice(Number(a.combo_price))}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-emerald-600 font-medium">
                      −{Math.round(Number(a.combo_discount_percent || 0))}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{a.stock}</td>
                    <td className="px-3 py-2 text-right text-neutral-600">
                      {a.purchase_limit ?? "∞"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <ItemActiveToggle
                        promotionId={promotionId}
                        itemId={a.id}
                        kind="combo_addon"
                        defaultActive={a.is_active === 1}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
