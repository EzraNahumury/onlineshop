"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, MapPinned, Upload } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

export interface JneDestinationItem {
  id: number;
  jne_code: string;
  label: string;
  province: string | null;
  city: string;
  district: string | null;
  is_active: boolean;
}

export function JneDestinationsView({
  destinations,
}: {
  destinations: JneDestinationItem[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JneDestinationItem | null>(null);
  const [jneCode, setJneCode] = useState("");
  const [label, setLabel] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.jne_code.toLowerCase().includes(q) ||
        d.label.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        (d.district || "").toLowerCase().includes(q)
    );
  }, [destinations, search]);

  function openCreate() {
    setEditing(null);
    setJneCode("");
    setLabel("");
    setProvince("");
    setCity("");
    setDistrict("");
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(d: JneDestinationItem) {
    setEditing(d);
    setJneCode(d.jne_code);
    setLabel(d.label);
    setProvince(d.province || "");
    setCity(d.city);
    setDistrict(d.district || "");
    setIsActive(d.is_active);
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        jne_code: jneCode,
        label,
        province: province || null,
        city,
        district: district || null,
        is_active: isActive,
      };
      const url = editing
        ? `/api/admin/master/jne-destinations/${editing.id}`
        : `/api/admin/master/jne-destinations`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Kode tujuan diperbarui" : "Kode tujuan ditambahkan");
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(d: JneDestinationItem) {
    const ok = await confirm({
      title: `Hapus kode tujuan "${d.jne_code}"?`,
      description: `Alamat pelanggan di ${d.city} akan kembali memakai ongkir flat sampai dimapping ulang.`,
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusyId(d.id);
    try {
      const res = await fetch(`/api/admin/master/jne-destinations/${d.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus");
        return;
      }
      toast.success("Kode tujuan dihapus");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  // Bulk paste format, one per line: jne_code,label,city,district,province
  // (district/province optional — trailing commas can be omitted).
  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    setBulkError(null);
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setBulkError("Tempel minimal 1 baris data.");
      return;
    }
    const items = lines.map((line) => {
      const [code, lbl, cty, dist, prov] = line.split(",").map((p) => p?.trim() || "");
      return { jne_code: code, label: lbl, city: cty, district: dist || null, province: prov || null };
    });

    setBulkSaving(true);
    try {
      const res = await fetch(`/api/admin/master/jne-destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBulkError(data.error || "Gagal mengimpor");
        return;
      }
      toast.success(`${data.created} kode tujuan ditambahkan${data.errors?.length ? `, ${data.errors.length} dilewati` : ""}`);
      setBulkOpen(false);
      setBulkText("");
      router.refresh();
    } finally {
      setBulkSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <MapPinned className="h-4 w-4" />
          {destinations.length} kode tujuan
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
            <Upload className="h-4 w-4" />
            Impor Massal
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Kode
          </Button>
        </div>
      </div>

      <Input
        id="jne-search"
        placeholder="Cari kode, kota, atau kecamatan…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-400">
            {destinations.length === 0
              ? 'Belum ada kode tujuan. Klik "Tambah Kode" atau "Impor Massal" untuk mulai.'
              : "Tidak ada hasil."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50/60 border-b border-neutral-100 text-xs text-neutral-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-2.5">Kode JNE</th>
                <th className="text-left px-5 py-2.5">Label</th>
                <th className="text-left px-5 py-2.5">Kota</th>
                <th className="text-left px-5 py-2.5">Kecamatan</th>
                <th className="text-left px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-2.5 font-mono text-xs text-neutral-700">{d.jne_code}</td>
                  <td className="px-5 py-2.5 text-neutral-800">{d.label}</td>
                  <td className="px-5 py-2.5 text-neutral-600">{d.city}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{d.district || "—"}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        d.is_active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {d.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(d)}
                        className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        disabled={busyId === d.id}
                        className="p-2 rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Kode Tujuan" : "Tambah Kode Tujuan"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <Input
            id="jne-code"
            label="Kode JNE *"
            placeholder="Sesuai daftar kode tujuan JNE Anda"
            value={jneCode}
            onChange={(e) => setJneCode(e.target.value)}
            required
          />
          <Input
            id="jne-label"
            label="Label *"
            placeholder='Contoh: "BUNGURSARI, TASIKMALAYA"'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <Input
            id="jne-city"
            label="Kota/Kabupaten *"
            placeholder="Harus sama persis dengan nama di alamat pelanggan"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <Input
            id="jne-district"
            label="Kecamatan (opsional)"
            placeholder="Kosongkan untuk berlaku ke seluruh kota"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <Input
            id="jne-province"
            label="Provinsi (opsional, catatan saja)"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Aktif (dipakai untuk pencocokan ongkir)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Impor Massal Kode Tujuan">
        <form onSubmit={handleBulkImport} className="space-y-3">
          {bulkError && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
              {bulkError}
            </div>
          )}
          <p className="text-xs text-neutral-500">
            Satu baris per kode tujuan, format: <code className="bg-neutral-100 px-1 rounded">kode,label,kota,kecamatan,provinsi</code>
            <br />
            Kecamatan dan provinsi opsional. Salin dari file referensi kode tujuan JNE Anda lalu sesuaikan formatnya.
          </p>
          <textarea
            rows={10}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"JKTC10000,JAKARTA PUSAT,KOTA JAKARTA PUSAT,,DKI JAKARTA\nYOGY10000,YOGYAKARTA,KOTA YOGYAKARTA,,DI YOGYAKARTA"}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={bulkSaving}>
              Impor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
