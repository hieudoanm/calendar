import csv
from datetime import datetime

INPUT_FILE = "csv/era.csv"
OUTPUT_FILE = "csv/calendar.csv"

current_year = datetime.now().year

rows = []

with open(INPUT_FILE, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        era = r["name"]
        start = int(r["start"])
        end_raw = r["end"].strip()

        if end_raw.lower() == "present":
            end = current_year
        else:
            end = int(end_raw)

        for year in range(start, end + 1):
            count = year - start + 1
            rows.append({"year": year, "era": era, "count": count})

rows.sort(key=lambda x: x["year"])

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["year", "era", "count"])
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {OUTPUT_FILE} with {len(rows)} rows")
