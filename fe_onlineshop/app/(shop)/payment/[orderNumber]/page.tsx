import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getOrderForPayment, getPaymentConfirmation } from "@/lib/queries/payment";
import { BANK_ACCOUNTS } from "@/lib/payment-config";
import { PaymentView } from "./payment-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pembayaran",
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/payment/${orderNumber}`);

  const order = await getOrderForPayment(user.id, orderNumber);
  if (!order) notFound();

  // Already past the payment stage → nothing to pay here.
  if (!["unpaid", "pending_payment"].includes(order.order_status)) {
    redirect("/account/orders/pending");
  }

  const confirmation = await getPaymentConfirmation(order.id);
  const amount = Number(order.invoice_amount ?? order.grand_total);

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-12">
      <PaymentView
        orderNumber={order.order_number}
        amount={amount}
        expiresAt={order.expired_at ? new Date(order.expired_at).toISOString() : null}
        alreadyConfirmed={!!confirmation}
        bank={BANK_ACCOUNTS[0]}
      />
    </div>
  );
}
