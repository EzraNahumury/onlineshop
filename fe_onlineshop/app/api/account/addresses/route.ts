import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import {
  listUserAddresses,
  createAddress,
  type AddressLabel,
} from "@/lib/queries/addresses";

function validate(body: any) {
  const required = [
    "receiver_name",
    "phone",
    "province",
    "city",
    "district",
    "postal_code",
    "address_line",
    "label",
  ] as const;
  for (const f of required) {
    if (!body?.[f] || String(body[f]).trim() === "") {
      return `${f} wajib diisi`;
    }
  }
  if (!["rumah", "kantor", "lainnya"].includes(body.label)) {
    return "label tidak valid";
  }
  return null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await listUserAddresses(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const id = await createAddress(user.id, {
    receiver_name: String(body.receiver_name).trim(),
    phone: String(body.phone).trim(),
    province: String(body.province).trim(),
    city: String(body.city).trim(),
    district: String(body.district).trim(),
    village: body.village ? String(body.village).trim() : null,
    postal_code: String(body.postal_code).trim(),
    address_line: String(body.address_line).trim(),
    address_detail: body.address_detail ? String(body.address_detail).trim() : null,
    label: body.label as AddressLabel,
    is_default: !!body.is_default,
  });

  return NextResponse.json({ ok: true, id });
}
