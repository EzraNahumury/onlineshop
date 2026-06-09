import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { listUserAddresses } from "@/lib/queries/addresses";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/lib/payment-config";
import { CheckoutView, type CheckoutAddress } from "./checkout-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }

  const rows = await listUserAddresses(user.id);
  const addresses: CheckoutAddress[] = rows.map((a) => ({
    id: a.id,
    receiver_name: a.receiver_name,
    phone: a.phone,
    label: a.label,
    address_line: a.address_line,
    address_detail: a.address_detail,
    district: a.district,
    city: a.city,
    province: a.province,
    postal_code: a.postal_code,
    is_default: a.is_default === 1,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-display text-2xl sm:text-3xl font-light mb-6">Checkout</h1>
      <CheckoutView
        addresses={addresses}
        freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
        flatShippingFee={FLAT_SHIPPING_FEE}
      />
    </div>
  );
}
