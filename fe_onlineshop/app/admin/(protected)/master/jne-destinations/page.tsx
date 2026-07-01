import { listJneDestinations } from "@/lib/queries/jne-destinations";
import { PageHeader } from "@/components/admin/page-header";
import { JneDestinationsView, type JneDestinationItem } from "./jne-destinations-view";

export const dynamic = "force-dynamic";

export default async function MasterJneDestinationsPage() {
  const rows = await listJneDestinations();
  const items: JneDestinationItem[] = rows.map((r) => ({
    id: r.id,
    jne_code: r.jne_code,
    label: r.label,
    province: r.province,
    city: r.city,
    district: r.district,
    is_active: r.is_active === 1,
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Kode Tujuan JNE"
        description="Pemetaan kota/kecamatan pelanggan ke kode tujuan JNE. Alamat yang belum termapping otomatis memakai ongkir flat."
      />
      <JneDestinationsView destinations={items} />
    </div>
  );
}
