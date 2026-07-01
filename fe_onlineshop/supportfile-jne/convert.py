import re
import openpyxl
from collections import defaultdict

WB = openpyxl.load_workbook("list_dest.xlsx", read_only=True, data_only=True)
WS = WB["Sheet 1"]

PREFIX_RE = re.compile(r"^(KABUPATEN\.?\s*|KAB\.?\s*|KOTA\.?\s*)+", re.IGNORECASE)
SUFFIX_KOTA_RE = re.compile(r"\s*-\s*KOTA\s*$", re.IGNORECASE)
PAREN_RE = re.compile(r"\s*\([^)]*\)\s*")
SPACE_RE = re.compile(r"\s+")


def norm_city(raw: str) -> str:
    s = raw.strip().upper()
    s = PREFIX_RE.sub("", s)
    s = SPACE_RE.sub(" ", s).strip()
    return s


def norm_district(raw: str) -> str:
    s = raw.strip().upper()
    s = SUFFIX_KOTA_RE.sub("", s)
    s = PAREN_RE.sub(" ", s)
    s = SPACE_RE.sub(" ", s).strip()
    return s


# Pass 1: collect raw rows.
raw_rows = []
for i, r in enumerate(WS.iter_rows(values_only=True)):
    if i == 0:
        continue
    prov, city, dist, sub, zipc, tariff = r[1], r[2], r[3], r[4], r[5], r[6]
    if not city or not dist or not tariff:
        continue
    raw_rows.append((str(prov).strip(), str(city).strip(), str(dist).strip(), str(tariff).strip()))

print(f"raw rows: {len(raw_rows)}")

# Pass 2: group by RAW (province, city, district) -> tariff codes, keep unambiguous.
raw_groups = defaultdict(set)
for prov, city, dist, tariff in raw_rows:
    raw_groups[(prov, city, dist)].add(tariff)

safe_raw = {k: next(iter(v)) for k, v in raw_groups.items() if len(v) == 1}
print(f"raw groups: {len(raw_groups)}, safe (unambiguous): {len(safe_raw)}")

# Pass 3: normalize city/district, regroup, drop anything that collides post-normalization.
norm_groups = defaultdict(set)
norm_label = {}
for (prov, city, dist), tariff in safe_raw.items():
    city_n = norm_city(city)
    dist_n = norm_district(dist)
    if not city_n or not dist_n:
        continue
    key = (prov, city_n, dist_n)
    norm_groups[key].add(tariff)
    norm_label[key] = f"{dist}, {city}"  # human-readable, original casing/spelling

final = {k: next(iter(v)) for k, v in norm_groups.items() if len(v) == 1}
dropped_collisions = len(norm_groups) - len(final)
print(f"normalized groups: {len(norm_groups)}, final safe: {len(final)}, dropped (post-normalize collisions): {dropped_collisions}")


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


rows_sql = []
for (prov, city_n, dist_n), tariff in sorted(final.items()):
    label = norm_label[(prov, city_n, dist_n)]
    rows_sql.append(
        f"('{esc(tariff)}','{esc(label)}','{esc(prov)}','{esc(city_n)}','{esc(dist_n)}',1)"
    )

CHUNK = 500
with open("jne_destinations_seed.sql", "w", encoding="utf-8") as f:
    for i in range(0, len(rows_sql), CHUNK):
        chunk = rows_sql[i : i + CHUNK]
        f.write(
            "INSERT INTO jne_destinations (jne_code, label, province, city, district, is_active) VALUES\n"
        )
        f.write(",\n".join(chunk))
        f.write(";\n\n")

print(f"wrote {len(rows_sql)} rows to jne_destinations_seed.sql")
