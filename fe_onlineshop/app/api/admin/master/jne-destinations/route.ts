import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  createJneDestination,
  isDestinationDuplicate,
  listJneDestinations,
} from "@/lib/queries/jne-destinations";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const search = req.nextUrl.searchParams.get("q") || undefined;
  const rows = await listJneDestinations(search);
  return NextResponse.json({ ok: true, items: rows });
}

interface DestinationPayload {
  jne_code?: unknown;
  label?: unknown;
  province?: unknown;
  city?: unknown;
  district?: unknown;
  is_active?: unknown;
}

function parseInput(body: DestinationPayload) {
  const jneCode = String(body.jne_code || "").trim();
  const label = String(body.label || "").trim();
  const city = String(body.city || "").trim();
  const province = body.province != null ? String(body.province).trim() : null;
  const district = body.district != null ? String(body.district).trim() : null;
  const isActive = body.is_active !== false;
  return { jneCode, label, province, city, district, isActive };
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Bulk import: { items: [{jne_code, label, city, district, province?}, ...] }
  if (Array.isArray(body.items)) {
    let created = 0;
    const errors: string[] = [];
    for (const raw of body.items) {
      const input = parseInput(raw);
      if (!input.jneCode || !input.label || !input.city) {
        errors.push(`Baris dilewati (data tidak lengkap): ${JSON.stringify(raw)}`);
        continue;
      }
      if (await isDestinationDuplicate(input.city, input.district)) {
        errors.push(`"${input.city}${input.district ? ` / ${input.district}` : ""}" sudah ada, dilewati.`);
        continue;
      }
      await createJneDestination(input);
      created += 1;
    }
    await writeAuditLog({
      adminId: admin.id,
      action: "bulk_create_jne_destination",
      entityType: "jne_destination",
      entityId: 0,
      newValues: { created, skipped: errors.length },
      ipAddress: req.headers.get("x-forwarded-for"),
    });
    return NextResponse.json({ ok: true, created, errors });
  }

  const input = parseInput(body);
  if (!input.jneCode) {
    return NextResponse.json({ error: "Kode JNE wajib diisi" }, { status: 400 });
  }
  if (!input.label) {
    return NextResponse.json({ error: "Label wajib diisi" }, { status: 400 });
  }
  if (!input.city) {
    return NextResponse.json({ error: "Kota wajib diisi" }, { status: 400 });
  }
  if (await isDestinationDuplicate(input.city, input.district)) {
    return NextResponse.json(
      { error: "Kombinasi kota + kecamatan ini sudah ada" },
      { status: 409 }
    );
  }

  const id = await createJneDestination(input);

  await writeAuditLog({
    adminId: admin.id,
    action: "create_jne_destination",
    entityType: "jne_destination",
    entityId: id,
    newValues: input,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, id });
}
