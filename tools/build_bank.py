# -*- coding: utf-8 -*-
"""
Builds the 5-variant exam from programming_exam_question_bank_en.docx.

Every variant: 10 tasks = 4 theoretical (Part 1) + 6 coding (Part 2), 10 points each, 100 points in total.
  * Theoretical questions come from the "Theoretical Concepts" part: every variant gets 2 questions from
    category A, 1 from B and 1 from C, so all three theory categories appear in every variant.
  * Coding tasks: every variant contains ALL 5 coding categories (A–E) plus 1 extra task.
  * No question is repeated in two variants; a task and its derived "-b" twin are never in the same variant,
    and two tasks with neighbouring bank numbers (e.g. C11 and C12) are never in the same variant.
  * Tasks are NOT handed out in bank order (variant A does not simply get the first task of every category):
    the assignment inside each category is shuffled.
  * The order of the 10 tasks is shuffled in every variant: theoretical and coding tasks alternate, two tasks of
    the same category never follow each other, and no two variants have the same theory/coding pattern.
  * Some coding tasks are graded 0 / 10 only, others with partial credit (0–10).

Usage (from the project root):
    python tools/build_bank.py            # creates exam_data.js, variant_A..E.py, question_bank_map.md
    python tools/build_bank.py --verify   # also checks: reference answers = 100/100, empty answers = 0, partial credit
"""
import hashlib
import os
import random
import re
import subprocess
import sys
import tempfile
import textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
sys.path.insert(0, HERE)

from grader_core import HARNESS_SOURCE, load_harness  # noqa: E402
from mdhtml import _inline, md_to_html, write_exam_data  # noqa: E402
from bank_theory import THEORY, THEORY_CATEGORIES, check_theory_answers  # noqa: E402
from bank_coding import CODING, CATEGORIES  # noqa: E402

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

VARIANTS = ["A", "B", "C", "D", "E"]
PTS = 10
SEED = 20261021
UNIVERSITY = "BAKU ENGINEERING UNIVERSITY"
COURSE = "Programming Fundamentals"
GROUP = "1248"
YEAR = "1st year"
THEORY_PER_VARIANT = {"A": 2, "B": 1, "C": 1}
THEORY_BY_ID = {t[0]: t for t in THEORY}


def sha(x):
    return hashlib.sha256(str(x).strip().lower().encode()).hexdigest()


def num_of(tid):
    """Bank number of a question: 'C10' -> 10, 'A2-b' -> 2 (a twin has the same number as its original)."""
    return int(re.sub(r"\D", "", tid.split("-")[0]))


def far_apart(ids):
    """No two questions of the same category are twins or neighbours in the bank (e.g. C11 & C12)."""
    for i, a in enumerate(ids):
        for b in ids[i + 1:]:
            if a[0] == b[0] and abs(num_of(a) - num_of(b)) <= 1:
                return False
    return True


def not_in_bank_order(seq):
    """The questions handed to variants A..E must not simply follow the bank order (or its reverse)."""
    nums = [num_of(x) for x in seq]
    return nums != sorted(nums) and nums != sorted(nums, reverse=True)


# ----------------------------------------------------------------------
# Assigning questions to variants
# ----------------------------------------------------------------------
def assign_theory(rnd):
    nv = len(VARIANTS)
    pools = {c: [t[0] for t in THEORY if t[1] == c] for c in THEORY_CATEGORIES}
    assert all(len(pools[c]) == THEORY_PER_VARIANT[c] * nv for c in pools)
    for _ in range(100000):
        res = [[] for _ in range(nv)]
        ok = True
        for c, k in THEORY_PER_VARIANT.items():
            ids = pools[c][:]
            rnd.shuffle(ids)
            if not not_in_bank_order(ids[::k]):
                ok = False
            for v in range(nv):
                res[v] += ids[v * k:(v + 1) * k]
        if ok and all(far_apart(r) for r in res):
            return res
    raise RuntimeError("no valid theory assignment found")


def assign_coding(rnd):
    """Each category has 6 tasks: 1 for every variant + 1 extra for one variant (each variant gets one extra)."""
    nv = len(VARIANTS)
    cats = list(CATEGORIES)
    pools = {c: sorted((t for t in CODING if t[0] == c), key=lambda x: (num_of(x), x)) for c in cats}
    for _ in range(200000):
        extra = list(range(nv))
        rnd.shuffle(extra)
        res = [[] for _ in range(nv)]
        ok = True
        for ci, c in enumerate(cats):
            ids = pools[c][:]
            rnd.shuffle(ids)
            first, second = ids[:nv], ids[nv]
            if not not_in_bank_order(first):
                ok = False
                break
            for v in range(nv):
                res[v].append(first[v])
            res[extra[ci]].append(second)
        if not ok or not all(far_apart(r) for r in res):
            continue
        # every variant has both kinds of grading: partial (0–10) and 0/10
        npart = [sum(CODING[t]["partial"] for t in r) for r in res]
        if not all(3 <= p <= 5 for p in npart):
            continue
        return res
    raise RuntimeError("no valid coding assignment found")


def order_tasks(items, rnd, used_patterns):
    """items: [(kind, id, category_key)] -> shuffled order: same category never adjacent, theory spread out."""
    for _ in range(200000):
        seq = items[:]
        rnd.shuffle(seq)
        keys = [k for _, _, k in seq]
        if any(keys[i] == keys[i + 1] for i in range(len(keys) - 1)):
            continue
        if seq[0][0] == "theory" and seq[-1][0] == "theory":
            continue
        pattern = "".join("T" if k == "theory" else "C" for k, _, _ in seq)
        if pattern in used_patterns:
            continue
        used_patterns.add(pattern)
        return seq
    raise RuntimeError("no valid order found")


def make_plan():
    rnd = random.Random(SEED)
    theory = assign_theory(rnd)
    coding = assign_coding(rnd)
    plan, patterns = {}, set()
    for vi, v in enumerate(VARIANTS):
        items = [("theory", t, "T") for t in theory[vi]] + [("code", c, "P" + c[0]) for c in coding[vi]]
        plan[v] = order_tasks(items, random.Random(f"{SEED}-{v}"), patterns)
    return plan


# ----------------------------------------------------------------------
# Building the tasks
# ----------------------------------------------------------------------
def theory_task(tid, topic, v):
    qid, cat, short, question, correct, wrong = topic
    opts = [(True, correct)] + [(False, w) for w in wrong]
    random.Random(f"{v}-{qid}").shuffle(opts)
    letters = "abcd"
    options = {letters[i]: _inline(t) for i, (_, t) in enumerate(opts)}
    right = letters[[c for c, _ in opts].index(True)]
    title = f"Task {tid}. {short} ({PTS} points)"
    badge = (f"<p><i>Theoretical question · Theoretical Concepts — {cat}. {THEORY_CATEGORIES[cat]} · "
             f"choose the correct answer (0 or 10 points)</i></p>")
    html = f"<h4>{_inline(title)}</h4>\n{badge}\n" + md_to_html(question)
    task = {"id": tid, "title": title, "pts": PTS, "kind": "choice", "html": html, "options": options}
    steps = [
        {"k": "var", "task": tid, "var": f"answer_{tid}"},
        {"k": "test", "ids": [tid], "code":
            f"def test_{tid.lower()}():\n"
            f"    assert _h(answer_{tid}) == \"{sha(right)}\", \"the selected answer is not correct\"\n"
            f"check(\"{tid}\", {PTS}, test_{tid.lower()})"},
    ]
    return task, steps, right, {"opts": options, "right": right, "q": question}


def grading_text(c):
    return ("grading: partial credit, 0–10 points (every correct part earns points)" if c["partial"]
            else "grading: 0 or 10 points (all checks must pass)")


def code_task(tid, c):
    title = f"Task {tid}. {c['title']} ({PTS} points)"
    badge = f"<p><i>Coding task · {c['cat']}. {CATEGORIES[c['cat']]} · {grading_text(c)}</i></p>"
    html = f"<h4>{_inline(title)}</h4>\n{badge}\n" + md_to_html(c["desc"])
    task = {"id": tid, "title": title, "pts": PTS, "kind": "code", "html": html, "starter": c["starter"]}
    fn = f"test_{tid.lower()}"
    code = f"def {fn}():\n" + textwrap.indent(c["test"], "    ") + f"\ncheck(\"{tid}\", {PTS}, {fn})"
    steps = [{"k": "code", "task": tid, "code": c["starter"]}, {"k": "test", "ids": [tid], "code": code}]
    return task, steps


def bank_label(kind, qid):
    if kind == "theory":
        return f"Part 1 [{qid}]" + (f" (2nd question on topic {qid[:-2]})" if qid.endswith("-b") else "")
    c = CODING[qid]
    return f"Part 2 [{qid}]" + (f" (derived from {c['derived_from']})" if c["derived_from"] else "")


def build():
    data = {"version": 4, "harness": HARNESS_SOURCE, "variants": {}}
    keys, mapping, extra = {}, {}, {}
    plan = make_plan()
    for v in VARIANTS:
        tasks, items, steps, key, maps, pyinfo = [], [], [], {}, [], []
        for i, (kind, qid, _) in enumerate(plan[v], 1):
            tid = f"T{i}"
            if kind == "theory":
                t = THEORY_BY_ID[qid]
                task, st, right, info = theory_task(tid, t, v)
                key[tid] = right
                maps.append((tid, "Theory", bank_label(kind, qid), f"Theoretical Concepts — {t[1]}. {THEORY_CATEGORIES[t[1]]}",
                             t[2], "0 / 10", right))
                pyinfo.append(("theory", tid, t[2], info, None))
            else:
                c = CODING[qid]
                task, st = code_task(tid, c)
                key[tid] = c["solution"]
                maps.append((tid, "Coding", bank_label(kind, qid), f"{c['cat']}. {CATEGORIES[c['cat']]}", c["title"],
                             "0–10 (partial)" if c["partial"] else "0 / 10", f"`{c['solution'].split('(')[0].replace('def ', '')}()`"))
                pyinfo.append(("code", tid, c["title"], None, c))
            tasks.append(task)
            steps += st
            items.append({"type": "task", "id": tid})
        assert len(tasks) == 10 and sum(t["pts"] for t in tasks) == 100
        data["variants"][v] = {"name": f"Variant {v}", "max_score": 100, "items": items, "tasks": tasks, "steps": steps}
        keys[v], mapping[v], extra[v] = key, maps, pyinfo
    return data, keys, mapping, extra, plan


# ----------------------------------------------------------------------
# variant_X.py (a stand-alone file the student can run)
# ----------------------------------------------------------------------
def _helpers_source():
    a = HARNESS_SOURCE.index("def _plain(v):")
    b = HARNESS_SOURCE.index("OK_MSG =")
    helpers = HARNESS_SOURCE[a:b].rstrip()
    g0 = HARNESS_SOURCE.index("def grade(*items):")
    g1 = HARNESS_SOURCE.index("def _exec_limited")
    return helpers + "\n\n\n" + HARNESS_SOURCE[g0:g1].rstrip()


PY_HEADER = '''# -*- coding: utf-8 -*-
"""
{university}
Course: {course} — {year}, group {group} — SDF 1 (Variant {v})
Maximum score: 100 (10 tasks: 4 theoretical + 6 coding, 10 points each)

HOW TO USE THIS FILE
1. Theoretical questions: write the letter of the correct option ("a", "b", "c" or "d") into `answer_T..`.
2. Coding tasks: write your function INSIDE the `with task("T..."):` block
   (the lines inside the block are indented by 4 spaces). Replace `pass` with the body of the function.
   Your function may `return` the result or `print` it — both are accepted.
3. Run the file:   python variant_{v}.py
4. Every task is checked immediately:
       ✅ Task T3: CORRECT (+10 points)
       🟡 Task T3: PARTIALLY CORRECT (+6 / 10 points)   (the failed parts are listed below it)
       ❌ Task T3: NOT CORRECT — ...
   Your total score is printed at the end of the file.

Grading: some coding tasks are graded 0 or 10 points only, others with partial credit (0–10).
This is written in the header of every task.

Note: a run-time error in one task does not stop the other tasks.
A SyntaxError (e.g. a missing bracket or wrong indentation) stops the whole file —
Python shows the line of the error; fix it and run the file again.

This file was generated by tools/build_bank.py.
"""

import ast
import contextlib
import copy
import hashlib
import io
import math
import re
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

results = {{}}
_errors = {{}}


def _h(x):
    return hashlib.sha256(str(x).strip().lower().encode()).hexdigest()


{helpers}


class task:
    """Protects a task block: an error inside the block is remembered and the file keeps running."""

    def __init__(self, task_id):
        self.task_id = task_id

    def __enter__(self):
        _errors.pop(self.task_id, None)
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            return False
        _errors[self.task_id] = f"an error occurred while running your code → {{exc_type.__name__}}: {{exc}}"
        return True


def check(task_id, points, test):
    """Runs a test, stores the result in `results` and prints feedback (full or partial points)."""
    tid = task_id.split("_")[0]
    reason = ""
    try:
        res = test()
        if isinstance(res, tuple) and len(res) == 3:
            got, tot, failed = res
            pts = int(points * got / tot + 0.5) if tot else 0
            results[task_id] = pts
            if pts >= points:
                print(f"✅ Task {{tid}}: CORRECT (+{{points}} points)")
                return
            reason = "Failed parts: " + "; ".join(failed)
            if pts > 0:
                print(f"🟡 Task {{tid}}: PARTIALLY CORRECT (+{{pts}} / {{points}} points)")
                print(f"   ↳ {{reason}}")
                return
        else:
            results[task_id] = points
            print(f"✅ Task {{tid}}: CORRECT (+{{points}} points)")
            return
    except AssertionError as e:
        reason = str(e) or "the test condition was not met"
    except NameError as e:
        reason = f"a required function / variable is not defined ({{e}})"
    except Exception as e:
        reason = f"{{type(e).__name__}}: {{e}}"
    results[task_id] = 0
    if tid in _errors:
        reason = _errors[tid]
    print(f"❌ Task {{tid}}: NOT CORRECT — the returned / printed value does not match the expected result.")
    print(f"   ↳ Reason: {{reason}}")


student_name = "..."      # write your first name and surname here
group = "{group}"         # your group

'''

PY_FOOTER = '''
# ======================================================================
# FINAL RESULT
# ======================================================================
MAX_POINTS = {max_points}

total = 0
print()
print(f"{{'Task':<12}}{{'Result':<10}}{{'Points':>8}}")
print("-" * 32)
for k, p in MAX_POINTS.items():
    got = results.get(k)
    if got is None:
        status, earned = "—", 0
    elif got == p:
        status, earned = "✅", got
    elif got > 0:
        status, earned = "🟡", got
    else:
        status, earned = "❌", got
    total += earned
    print(f"{{k:<12}}{{status:<10}}{{earned:>5}}/{{p}}")

max_total = sum(MAX_POINTS.values())
print("-" * 32)
print(f"FINAL EXAM SCORE: {{total}} / {{max_total}}  ({{total / max_total * 100:.0f}}%)")
'''


def _comment(text):
    bar = "# " + "=" * 70
    return "\n".join([bar] + [("# " + l).rstrip() for l in text.rstrip().split("\n")] + [bar])


def _plain_md(md):
    return md.replace("**", "").replace("`", "").replace("*", "")


def build_py(v, tasks_info, answers=None):
    """If `answers` is given, the blocks are filled with the reference answers (used for verification)."""
    parts = [PY_HEADER.format(v=v, helpers=_helpers_source(), university=UNIVERSITY, course=COURSE, year=YEAR, group=GROUP)]
    max_points = {}
    for kind, tid, title, info, c in tasks_info:
        max_points[tid] = PTS
        if kind == "theory":
            q = _plain_md(info["q"]).replace("\n\n", "\n").replace("```python\n", "").replace("```", "")
            text = f"Task {tid}. {title} ({PTS} points) — theoretical question (0 or 10 points)\n\n" + q
            for k in "abcd":
                opt = re.sub(r"</?code>|</?b>|</?i>", "", info["opts"][k]).replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
                text += f"\n  {k}) " + opt
            parts.append(_comment(text) + "\n")
            val = answers[tid] if answers else ""
            parts.append(f'answer_{tid} = "{val}"      # the letter of the correct option: "a", "b", "c" or "d"\n\n')
            parts.append(f'def test_{tid.lower()}():\n    assert _h(answer_{tid}) == "{sha(info["right"])}", "the selected answer is not correct"\n'
                         f'check("{tid}", {PTS}, test_{tid.lower()})\n\n')
        else:
            text = (f"Task {tid}. {title} ({PTS} points) — coding task · {c['cat']}. {CATEGORIES[c['cat']]}\n"
                    f"{grading_text(c)}\n\n" + _plain_md(c["desc"]).replace("```\n", "").replace("```", ""))
            parts.append(_comment(text) + "\n")
            code = answers[tid] if answers else c["starter"]
            parts.append(f'with task("{tid}"):\n' + "\n".join(("    " + l) if l.strip() else "" for l in code.split("\n")) + "\n\n")
            fn = f"test_{tid.lower()}"
            parts.append(f"def {fn}():\n" + textwrap.indent(c["test"], "    ") + f"\ncheck(\"{tid}\", {PTS}, {fn})\n\n")
    parts.append(PY_FOOTER.format(max_points=repr(max_points)))
    return "\n".join(parts).rstrip() + "\n"


# ----------------------------------------------------------------------
# Map for the teacher
# ----------------------------------------------------------------------
def write_mapping(mapping, path):
    lines = ["# Question bank → variant map (for the teacher only)\n",
             f"Source: `programming_exam_question_bank_en.docx` — {COURSE}, {YEAR}, group {GROUP}.\n",
             "Every variant has 10 tasks: **4 theoretical + 6 coding**, 10 points each, 100 points in total.\n",
             "* **Theoretical questions** (Theoretical Concepts): every variant has 2 questions from category A "
             "(Core Concepts, Memory, Types & Operators), 1 from B (Conditional Statements) and 1 from C (Loops).",
             "* **Coding tasks**: every variant contains all 5 coding categories (A–E) + 1 extra task.",
             "* No question appears in two variants. A topic and its second question / derived task (`-b`) are never in the same variant.",
             "* Questions are not handed out in bank order, and the order of tasks is shuffled in every variant "
             "(two tasks of the same category never follow each other).",
             "* The Word file has 15 theoretical topics and 25 coding tasks, while 20 + 30 are needed; therefore 5 topics have a "
             "second question on another aspect (`A2-b`, `A5-b`, `B1-b`, `C2-b`, `C3-b`) and 5 coding tasks are derived from bank "
             "tasks (`A11-b`, `A12-b`, `B7-b`, `D4-b`, `D9-b`).\n",
             "Grading: `0 / 10` — only 0 or 10 points; `0–10 (partial)` — every correct part earns its own points. "
             "Checking is result-based: the function may return or print the answer, and any correct algorithm is accepted. "
             "Instructions such as *“without `swapcase()`”*, *“recursive”* or *“Bubble Sort”* are not enforced automatically — "
             "check the code in the admin panel if needed.\n"]
    for v, rows in mapping.items():
        npart = sum(1 for r in rows if r[5].startswith("0–10"))
        lines.append(f"\n## Variant {v}  (coding: {npart} partial, {6 - npart} graded 0/10; theory: 4 × 0/10)\n\n"
                     "| Task | Type | Bank number | Category | Topic | Grading | Answer key |\n|---|---|---|---|---|---|---|")
        lines += [f"| {t} | {k} | {b} | {c} | {n} | {m} | {a} |" for t, k, b, c, n, m, a in rows]
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")


# ----------------------------------------------------------------------
# Verification
# ----------------------------------------------------------------------
def verify(data, keys, extra, plan):
    from probes import PROBES
    h = load_harness()
    ok = check_theory_answers()
    print("\n=== VERIFICATION ===")
    # structure rules
    used = [qid for v in plan.values() for _, qid, _ in v]
    ok &= len(used) == len(set(used)) == 50
    for v, seq in plan.items():
        th = [q for k, q, _ in seq if k == "theory"]
        cd = [q for k, q, _ in seq if k == "code"]
        cats_t = sorted(q[0] for q in th)
        cats_c = {q[0] for q in cd}
        rule = cats_t == ["A", "A", "B", "C"] and cats_c == set(CATEGORIES) and len(cd) == 6
        ok &= rule
        print(f"Variant {v}: theory {th} | coding {cd} {'✅' if rule else '❌'}")
    for v, var in data["variants"].items():
        steps, key = var["steps"], keys[v]
        r = h.run_variant(steps, key)["results"]
        total = sum(x["pts"] for x in r.values())
        bad = {k: x["detail"] for k, x in r.items() if not x["ok"]}
        starters = {t["id"]: t["starter"] for t in var["tasks"] if t["kind"] == "code"}
        r0 = h.run_variant(steps, starters)["results"]
        zero = sum(x["pts"] for x in r0.values())
        wrong = {t["id"]: next(l for l in "abcd" if l != key[t["id"]]) for t in var["tasks"] if t["kind"] == "choice"}
        rw = h.run_variant(steps, wrong)["results"]
        wrong_pts = sum(x["pts"] for k, x in rw.items() if k in wrong)
        with tempfile.TemporaryDirectory() as td:
            def run_py(code):
                fp = os.path.join(td, f"variant_{v}.py")
                with open(fp, "w", encoding="utf-8") as f:
                    f.write(code)
                compile(code, fp, "exec")
                rr = subprocess.run([sys.executable, fp], capture_output=True, text=True, encoding="utf-8", timeout=180)
                m = re.search(r"FINAL EXAM SCORE: (\d+) / (\d+)", rr.stdout)
                return (int(m.group(1)) if m else None), rr
            py_full, rf = run_py(build_py(v, extra[v], key))
            py_blank, rb = run_py(build_py(v, extra[v]))
        line_ok = total == 100 and not bad and zero == 0 and wrong_pts == 0 and py_full == 100 and py_blank == 0
        ok &= line_ok
        print(f"Variant {v}: reference={total}/100 | empty starters={zero} | wrong options={wrong_pts} | "
              f".py reference={py_full} | .py empty={py_blank} {'✅' if line_ok else '❌'}")
        if bad:
            print("   failed tasks:", bad)
        if py_full != 100:
            print(rf.stdout[-1500:], rf.stderr[-1500:])
        if py_blank != 0:
            print(rb.stdout[-1500:], rb.stderr[-1500:])
    print("\n--- every coding task on its own (reference = 10, empty = 0, probes) ---")
    for qid, c in sorted(CODING.items(), key=lambda kv: (kv[0][0], num_of(kv[0]), kv[0])):
        step = [{"k": "code", "task": "T1", "code": c["starter"]},
                {"k": "test", "ids": ["T1"], "code": "def test_t1():\n" + textwrap.indent(c["test"], "    ") + f"\ncheck(\"T1\", {PTS}, test_t1)"}]
        full = h.run_variant(step, {"T1": c["solution"]})["results"]["T1"]
        blank = h.run_variant(step, {})["results"]["T1"]
        good = full["pts"] == 10 and blank["pts"] == 0
        ok &= good
        line = f"  {'✅' if good else '❌'} {qid:<6} {c['title']:<44} reference={full['pts']:>2} empty={blank['pts']}"
        if not good:
            line += f"  ({full['detail']})"
        if qid in PROBES:
            code, expected = PROBES[qid]
            got = h.run_variant(step, {"T1": code})["results"]["T1"]
            flag = "✅" if got["pts"] == expected else "❌"
            ok &= got["pts"] == expected
            line += f" | probe → {got['pts']} (expected {expected}) {flag}"
            if got["pts"] != expected or expected == 0:
                line += f"  [{got['detail'][:120]}]"
        print(line)
    print("RESULT:", "ALL CORRECT ✅" if ok else "PROBLEMS FOUND ❌")
    return ok


def main():
    data, keys, mapping, extra, plan = build()
    write_exam_data(data, os.path.join(ROOT, "exam_data.js"))
    write_mapping(mapping, os.path.join(ROOT, "question_bank_map.md"))
    for v in VARIANTS:
        code = build_py(v, extra[v])
        compile(code, f"variant_{v}.py", "exec")
        with open(os.path.join(ROOT, f"variant_{v}.py"), "w", encoding="utf-8", newline="\n") as f:
            f.write(code)
    print("Created: exam_data.js, variant_A.py ... variant_E.py, question_bank_map.md")
    if "--verify" in sys.argv and not verify(data, keys, extra, plan):
        sys.exit(1)


if __name__ == "__main__":
    main()
