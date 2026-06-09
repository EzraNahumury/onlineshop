"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  fetchProvinces,
  fetchRegencies,
  fetchDistricts,
  fetchVillages,
  findByName,
  type Region,
} from "@/lib/location-api";
import type { AddressUI } from "./addresses-view";

export type AddressFormValues = {
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postal_code: string;
  address_line: string;
  address_detail: string;
  label: "rumah" | "kantor" | "lainnya";
  is_default: boolean;
};

export function AddressForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: AddressUI | null;
  onCancel: () => void;
  onSave: (values: AddressFormValues) => Promise<void>;
}) {
  const [receiverName, setReceiverName] = useState(initial?.receiver_name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postal_code ?? "");
  const [addressLine, setAddressLine] = useState(initial?.address_line ?? "");
  const [addressDetail, setAddressDetail] = useState(
    initial?.address_detail ?? ""
  );
  const [label, setLabel] = useState<"rumah" | "kantor" | "lainnya">(
    initial?.label ?? "rumah"
  );
  const [isDefault, setIsDefault] = useState<boolean>(
    initial?.is_default ?? false
  );

  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [regencyId, setRegencyId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");

  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingVill, setLoadingVill] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingProv(true);
    fetchProvinces()
      .then((list) => {
        if (cancelled) return;
        setProvinces(list);
        if (initial?.province) {
          const found = findByName(list, initial.province);
          if (found) setProvinceId(found.id);
        }
      })
      .catch(() => setError("Gagal memuat data provinsi."))
      .finally(() => !cancelled && setLoadingProv(false));
    return () => {
      cancelled = true;
    };
  }, [initial?.province]);

  // Load regencies when province changes
  useEffect(() => {
    if (!provinceId) {
      setRegencies([]);
      setRegencyId("");
      return;
    }
    let cancelled = false;
    setLoadingReg(true);
    fetchRegencies(provinceId)
      .then((list) => {
        if (cancelled) return;
        setRegencies(list);
        if (initial?.city) {
          const found = findByName(list, initial.city);
          if (found) {
            setRegencyId(found.id);
            return;
          }
        }
        setRegencyId("");
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingReg(false));
    return () => {
      cancelled = true;
    };
  }, [provinceId, initial?.city]);

  // Load districts when regency changes
  useEffect(() => {
    if (!regencyId) {
      setDistricts([]);
      setDistrictId("");
      return;
    }
    let cancelled = false;
    setLoadingDist(true);
    fetchDistricts(regencyId)
      .then((list) => {
        if (cancelled) return;
        setDistricts(list);
        if (initial?.district) {
          const found = findByName(list, initial.district);
          if (found) {
            setDistrictId(found.id);
            return;
          }
        }
        setDistrictId("");
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingDist(false));
    return () => {
      cancelled = true;
    };
  }, [regencyId, initial?.district]);

  // Load villages when district changes
  useEffect(() => {
    if (!districtId) {
      setVillages([]);
      setVillageId("");
      return;
    }
    let cancelled = false;
    setLoadingVill(true);
    fetchVillages(districtId)
      .then((list) => {
        if (cancelled) return;
        setVillages(list);
        if (initial?.village) {
          const found = findByName(list, initial.village);
          if (found) {
            setVillageId(found.id);
            return;
          }
        }
        setVillageId("");
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingVill(false));
    return () => {
      cancelled = true;
    };
  }, [districtId, initial?.village]);

  function nameOf(list: Region[], id: string) {
    return list.find((r) => r.id === id)?.name ?? "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const province = nameOf(provinces, provinceId);
    const city = nameOf(regencies, regencyId);
    const district = nameOf(districts, districtId);
    const village = nameOf(villages, villageId);

    if (!receiverName.trim() || !phone.trim()) {
      setError("Nama penerima & nomor telepon wajib diisi.");
      return;
    }
    if (!province || !city || !district || !village) {
      setError("Pilih provinsi, kota, kecamatan, dan kelurahan.");
      return;
    }
    if (!postalCode.trim() || !addressLine.trim()) {
      setError("Kode pos & alamat lengkap wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        receiver_name: receiverName.trim(),
        phone: phone.trim(),
        province,
        city,
        district,
        village,
        postal_code: postalCode.trim(),
        address_line: addressLine.trim(),
        address_detail: addressDetail.trim(),
        label,
        is_default: isDefault,
      });
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm ui-fade-in"
        onClick={onCancel}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden ui-dialog-in max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-black">
            {initial ? "Ubah Alamat" : "Tambah Alamat Baru"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg text-neutral-500 hover:bg-neutral-100 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-100 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Nama Penerima *"
              value={receiverName}
              onChange={setReceiverName}
            />
            <TextField
              label="Nomor Telepon *"
              value={phone}
              onChange={setPhone}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <Select
            label="Provinsi *"
            value={provinceId}
            onChange={setProvinceId}
            options={provinces}
            loading={loadingProv}
            placeholder="— Pilih provinsi —"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kota/Kabupaten *"
              value={regencyId}
              onChange={setRegencyId}
              options={regencies}
              loading={loadingReg}
              disabled={!provinceId}
              placeholder={
                provinceId ? "— Pilih kota —" : "Pilih provinsi dulu"
              }
            />
            <Select
              label="Kecamatan *"
              value={districtId}
              onChange={setDistrictId}
              options={districts}
              loading={loadingDist}
              disabled={!regencyId}
              placeholder={
                regencyId ? "— Pilih kecamatan —" : "Pilih kota dulu"
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kelurahan *"
              value={villageId}
              onChange={setVillageId}
              options={villages}
              loading={loadingVill}
              disabled={!districtId}
              placeholder={
                districtId ? "— Pilih kelurahan —" : "Pilih kecamatan dulu"
              }
            />
            <TextField
              label="Kode Pos *"
              value={postalCode}
              onChange={setPostalCode}
              placeholder="55281"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">
              Alamat Lengkap *
            </label>
            <textarea
              rows={2}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Nama jalan, nomor rumah, RT/RW"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>

          <TextField
            label="Detail Tambahan"
            value={addressDetail}
            onChange={setAddressDetail}
            placeholder="Patokan, lantai, dll. (opsional)"
          />

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">
              Label *
            </label>
            <div className="flex gap-2">
              {(["rumah", "kantor", "lainnya"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLabel(l)}
                  className={`px-4 h-9 rounded-full text-xs font-medium tracking-wide uppercase border transition-colors ${
                    label === l
                      ? "bg-black text-white border-black"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-black"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Jadikan alamat utama
          </label>
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Alamat"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-700 block mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  loading,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Region[];
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-700 block mb-1.5 flex items-center gap-1.5">
        {label}
        {loading && (
          <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
        )}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
