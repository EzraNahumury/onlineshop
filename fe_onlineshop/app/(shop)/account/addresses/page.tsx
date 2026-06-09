import { getCurrentUser } from "@/lib/user-auth";
import { listUserAddresses } from "@/lib/queries/addresses";
import { AddressesView } from "./addresses-view";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const addresses = await listUserAddresses(user.id);
  return (
    <AddressesView
      initial={addresses.map((a) => ({
        id: a.id,
        receiver_name: a.receiver_name,
        phone: a.phone,
        province: a.province,
        city: a.city,
        district: a.district,
        village: a.village,
        postal_code: a.postal_code,
        address_line: a.address_line,
        address_detail: a.address_detail,
        label: a.label,
        is_default: a.is_default === 1,
      }))}
    />
  );
}
