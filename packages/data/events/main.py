import csv
import json
import glob
import os
import logging


# =========================
# Logging setup
# =========================

logging.basicConfig(
    level=logging.INFO,  # change to DEBUG for more verbosity
    format="%(asctime)s | %(levelname)-7s | %(message)s",
)
log = logging.getLogger(__name__)


def parse_value(value):
    if value is None:
        return value

    value = value.strip()

    if value.isdigit() or (value.startswith("-") and value[1:].isdigit()):
        return int(value)

    try:
        return float(value)
    except ValueError:
        return value


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

    log.info("Calculating missing dates by month")

    for month in range(1, 13):
        max_day = DAYS_IN_MONTH[month]

        existing_days = {
            row["date"]
            for row in rows
            if row.get("month") == month and row.get("date") is not None
        }

        missing_days = [d for d in range(1, max_day + 1) if d not in existing_days]

        if missing_days:
            result[month] = missing_days
            log.debug(
                "Month %02d: %d missing days",
                month,
                len(missing_days),
            )

    return result


def add_zero(number: int) -> str:
    return f"{number:02d}"


def sort_rows_by_month_date(rows):
    log.info("Sorting rows by month and date")

    def sort_key(row):
        month = row.get("month")
        date = row.get("date")

        # Push invalid rows to the end safely
        month = month if isinstance(month, int) else 99
        date = date if isinstance(date, int) else 99

        return (month, date)

    sorted_rows = sorted(rows, key=sort_key)

    log.info("Sorted %d rows by (month, date)", len(sorted_rows))
    log.debug("First row after sort: %s", sorted_rows[0] if sorted_rows else None)
    log.debug("Last row after sort: %s", sorted_rows[-1] if sorted_rows else None)

    return sorted_rows


# =========================
# Merge CSV files
# =========================

CSV_DIR = "csv"
JSON_DIR = "json"

log.info("Starting CSV merge process")

os.makedirs(CSV_DIR, exist_ok=True)
os.makedirs(JSON_DIR, exist_ok=True)

csv_files = sorted(glob.glob(os.path.join(CSV_DIR, "*.csv")))
merged_csv = os.path.join(CSV_DIR, "all.csv")

if not csv_files:
    log.error("No CSV files found in %s", CSV_DIR)
    raise FileNotFoundError("No CSV files found in csv/")

log.info("Found %d CSV files", len(csv_files))

header_written = False
total_rows = 0
processed_files = 0

with open(merged_csv, "w", newline="", encoding="utf-8") as out:
    writer = None

    for file in csv_files:
        if file == "all.csv":
            log.debug("Skipping existing merged file: %s", file)
            continue

        log.info("Processing file: %s", file)

        with open(file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            if not reader.fieldnames:
                log.warning("Skipping empty or invalid CSV: %s", file)
                continue

            if not header_written:
                writer = csv.DictWriter(out, fieldnames=reader.fieldnames)
                writer.writeheader()
                header_written = True
                log.debug("CSV header written")

            file_rows = 0
            for row in reader:
                writer.writerow(row)
                file_rows += 1

            log.info("  → %d rows merged", file_rows)
            total_rows += file_rows
            processed_files += 1

log.info(
    "Merged %d files (%d total rows) → %s",
    processed_files,
    total_rows,
    merged_csv,
)


# =========================
# Convert CSV → JSON
# =========================

log.info("Starting CSV → JSON conversion")

csv_file = merged_csv
json_file = os.path.join(JSON_DIR, "all.json")

with open(csv_file, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = [{k: parse_value(v) for k, v in row.items()} for row in reader]

log.info("Parsed %d rows from merged CSV", len(rows))


rows = sort_rows_by_month_date(rows)


with open(json_file, "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=2, ensure_ascii=False)

log.info("JSON written to %s", json_file)


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
