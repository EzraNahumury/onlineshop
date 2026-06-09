import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface OrderForPayment {
  id: number;
  order_number: string;
  order_status: string;
  subtotal: string;
  shipping_amount: string;
  discount_amount: string;
  grand_total: string;
  unique_code: number | null;
  created_at: Date;
  invoice_id: number | null;
  invoice_amount: string | null;
  invoice_status: string | null;
  expired_at: Date | null;
}

// Order + its latest invoice, scoped to the owning user.
export async function getOrderForPayment(
  userId: number,
  orderNumber: string
): Promise<OrderForPayment | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT o.id, o.order_number, o.order_status, o.subtotal, o.shipping_amount,
            o.discount_amount, o.grand_total, o.unique_code, o.created_at,
            i.id AS invoice_id, i.amount AS invoice_amount, i.status AS invoice_status,
            i.expired_at
       FROM orders o
       LEFT JOIN invoices i ON i.order_id = o.id
      WHERE o.order_number = ? AND o.user_id = ?
      ORDER BY i.created_at DESC
      LIMIT 1`,
    [orderNumber, userId]
  );
  return (rows[0] as OrderForPayment) || null;
}

export interface PaymentConfirmationRow extends RowDataPacket {
  id: number;
  order_id: number;
  invoice_id: number | null;
  sender_name: string;
  bank_code: string;
  bank_label: string | null;
  transfer_date: string;
  amount: string;
  proof_image: string | null;
  status: "pending" | "verified" | "rejected";
  note: string | null;
  verified_by: string | null;
  verified_at: Date | null;
  created_at: Date;
}

export async function getPaymentConfirmation(
  orderId: number
): Promise<PaymentConfirmationRow | null> {
  const [rows] = await db.query<PaymentConfirmationRow[]>(
    `SELECT * FROM payment_confirmations
      WHERE order_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1`,
    [orderId]
  );
  return rows[0] || null;
}

export interface CreatePaymentConfirmationInput {
  orderId: number;
  invoiceId: number | null;
  senderName: string;
  bankCode: string;
  bankLabel: string | null;
  transferDate: string;
  amount: number;
  proofImage: string | null;
}

// Save the customer's transfer confirmation and move the order into
// "pending_payment" (still under the admin "Belum Bayar" tab) for review.
export async function createPaymentConfirmation(
  input: CreatePaymentConfirmationInput
): Promise<number> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.query<ResultSetHeader>(
      `INSERT INTO payment_confirmations
         (order_id, invoice_id, sender_name, bank_code, bank_label,
          transfer_date, amount, proof_image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        input.orderId,
        input.invoiceId,
        input.senderName,
        input.bankCode,
        input.bankLabel,
        input.transferDate,
        input.amount,
        input.proofImage,
      ]
    );

    await conn.query<ResultSetHeader>(
      `UPDATE orders SET order_status = 'pending_payment'
        WHERE id = ? AND order_status = 'unpaid'`,
      [input.orderId]
    );

    await conn.query<ResultSetHeader>(
      `INSERT INTO order_status_histories (order_id, from_status, to_status, note, changed_by)
       VALUES (?, 'unpaid', 'pending_payment', 'Bukti transfer dikirim customer', 'customer')`,
      [input.orderId]
    );

    await conn.commit();
    return res.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
