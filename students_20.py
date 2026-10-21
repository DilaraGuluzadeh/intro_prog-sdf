# -*- coding: utf-8 -*-
"""
Baku Engineering University — Programming Fundamentals (1st year, group 1248), SDF 1
Equal distribution of 20 students over 5 variants (A–E) — exactly 4 students per variant.

Rule (the SAME as in index.html): variant = VARIANTS[(list_no - 1) % 5]
  1, 6, 11, 16 → A    2, 7, 12, 17 → B    3, 8, 13, 18 → C
  4, 9, 14, 19 → D    5, 10, 15, 20 → E

When logging in to the portal, the student types their number from this list into the "list number" field.

Usage:
  python students_20.py                       # template list (Student 1 ... Student 20)
  python students_20.py names.txt             # one first name + surname per line (20 lines)
  python students_20.py names.txt --csv distribution.csv   # save the distribution for Excel
"""

import argparse
import csv
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

VARIANTS = ["A", "B", "C", "D", "E"]
GROUP = "1248"
GROUP_SIZE = 20


def variant_for(list_no):
    """Deterministic variant for a list number (starting from 1)."""
    n = int(list_no)
    if n < 1:
        raise ValueError("The list number must be 1 or greater")
    return VARIANTS[(n - 1) % len(VARIANTS)]


def build_roster(names=None):
    names = list(names or [f"Student {i}" for i in range(1, GROUP_SIZE + 1)])
    if len(names) != GROUP_SIZE:
        raise SystemExit(f"The list has {len(names)} names, it must have {GROUP_SIZE}.")
    return [{"list_no": i, "name": name, "variant": variant_for(i)} for i, name in enumerate(names, start=1)]


def check_balance(roster):
    counts = {v: 0 for v in VARIANTS}
    for t in roster:
        counts[t["variant"]] += 1
    expected = len(roster) // len(VARIANTS)
    assert all(c == expected for c in counts.values()), f"The distribution is not equal: {counts}"
    return counts


def print_distribution(roster):
    print(f"Group {GROUP} — Programming Fundamentals, SDF 1")
    print("=" * 52)
    print(f"{'No.':<6}{'Name':<32}{'Variant':<10}")
    print("-" * 52)
    for t in roster:
        print(f"{t['list_no']:<6}{t['name']:<32}Variant {t['variant']}")
    print("=" * 52)

    counts = check_balance(roster)
    print("\nStudents per variant:")
    for v in VARIANTS:
        nums = ", ".join(str(t["list_no"]) for t in roster if t["variant"] == v)
        print(f"  * Variant {v}: {counts[v]} students  (numbers: {nums})")
    print(f"\n✅ The distribution is equal: {len(roster)} students / {len(VARIANTS)} variants = {counts['A']} students per variant")


def main():
    ap = argparse.ArgumentParser(description="Equal distribution of 20 students over 5 variants")
    ap.add_argument("names", nargs="?", help="Text file (UTF-8) with one first name + surname per line")
    ap.add_argument("--csv", help="Write the distribution to a CSV file")
    args = ap.parse_args()

    names = None
    if args.names:
        with open(args.names, encoding="utf-8-sig") as f:
            names = [line.strip() for line in f if line.strip()]

    roster = build_roster(names)
    print_distribution(roster)

    if args.csv:
        with open(args.csv, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=["list_no", "name", "variant"], delimiter=";")
            w.writeheader()
            w.writerows(roster)
        print(f"📄 CSV saved: {args.csv}")


if __name__ == "__main__":
    main()
