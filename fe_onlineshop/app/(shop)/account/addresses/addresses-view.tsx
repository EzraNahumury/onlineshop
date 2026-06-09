"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Star, Pencil, Trash2 } from "lucide-react";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";
import { AddressForm, type AddressFormValues } from "./address-form";

export type AddressUI = {
  id: number;
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  village: string | null;
  postal_code: string;
  address_line: string;
  address_detail: string | null;
  label: "rumah" | "kantor" | "lainnya";
  is_default: boolean;
};

const labelStyle: Record<string, string> = {
  rumah: "bg-emerald-50 text-emerald-700 border-emerald-100",
  kantor: "bg-blue-50 text-blue-700 border-blue-100",
  lainnya: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

export function AddressesView({ initial }: { initial: AddressUI[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<AddressUI | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleSave(values: AddressFormValues) {
    const isEdit = editing !== null;
    const url = isEdit
      ? `/api/account/addresses/${editing!.id}`
      : `/api/account/addresses`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Gagal menyimpan alamat");
      return;
    }
    toast.success(isEdit ? "Alamat diperbarui" : "Alamat ditambahkan");
    setOpenForm(false);
    setEditing(null);
    refresh();
  }

  async function handleDelete(item: AddressUI) {
    const ok = await confirm({
      title: `Hapus alamat "${item.receiver_name}"?`,
      description: "Alamat akan dihapus permanen.",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/account/addresses/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus alamat");
        return;
      }
      setItems((prev) => prev.filter((a) => a.id !== item.id));
      toast.success("Alamat dihapus");
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-black">Daftar Alamat</h1>

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-400">
            Data kosong
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {items.map((a) => (
              <li key={a.id} className="p-5 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-sm font-medium text-black">
                      {a.receiver_name}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${labelStyle[a.label]}`}
                    >
                      {a.label}
                    </span>
                    {a.is_default && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        Utama
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600">{a.phone}</div>
                  <div className="text-sm text-neutral-500 mt-1 leading-relaxed">
                    {a.address_line}
                    {a.address_detail && ` (${a.address_detail})`}
                    {a.village && `, ${a.village}`}
                    {a.district && `, ${a.district}`}
                    {a.city && `, ${a.city}`}
                    {a.province && `, ${a.province}`}
                    {a.postal_code && ` ${a.postal_code}`}
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(a);
                      setOpenForm(true);
                    }}
                    className="w-9 h-9 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-black flex items-center justify-center transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a)}
                    disabled={busyId === a.id}
                    className="w-9 h-9 rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-50"
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 border-t border-neutral-100 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Alamat
        </button>
      </div>

      {openForm && (
        <AddressForm
          initial={editing}
          onCancel={() => {
            setOpenForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
