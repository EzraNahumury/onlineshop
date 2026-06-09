import { listAllCategories } from "@/lib/queries/admin/categories";
import { PageHeader } from "@/components/admin/page-header";
import { CategoriesView, type CategoryItem } from "./categories-view";

export const dynamic = "force-dynamic";

export default async function MasterCategoriesPage() {
  const cats = await listAllCategories();
  const items: CategoryItem[] = cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent_id,
    image_url: c.image_url,
    sort_order: c.sort_order,
    is_active: c.is_active === 1,
    product_count: Number(c.product_count) || 0,
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Kategori"
        description="Kelola kategori produk. Perubahan langsung tampil di etalase (carousel & filter)."
      />
      <CategoriesView categories={items} />
    </div>
  );
}
