import csv
import json


def parse_value(value):
    if value is None:
        return value

    value = value.strip()

    # Try int
    if value.isdigit() or (value.startswith("-") and value[1:].isdigit()):
        return int(value)

    # Try float
    try:
        return float(value)
    except ValueError:
        return value


csv_file = "csv/events.csv"
json_file = "json/events.json"

with open(csv_file, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = [{key: parse_value(value) for key, value in row.items()} for row in reader]

with open(json_file, "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=2, ensure_ascii=False)

print("CSV converted to JSON with numbers parsed")
