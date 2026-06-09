// Indonesian administrative data via emsifa/api-wilayah-indonesia
// Hosted on GitHub Pages — no auth, CORS-enabled, cached by CDN.
// Use the direct domain (not the GitHub Pages URL which 301-redirects and
// causes browsers to drop CORS headers during cross-origin redirect).
const BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";

export interface Region {
  id: string;
  name: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal memuat ${url}`);
  return res.json();
}

export function fetchProvinces(): Promise<Region[]> {
  return fetchJson<Region[]>(`${BASE}/provinces.json`);
}

export function fetchRegencies(provinceId: string): Promise<Region[]> {
  return fetchJson<Region[]>(`${BASE}/regencies/${provinceId}.json`);
}

export function fetchDistricts(regencyId: string): Promise<Region[]> {
  return fetchJson<Region[]>(`${BASE}/districts/${regencyId}.json`);
}

export function fetchVillages(districtId: string): Promise<Region[]> {
  return fetchJson<Region[]>(`${BASE}/villages/${districtId}.json`);
}

export function findByName(list: Region[], name: string): Region | undefined {
  const needle = name.trim().toLowerCase();
  return list.find((r) => r.name.trim().toLowerCase() === needle);
}
