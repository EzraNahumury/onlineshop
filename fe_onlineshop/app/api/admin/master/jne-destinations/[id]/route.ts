import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  deleteJneDestination,
  getJneDestinationById,
  isDestinationDuplicate,
  updateJneDestination,
} from "@/lib/queries/jne-destinations";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const destId = Number(id);
  if (!Number.isInteger(destId) || destId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getJneDestinationById(destId);
  if (!existing) {
    return NextResponse.json({ error: "Kode tujuan tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const jneCode = String(body.jne_code || "").trim();
  const label = String(body.label || "").trim();
  const city = String(body.city || "").trim();
  const province = body.province != null ? String(body.province).trim() : null;
  const district = body.district != null ? String(body.district).trim() : null;
  const isActive = body.is_active !== false;

  if (!jneCode) return NextResponse.json({ error: "Kode JNE wajib diisi" }, { status: 400 });
  if (!label) return NextResponse.json({ error: "Label wajib diisi" }, { status: 400 });
  if (!city) return NextResponse.json({ error: "Kota wajib diisi" }, { status: 400 });
  if (await isDestinationDuplicate(city, district, destId)) {
    return NextResponse.json(
      { error: "Kombinasi kota + kecamatan ini sudah ada" },
      { status: 409 }
    );
  }

  await updateJneDestination(destId, { jneCode, label, province, city, district, isActive });

  await writeAuditLog({
    adminId: admin.id,
    action: "update_jne_destination",
    entityType: "jne_destination",
    entityId: destId,
    oldValues: existing,
    newValues: { jneCode, label, province, city, district, isActive },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const destId = Number(id);
  if (!Number.isInteger(destId) || destId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getJneDestinationById(destId);
  if (!existing) {
    return NextResponse.json({ error: "Kode tujuan tidak ditemukan" }, { status: 404 });
  }

  await deleteJneDestination(destId);

  await writeAuditLog({
    adminId: admin.id,
    action: "delete_jne_destination",
    entityType: "jne_destination",
    entityId: destId,
    oldValues: existing,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
