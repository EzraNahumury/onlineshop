import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { getOrderForPayment, createPaymentConfirmation } from "@/lib/queries/payment";
import { savePaymentProof, UploadError } from "@/lib/upload";
import { findBankAccount, bankAccountLabel } from "@/lib/payment-config";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan login dulu." }, { status: 401 });
  }

  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Format tidak valid." }, { status: 415 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Data form tidak valid." }, { status: 400 });
  }

  const orderNumber = String(formData.get("order_number") || "").trim();
  const senderName = String(formData.get("sender_name") || "").trim();
  const bankCode = String(formData.get("bank_code") || "").trim();
  const transferDate = String(formData.get("transfer_date") || "").trim();
  const amount = Number(formData.get("amount"));

  if (!orderNumber || !senderName || !bankCode || !transferDate) {
    return NextResponse.json({ error: "Lengkapi semua field wajib." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transferDate)) {
    return NextResponse.json({ error: "Tanggal transfer tidak valid." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Jumlah transfer tidak valid." }, { status: 400 });
  }

  const bank = findBankAccount(bankCode);
  if (!bank) {
    return NextResponse.json({ error: "Rekening tujuan tidak valid." }, { status: 400 });
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

  // Optional proof image.
  let proofUrl: string | null = null;
  const file = formData.get("proof");
  if (file instanceof File && file.size > 0) {
    try {
      const saved = await savePaymentProof(file, orderNumber);
      proofUrl = saved.publicUrl;
    } catch (err) {
      if (err instanceof UploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  }

  await createPaymentConfirmation({
    orderId: order.id,
    invoiceId: order.invoice_id,
    senderName,
    bankCode: bank.code,
    bankLabel: bankAccountLabel(bank),
    transferDate,
    amount,
    proofImage: proofUrl,
  });

  return NextResponse.json({ ok: true, order_number: orderNumber });
}
