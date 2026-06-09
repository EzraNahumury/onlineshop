import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function GET() {
  const [products] = await db.query<RowDataPacket[]>(
    `SELECT p.*,
            c.name as category_name, c.slug as category_slug,
            b.name as brand_name
     FROM products p
     LEFT JOIN product_categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     WHERE p.status = 'live'
     ORDER BY p.created_at DESC`
  );

  return NextResponse.json(products);
}
