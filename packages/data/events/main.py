import csv
import json
import glob
import os
import logging
from pathlib import Path


# =========================
# Logging setup
# =========================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
)
log = logging.getLogger(__name__)


# =========================
# Helpers
# =========================


def parse_value(value):
    if value is None:
        return None

    value = value.strip()
    if value == "":
        return None

    if value.isdigit() or (value.startswith("-") and value[1:].isdigit()):
        return int(value)

    try:
        return float(value)
    except ValueError:
        return value


def add_zero(number: int) -> str:
    return f"{number:02d}"


def sort_rows_by_month_date(rows):
    log.info("Sorting rows by month and date")

    def sort_key(row):
        month = row.get("month")
        date = row.get("date")

        return (
            month if isinstance(month, int) else 99,
            date if isinstance(date, int) else 99,
        )

    return sorted(rows, key=sort_key)


def get_missing_days_by_month(rows):
    DAYS_IN_MONTH = {
        1: 31,
        2: 29,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
    }

    result = {}

    for month, max_day in DAYS_IN_MONTH.items():
        existing_days = {
            r["date"]
            for r in rows
            if r.get("month") == month and isinstance(r.get("date"), int)
        }

        missing = [d for d in range(1, max_day + 1) if d not in existing_days]
        if missing:
            result[month] = missing

    return result


# =========================
# Configuration
# =========================

CSV_ROOT = Path("csv")
JSON_DIR = Path("json")
MERGED_CSV = CSV_ROOT / "all.csv"
MERGED_JSON = JSON_DIR / "all.json"

CSV_GLOB = "**/*.csv"  # recursive

CSV_ROOT.mkdir(exist_ok=True)
JSON_DIR.mkdir(exist_ok=True)


# =========================
# Discover CSV files (recursive)
# =========================

log.info("Scanning for CSV files under %s", CSV_ROOT.resolve())

csv_files = [
    p
    for p in CSV_ROOT.glob(CSV_GLOB)
    if p.is_file() and p.resolve() != MERGED_CSV.resolve()
]

if not csv_files:
    log.error("No CSV files found recursively under %s", CSV_ROOT)
    raise FileNotFoundError("No CSV files found")

log.info("Found %d CSV files (recursive)", len(csv_files))

for p in csv_files:
    depth = len(p.relative_to(CSV_ROOT).parts) - 1
    log.debug("  %s (depth=%d)", p, depth)


# =========================
# Merge CSV files
# =========================

log.info("Merging CSV files → %s", MERGED_CSV)

header = None
total_rows = 0

with MERGED_CSV.open("w", newline="", encoding="utf-8") as out:
    writer = None

    for csv_path in sorted(csv_files):
        log.info("Processing: %s", csv_path)

        with csv_path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            if not reader.fieldnames:
                log.warning("Skipping empty CSV: %s", csv_path)
                continue

            if header is None:
                header = reader.fieldnames
                writer = csv.DictWriter(out, fieldnames=header)
                writer.writeheader()
                log.debug("Header written: %s", header)
            elif reader.fieldnames != header:
                log.warning(
                    "Header mismatch in %s\nExpected: %s\nFound:    %s",
                    csv_path,
                    header,
                    reader.fieldnames,
                )
                continue

            file_rows = 0
            for row in reader:
                writer.writerow(row)
                file_rows += 1

            total_rows += file_rows
            log.info("  → %d rows merged", file_rows)

log.info("CSV merge complete (%d total rows)", total_rows)


# =========================
# Convert CSV → JSON
# =========================

log.info("Converting merged CSV → JSON")

with MERGED_CSV.open(newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = [{k: parse_value(v) for k, v in row.items()} for row in reader]

log.info("Parsed %d rows", len(rows))

rows = sort_rows_by_month_date(rows)

with MERGED_JSON.open("w", encoding="utf-8") as f:
    json.dump(rows, f, indent=2, ensure_ascii=False)

log.info("JSON written → %s", MERGED_JSON)


# =========================
# Missing dates report
# =========================

missing_dates = get_missing_days_by_month(rows)

log.info("Missing dates summary:")
for month, days in missing_dates.items():
    log.info(
        "Month %s: (%s missing) %s",
        add_zero(month),
        add_zero(len(days)),
        days,
    )

log.info("CSV merge + JSON conversion completed successfully")
