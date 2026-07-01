import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import {
  getOrderForPayment,
  getPaymentConfirmation,
  createPaymentConfirmation,
} from "@/lib/queries/payment";
import { BANK_ACCOUNTS, bankAccountLabel } from "@/lib/payment-config";

// One-click confirmation: the customer just says "I've paid" — no form, no
// proof upload. We already know the bank account, the exact amount (with
// its unique 3-digit code), and who's confirming, so admin verifies by
// matching that amount against their bank statement rather than a manual
// form + screenshot.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan login dulu." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const orderNumber = String(body.order_number || "").trim();
  if (!orderNumber) {
    return NextResponse.json({ error: "Pesanan tidak valid." }, { status: 400 });
  }

  const order = await getOrderForPayment(user.id, orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (!["unpaid", "pending_payment"].includes(order.order_status)) {
    return NextResponse.json(
      { error: "Pesanan ini tidak dalam status menunggu pembayaran." },
      { status: 409 }
    );
  }

  // Idempotent — re-clicking after already confirming just succeeds quietly.
  const existing = await getPaymentConfirmation(order.id);
  if (existing) {
    return NextResponse.json({ ok: true, order_number: orderNumber });
  }

  const bank = BANK_ACCOUNTS[0];
  const amount = Number(order.invoice_amount ?? order.grand_total);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

  await createPaymentConfirmation({
    orderId: order.id,
    invoiceId: order.invoice_id,
    senderName: user.name,
    bankCode: bank.code,
    bankLabel: bankAccountLabel(bank),
    transferDate: today,
    amount,
    proofImage: null,
  });

  return NextResponse.json({ ok: true, order_number: orderNumber });
}
