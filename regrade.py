# -*- coding: utf-8 -*-
"""
SDF 1 (Programming Fundamentals, group 1248) — independent re-grading of the results on the teacher's computer.

In the portal the score is calculated in the student's browser. This script takes the ANSWERS stored in the
database, checks them again with the same tests (grader_core.py + exam_data.js) and compares the result with the
score sent by the browser — this reveals manipulated results and results that were only "partially" checked
because Python did not load.

Usage:
  python regrade.py --password TEACHER_PASSWORD          # read from Supabase
  python regrade.py --json results.json                  # read from a JSON file
  python regrade.py --password ... --csv new_scores.csv

Requirement: the admin_list_submissions function from supabase_setup.sql must exist in the database.
"""

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.request

from grader_core import load_harness

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

HERE = os.path.dirname(os.path.abspath(__file__))


def load_env(env_path=os.path.join(HERE, ".env")):
    """A simple .env reader (no extra library needed)."""
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k and k not in os.environ:
                    os.environ[k] = v


load_env()
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")


def load_exam_data(path=os.path.join(HERE, "exam_data.js")):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    start = text.index("=") + 1
    return json.loads(text[start:].strip().rstrip(";"))


def fetch_submissions(password, url, key):
    req = urllib.request.Request(
        f"{url}/rest/v1/rpc/admin_list_submissions",
        data=json.dumps({"p_password": password}).encode(),
        headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Supabase error {e.code}: {e.read().decode('utf-8', 'replace')}")


def regrade(submissions, data):
    harness = load_harness()
    rows = []
    for s in submissions:
        letter = str(s.get("variant", "")).replace("Variant", "").strip()
        variant = data["variants"].get(letter)
        answers = s.get("answers") or {}
        if not variant or not isinstance(answers, dict):
            continue
        res = harness.run_variant(variant["steps"], answers)["results"]
        scores = {t["id"]: res.get(t["id"], {}).get("pts", 0) for t in variant["tasks"]}
        new_total = sum(scores.values())
        if str(s.get("status", "")).startswith(("DISQUALIFIED", "K\u018fNAR")):
            new_total = 0  # a disqualified student gets 0 points by the rules
        rows.append({
            "list_no": s.get("student_id", ""),
            "name": s.get("student_name", ""),
            "group": s.get("student_group", ""),
            "variant": letter,
            "status": s.get("status", ""),
            "portal_score": s.get("score", 0),
            "new_score": new_total,
            "difference": new_total - round(float(s.get("score") or 0)),
            **scores,
        })
    return rows


def main():
    ap = argparse.ArgumentParser(description="Re-grading of the SDF 1 results")
    src = ap.add_mutually_exclusive_group(required=False)
    src.add_argument("--password", default=ADMIN_PASSWORD, help="Teacher password (to read from Supabase; default: from .env)")
    src.add_argument("--json", help="JSON file with the results (a list)")
    ap.add_argument("--csv", help="Write the result to a CSV file")
    ap.add_argument("--url", default=SUPABASE_URL, help="Supabase URL (default: from .env)")
    ap.add_argument("--key", default=SUPABASE_ANON_KEY, help="Supabase anon key (default: from .env)")
    args = ap.parse_args()

    data = load_exam_data()
    if args.json:
        with open(args.json, encoding="utf-8") as f:
            submissions = json.load(f)
    else:
        password = args.password or ADMIN_PASSWORD
        if not password:
            raise SystemExit("Error: the teacher password is required! Pass --password or set ADMIN_PASSWORD in the .env file.")
        if not args.url or not args.key:
            raise SystemExit("Error: the Supabase URL and anon key are required! Set SUPABASE_URL and SUPABASE_ANON_KEY in the .env file.")
        submissions = fetch_submissions(password, args.url, args.key)

    rows = regrade(submissions, data)
    print(f"{'No.':<6}{'Name':<26}{'Var.':<6}{'Portal':>8}{'New':>7}{'Diff':>7}  Status")
    print("-" * 80)
    for r in rows:
        mark = "" if r["difference"] == 0 else "   ⚠️"
        print(f"{str(r['list_no']):<6}{str(r['name'])[:25]:<26}{r['variant']:<6}{r['portal_score']:>8}{r['new_score']:>7}{r['difference']:>+7}  {r['status']}{mark}")
    diff = sum(1 for r in rows if r["difference"] != 0)
    print("-" * 80)
    print(f"{len(rows)} results in total; {diff} differ from the portal score.")

    if args.csv and rows:
        with open(args.csv, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter=";")
            w.writeheader()
            w.writerows(rows)
        print(f"📄 CSV saved: {args.csv}")


if __name__ == "__main__":
    main()
