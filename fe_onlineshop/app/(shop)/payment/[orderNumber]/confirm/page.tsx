import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getOrderForPayment } from "@/lib/queries/payment";
import { BANK_ACCOUNTS } from "@/lib/payment-config";
import { ConfirmForm } from "./confirm-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Konfirmasi Pembayaran",
};

export default async function ConfirmPaymentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/payment/${orderNumber}/confirm`);

  const order = await getOrderForPayment(user.id, orderNumber);
  if (!order) notFound();
  if (!["unpaid", "pending_payment"].includes(order.order_status)) {
    redirect("/account/orders/pending");
  }

  const amount = Number(order.invoice_amount ?? order.grand_total);
  const banks = BANK_ACCOUNTS.map((b) => ({
    code: b.code,
    bank: b.bank,
    accountNumber: b.accountNumber,
    accountName: b.accountName,
  }));

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-display text-2xl font-light text-center mb-6">
        Konfirmasi Pembayaran
      </h1>
      <ConfirmForm
        orderNumber={order.order_number}
        amount={amount}
        banks={banks}
      />
    </div>
  );
}
