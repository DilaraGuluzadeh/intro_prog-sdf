# 🚀 SDF 1: Online Exam Portal (Baku Engineering University — Programming Fundamentals)

**Course:** Programming Fundamentals · **Year:** 1st year · **Group:** 1248

A browser-based, copy-protected exam system. The student's Python code is checked in the browser with **real Python** (Pyodide) against the tests of the question bank.

**Exam structure (every variant):** 10 tasks = **4 theoretical** (Part 1, Theoretical Concepts) + **6 Python coding** (Part 2), 10 points each, 100 points in total.

- The 4 theoretical questions cover all three theory categories: 2 × **A** (Core Concepts, Memory, Types & Operators), 1 × **B** (Conditional Statements & Branching), 1 × **C** (Loop Operators & Iteration).
- The 6 coding tasks cover **all 5 coding categories** (A Fundamental Operations, B Branching, C Loops & Number Theory, D Lists & Matrices, E Strings & Functions) + 1 extra task.
- Questions are not handed out in bank order, the order of tasks is shuffled in every variant (tasks of the same category never follow each other), and no question is repeated in two variants.
- Some coding tasks are graded **0 or 10 points** only, others with **partial credit (0–10 points)**.
- The full list (which question is in which variant, grading type, answer key) is in `question_bank_map.md`.

### Comfortable Python writing (no unnecessary "syntax censorship")
The checker grades the **result**, not the writing style:
- the function may **`return`** the answer **or `print`** it — both are accepted;
- the output format is flexible: `15`, `"15"`, `"Sum of digits: 15"`, `(1, 1, 5)`, `"1 hour, 1 minute, 5 seconds"`, `True` or `"Prime number"`, `"Not a palindrome"` …;
- list ≈ tuple, `5` ≈ `5.0`, small rounding (`1.41` vs `1.41421…`) is accepted;
- any correct algorithm and any standard module may be used; a list sorted in place without `return` is accepted;
- if the student renames the function, the single function they wrote is used;
- tabs, Windows line breaks, "smart" quotes and copied Jupyter lines are cleaned automatically;
- `input()` is not needed (values arrive as parameters); if a student uses it, the «Check code» button explains this clearly;
- the editor behaves like Colab: auto-indentation after `:`, Tab / Shift+Tab, Ctrl+/ for comments.

Instructions such as *"without `swapcase()`"*, *"recursive"* or *"Bubble Sort"* are written in the task but **not enforced automatically** — check the code in the admin panel if needed.

---

## 📁 Files

| File | Purpose |
|---|---|
| `index.html` | **Student portal** — login with name and list number only; full screen, 3 warnings, Copy/Paste/DevTools blocking, «Check code» button |
| `admin.html` | **Teacher panel** — teacher password, live results, violation log, Excel export |
| `exam_data.js` | Questions, starter code and tests of the 5 variants (**generated**) |
| `question_bank_map.md` | Which question is in which variant, grading type, answer key (**generated**) |
| `variant_A.py` … `variant_E.py` | Stand-alone exam files that run with `python variant_X.py` (**generated**) |
| `students_20.py` | Equal distribution of 20 students over 5 variants (4 per variant) |
| `regrade.py` | Independent re-grading of the stored answers on the teacher's computer |
| `grader_core.py` | Grading engine (the browser and `regrade.py` run the same code) |
| `tools/build_bank.py` | Generator: creates `exam_data.js`, `variant_*.py` and the map from the question bank |
| `tools/bank_theory.py` | Part 1: 20 multiple-choice questions from the 15 theoretical topics (1 correct + 3 wrong options each) |
| `tools/bank_coding.py` | Part 2: 30 coding tasks (25 from the Word file + 5 derived), reference solutions and tests (full / partial credit) |
| `tools/probes.py` | Incomplete and differently formatted solutions that test partial credit and tolerance |
| `supabase_setup.sql` | Supabase tables, RLS rules and password-protected read functions |

> The Word file contains 15 theoretical topics and 25 coding tasks, but 5 variants need 20 + 30 different questions.
> Therefore 5 topics have a second question on another aspect (`A2-b`, `A5-b`, `B1-b`, `C2-b`, `C3-b`) and 5 coding
> tasks are derived from bank tasks (`A11-b`, `A12-b`, `B7-b`, `D4-b`, `D9-b`). A question and its `-b` twin are never in the same variant.

---

## ⚡ Setup

### 1. Supabase (once, and always after upgrading to this version)
Supabase Dashboard → **SQL Editor** → paste the content of `supabase_setup.sql` → **Run**.

This script:
- lets students only **submit** results (not read them);
- lets the results be read only with the teacher password (checked on the server) through the `admin_list_submissions` function;
- accepts the new English status codes `COMPLETED`, `DISQUALIFIED_3_WARNINGS`, `TIME_UP`.

Set the teacher password once (separate line in the SQL Editor, replace `YOUR_PASSWORD`):
```sql
INSERT INTO public.sdf1_admin (id, hash) VALUES (1, encode(sha256(convert_to('YOUR_PASSWORD', 'UTF8')), 'hex'))
ON CONFLICT (id) DO UPDATE SET hash = excluded.hash;
```

> ⚠️ If the script has not been run, the teacher panel shows a yellow warning: with the old rule anyone with the anon key can read the results.

### 2. Vercel environment variables
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_PASSWORD` (the same password as above). The build step (`node generate-env.js`) creates `env.js`.

### 3. Distributing the variants
```bash
python students_20.py                 # template list
python students_20.py names.txt       # one name per line (20 lines)
```
Tell every student their **list number (1–20)**. At login the student enters only their name and list number; the group (**1248**) is set in `index.html` (`GROUP_NAME`). The variant is not shown at login, only when the exam starts. The portal assigns it with the rule `(number − 1) % 5`:
`1,6,11,16 → A · 2,7,12,17 → B · 3,8,13,18 → C · 4,9,14,19 → D · 5,10,15,20 → E`.

### 4. Link for the students
- **GitHub Pages / Vercel**: upload the folder, share the link.
- **Lab network**: on the teacher's computer `python -m http.server 8000`, students open `http://192.168.X.X:8000`.

Internet is required: the Python environment (Pyodide, ~10 MB — no extra packages are loaded any more) and Supabase are loaded from a CDN. If Python does not load, the theoretical (multiple-choice) questions are still graded and the coding tasks are marked as "partial" — check them with `regrade.py`.

---

## 🛡️ Anti-cheat
1. Mandatory **full screen**; leaving it gives a warning and returns to full screen.
2. **3 warnings**: switching to another tab/window (including Alt+Tab — the browser cannot block Alt+Tab, but detects it immediately), minimising the browser, leaving full screen, reloading the page → sound + warning. At the 3rd warning the exam stops, the score is **0**, status `DISQUALIFIED_3_WARNINGS`.
3. Right-click, copying out / pasting in from outside, drag-and-drop, `F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U` are blocked (these do not cost a warning but are logged). Copy/paste **inside** the exam works.
4. Time, warnings and answers survive a page reload (saved in the browser).
5. For the next student on the same computer: **"For the exam supervisor: reset this computer"** on the result screen (teacher password).

---

## 🔁 Checking the results
The score is calculated in the student's browser. For suspicious or "partial" results:
```bash
python regrade.py --password TEACHER_PASSWORD --csv new_scores.csv
```

## 🛠️ Changing the questions
Edit theoretical questions in `tools/bank_theory.py` and coding tasks in `tools/bank_coding.py`, then:
```bash
python tools/build_bank.py --verify
```
This recreates `exam_data.js`, `variant_A.py … variant_E.py` and `question_bank_map.md`, and checks that every variant gives 100/100 with the reference answers and 0 with empty answers, that every variant follows the structure rules (2A + 1B + 1C theory, all 5 coding categories), that the `.py` files run, and that partial credit and the tolerant formats work (`tools/probes.py`).

**How does partial credit work?** If a task's test ends with `return grade((weight, "part", lambda: condition), ...)`, the weights of the passed parts are added up (the weights sum to 10). Tasks written with plain `assert` statements give only 0 or 10 points. The score is rounded to a whole number (matches the `score INTEGER` column in the database).
