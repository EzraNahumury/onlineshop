import {
  listDisplayPromos,
  listDisplayPromoProducts,
} from "@/lib/queries/admin/display-promos";
import { PageHeader } from "@/components/admin/page-header";
import { DisplayPromosView, type DisplayPromoItem } from "./display-promos-view";

export const dynamic = "force-dynamic";

function toLocalInput(d: Date): string {
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
}

export default async function DisplayPromosPage() {
  const [promos, products] = await Promise.all([
    listDisplayPromos(),
    listDisplayPromoProducts(),
  ]);

  const byPromo = new Map<
    number,
    { id: number; name: string; image: string | null; stock: number }[]
  >();
  for (const p of products) {
    const arr = byPromo.get(p.display_promo_id) || [];
    arr.push({ id: p.id, name: p.name, image: p.image, stock: Number(p.stock) || 0 });
    byPromo.set(p.display_promo_id, arr);
  }

  const items: DisplayPromoItem[] = promos.map((dp) => ({
    id: dp.id,
    title: dp.title,
    subtitle: dp.subtitle,
    discount_type: dp.discount_type,
    discount_value: Number(dp.discount_value),
    stock: dp.stock != null ? Number(dp.stock) : null,
    start_at: toLocalInput(dp.start_at),
    end_at: toLocalInput(dp.end_at),
    is_active: dp.is_active === 1,
    products: byPromo.get(dp.id) || [],
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Display Promo"
        description="Banner promo + hitung mundur yang tampil di beranda. Pilih produk, jenis & nominal diskon, lalu durasinya."
      />
      <DisplayPromosView promos={items} />
    </div>
  );
}
