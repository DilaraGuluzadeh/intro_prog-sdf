// GENERATED AUTOMATICALLY by python tools/build_bank.py — do not edit by hand.
window.EXAM_DATA = {
 "version": 4,
 "harness": "\nimport ast\nimport builtins\nimport contextlib\nimport copy\nimport hashlib\nimport io\nimport json\nimport math\nimport re\nimport sys\nimport time\nimport types\n\n# Only modules that could interfere with the exam page are blocked; all other standard modules are allowed\n_BLOCKED_MODULES = (\"js\", \"pyodide\", \"pyodide_js\", \"_pyodide\", \"micropip\", \"subprocess\", \"socket\")\n_real_import = builtins.__import__\n\n\ndef _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):\n    if name.split(\".\")[0] in _BLOCKED_MODULES:\n        raise ImportError(f\"the '{name}' module is not available during the exam\")\n    return _real_import(name, globals, locals, fromlist, level)\n\n\nclass InputNotNeeded(Exception):\n    pass\n\n\ndef _no_input(prompt=\"\"):\n    raise InputNotNeeded(\"input() is not needed in this exam — the values are passed to your function as parameters \"\n                         \"(e.g. digit_sum(384)). Use the parameters instead of input().\")\n\n\ndef _h(x):\n    return hashlib.sha256(str(x).strip().lower().encode()).hexdigest()\n\n\ndef _plain(v):\n    \"\"\"Converts tuple / set / NumPy-like values to plain Python lists (for tolerant comparison).\"\"\"\n    if hasattr(v, \"tolist\"):\n        v = v.tolist()\n    if isinstance(v, (list, tuple)):\n        return [_plain(x) for x in v]\n    if isinstance(v, dict):\n        return {k: _plain(x) for k, x in v.items()}\n    return v\n\n\ndef _close(a, b):\n    \"\"\"Number comparison: 5 == 5.0; floats may differ by a small rounding error (e.g. 1.41 vs 1.41421).\"\"\"\n    if isinstance(a, bool) or isinstance(b, bool):\n        return a == b\n    try:\n        if math.isclose(a, b, rel_tol=1e-6, abs_tol=1e-9):\n            return True\n        if isinstance(b, float) and not float(b).is_integer():\n            return abs(a - b) <= 0.006\n        return False\n    except TypeError:\n        return False\n\n\ndef _eq(a, b):\n    \"\"\"Tolerant equality: list ~ tuple ~ array, 1.0 ~ 1, small float rounding allowed.\"\"\"\n    a, b = _plain(a), _plain(b)\n    if isinstance(a, list) and isinstance(b, list):\n        return len(a) == len(b) and all(_eq(x, y) for x, y in zip(a, b))\n    if isinstance(a, dict) and isinstance(b, dict):\n        return a.keys() == b.keys() and all(_eq(a[k], b[k]) for k in a)\n    if isinstance(a, (int, float)) and isinstance(b, (int, float)):\n        return _close(a, b)\n    return a == b\n\n\n_NUM_RE = re.compile(r\"-?\\d+(?:\\.\\d+)?\")\n\n\ndef _nums(text):\n    \"\"\"All numbers that appear in a text, e.g. 'GCD: 6, LCM: 36' -> [6, 36].\"\"\"\n    return [float(m) if \".\" in m else int(m) for m in _NUM_RE.findall(str(text))]\n\n\ndef _call(fn, *args):\n    \"\"\"\n    Calls the student's function with copies of the arguments.\n    The returned value is used; if the function returns nothing, its printed output is used;\n    if it only changed a list argument in place (e.g. sorting), that list is used.\n    \"\"\"\n    args = copy.deepcopy(args)\n    before = copy.deepcopy(args)\n    buf = io.StringIO()\n    with contextlib.redirect_stdout(buf):\n        result = fn(*args)\n    printed = buf.getvalue()\n    if printed:\n        sys.stdout.write(printed)\n    if result is None:\n        if printed.strip():\n            return printed.strip()\n        for now, was in zip(args, before):\n            if isinstance(now, list) and now != was:\n                return now\n    return result\n\n\n# Yes / no words (English, plus a few Azerbaijani words so students may also answer in their own language)\n_NO = re.compile(r\"\\b(not|no|non|isn'?t|aren'?t|doesn'?t|does not|cannot|can'?t|invalid|composite|common|false|\"\n                 r\"deyil|yox|xeyr|mürəkkəb|adi)\\b\")\n_YES = re.compile(r\"\\b(yes|true|prime|leap|valid|palindrome|forms?|triangle|\"\n                  r\"bəli|sadə|uyğun|palindrom|polindrom|üçbucaq|uzun)\")\n\n\ndef _yes(v):\n    \"\"\"True / False from a yes-no style answer: True, 1, 'Prime number', 'Not a palindrome', 'Leap year' ...\"\"\"\n    if isinstance(v, bool):\n        return v\n    if isinstance(v, int) and v in (0, 1):\n        return bool(v)\n    if isinstance(v, str):\n        t = v.casefold()\n        if _NO.search(t):\n            return False\n        if _YES.search(t):\n            return True\n    return None\n\n\ndef _clean_text(s):\n    return \" \".join(str(s).strip().strip(\"'\\\"\").split())\n\n\ndef _same(got, exp):\n    \"\"\"Is the student's answer (returned or printed) equal to the expected value? Format-tolerant.\"\"\"\n    if isinstance(exp, bool):\n        return _yes(got) is exp\n    if got is None:\n        return False\n    if isinstance(exp, str):\n        g, e = _clean_text(got), _clean_text(exp)\n        if g == e:\n            return True\n        # a label in front of the answer is fine: \"Longest word: 'Proqramlaşdırma'\"\n        g = g.rstrip(\".!\").strip(\"'\\\"\")\n        return g == e or (g.endswith(e) and g[-len(e) - 1] in \" :='\\\"-\")\n    if isinstance(got, str):\n        text = got.strip()\n        try:\n            if _eq(ast.literal_eval(text), exp):\n                return True\n        except Exception:\n            pass\n        if isinstance(exp, dict):\n            m = re.search(r\"\\{.*\\}\", text, re.S)\n            if m:\n                try:\n                    return _eq(ast.literal_eval(m.group(0)), exp)\n                except Exception:\n                    return False\n            return False\n        if isinstance(exp, (list, tuple)) and exp and all(isinstance(x, (int, float)) for x in exp):\n            m = re.search(r\"\\[.*\\]|\\(.*\\)\", text, re.S)\n            if m:\n                try:\n                    if _eq(ast.literal_eval(m.group(0)), exp):\n                        return True\n                except Exception:\n                    pass\n            ns = _nums(text)\n            return len(ns) >= len(exp) and _eq(ns[len(ns) - len(exp):], list(exp))\n        if isinstance(exp, (list, tuple)) and not exp:\n            return text in (\"[]\", \"()\", \"\")\n        if isinstance(exp, (int, float)):\n            ns = _nums(text)\n            after_label = [float(x) if \".\" in x else int(x) for x in re.findall(r\"[:=]\\s*(-?\\d+(?:\\.\\d+)?)\", text)]\n            return any(_close(x, exp) for x in ns[-1:] + after_label)\n        return False\n    if isinstance(exp, (int, float)) and isinstance(got, (list, tuple)) and len(got) == 1:\n        got = got[0]\n    return _eq(got, exp)\n\n\ndef _seq(got, n):\n    \"\"\"The answer as a list of n values (from a tuple/list, or the last n numbers of a printed text).\"\"\"\n    if isinstance(got, str):\n        ns = _nums(got)\n        return ns[len(ns) - n:] if len(ns) >= n else None\n    v = _plain(got)\n    return v if isinstance(v, list) and len(v) == n else None\n\n\ndef _lines(got):\n    \"\"\"A text pattern as a list of lines (trailing spaces and empty lines ignored).\"\"\"\n    if got is None:\n        return []\n    if isinstance(got, (list, tuple)):\n        rows = [str(x) for x in got]\n    else:\n        rows = str(got).split(\"\\n\")\n    return [r.rstrip() for r in rows if r.strip()]\n\n\nOK_MSG = \"✅ Task {t}: CORRECT (+{p} points)\"\nPARTIAL_MSG = \"🟡 Task {t}: PARTIALLY CORRECT (+{p} / {m} points)\"\nFAIL_MSG = \"❌ Task {t}: NOT CORRECT — the returned / printed value does not match the expected result.\"\n\n\ndef grade(*items):\n    \"\"\"\n    Partial credit: items = (weight, \"what is checked\", callable) ...\n    Every part is checked separately; the weights of the passed parts are added up.\n    Returns: (earned_weight, total_weight, [descriptions of failed parts]).\n    \"\"\"\n    got = tot = 0\n    failed = []\n    for w, label, fn in items:\n        tot += w\n        try:\n            r = fn()\n            if r is None or (isinstance(r, bool) and not r):\n                raise AssertionError\n            got += w\n        except AssertionError:\n            failed.append(label)\n        except Exception as e:\n            failed.append(f\"{label} ({type(e).__name__}: {e})\")\n    return (got, tot, failed)\n\n\ndef _exec_limited(code, ns, budget, out):\n    \"\"\"Runs code with a time limit (an infinite loop must not freeze the browser).\"\"\"\n    deadline = time.monotonic() + budget\n\n    def tracer(frame, event, arg):\n        if time.monotonic() > deadline:\n            raise TimeoutError(f\"execution took longer than {budget:g} seconds (possible infinite loop)\")\n        return tracer\n\n    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):\n        sys.settrace(tracer)\n        try:\n            exec(compile(code, \"<code>\", \"exec\"), ns)\n        finally:\n            sys.settrace(None)\n\n\n_QUOTES = {\"“\": '\"', \"”\": '\"', \"„\": '\"', \"‘\": \"'\", \"’\": \"'\", \" \": \" \", \" \": \" \",\n           \"​\": \"\", \"‌\": \"\", \"‍\": \"\", \"﻿\": \"\", \"–\": \"-\", \"−\": \"-\"}\n\n\ndef normalize_code(code):\n    \"\"\"\n    Accepts code in a tolerant way:\n    CRLF, leading tabs (-> 4 spaces), invisible / non-standard characters (NBSP, ​), \"smart\" quotes,\n    common extra indentation (code copied from inside a cell) and Jupyter magic lines (%magic, !command) are fixed.\n    \"\"\"\n    import textwrap\n    code = str(code).replace(\"\\r\\n\", \"\\n\").replace(\"\\r\", \"\\n\")\n    code = \"\".join(_QUOTES.get(c, c) for c in code)\n    lines = []\n    for ln in code.split(\"\\n\"):\n        stripped = ln.lstrip(\" \\t\")\n        lead = ln[:len(ln) - len(stripped)].replace(\"\\t\", \"    \")\n        if stripped.startswith((\"%\", \"!\")) and not stripped.startswith(\"!=\"):\n            continue                      # Jupyter: %matplotlib inline, !pip install ...\n        lines.append((lead + stripped).rstrip())\n    return textwrap.dedent(\"\\n\".join(lines)).strip(\"\\n\") + \"\\n\"\n\n\ndef _describe(exc):\n    if \"'___'\" in str(exc):\n        return \"the `___` blanks have not been filled in yet\"\n    if isinstance(exc, InputNotNeeded):\n        return str(exc)\n    if isinstance(exc, IndentationError):\n        return f\"Indentation error (line {exc.lineno}): {exc.msg}. Indent the lines inside a block (after ':') by 4 spaces.\"\n    if isinstance(exc, SyntaxError):\n        return f\"Syntax error (line {exc.lineno}): {exc.msg}\"\n    return f\"{type(exc).__name__}: {exc}\"\n\n\ndef _coerce(value):\n    if value is None:\n        return None\n    s = str(value).strip()\n    if s == \"\":\n        return None\n    if re.fullmatch(r\"[+-]?\\d+\", s):\n        return int(s)\n    return s\n\n\ndef run_variant(steps, answers, upto=None, budget=10.0):\n    \"\"\"\n    steps   : the steps in exam_data.js (in task order)\n    answers : {\"T1\": \"<code>\", \"T2\": \"b\", ...}\n    upto    : run only up to the test of this task (\"Check code\" button)\n    Result  : {\"results\": {id: {ok, pts, max, msg, detail}}, \"output\": {id: stdout}}\n    \"\"\"\n    answers = answers or {}\n    ns = {\n        \"__name__\": \"__main__\",\n        \"__builtins__\": dict(vars(builtins), __import__=_guarded_import, input=_no_input),\n        \"math\": math, \"hashlib\": hashlib, \"_h\": _h, \"_eq\": _eq, \"grade\": grade,\n        \"_call\": _call, \"_same\": _same, \"_yes\": _yes, \"_seq\": _seq, \"_lines\": _lines, \"_nums\": _nums,\n    }\n    errors, results, output = {}, {}, {}\n\n    def check(task_id, points, test):\n        t = task_id.split(\"_\")[0]\n        try:\n            res = test()\n            if isinstance(res, tuple) and len(res) == 3:\n                got, tot, failed = res\n                pts = int(points * got / tot + 0.5) if tot else 0\n                if pts >= points:\n                    results[t] = {\"ok\": True, \"pts\": points, \"max\": points, \"partial\": False,\n                                  \"msg\": OK_MSG.format(t=t, p=points), \"detail\": \"\"}\n                    return\n                detail = \"Failed parts: \" + \"; \".join(failed)\n                if pts > 0:\n                    results[t] = {\"ok\": False, \"pts\": pts, \"max\": points, \"partial\": True,\n                                  \"msg\": PARTIAL_MSG.format(t=t, p=pts, m=points), \"detail\": detail}\n                    return\n                if t in errors:\n                    detail = errors[t] if errors[t].startswith(\"`\") else \"an error occurred while running your code → \" + errors[t]\n                results[t] = {\"ok\": False, \"pts\": 0, \"max\": points, \"partial\": False,\n                              \"msg\": FAIL_MSG.format(t=t), \"detail\": detail}\n                return\n            results[t] = {\"ok\": True, \"pts\": points, \"max\": points, \"partial\": False,\n                          \"msg\": OK_MSG.format(t=t, p=points), \"detail\": \"\"}\n            return\n        except AssertionError as e:\n            detail = str(e) or \"the test condition was not met\"\n        except NameError as e:\n            detail = f\"a required function / variable is not defined ({e})\"\n        except BaseException as e:\n            detail = _describe(e)\n        if t in errors:\n            detail = errors[t] if errors[t].startswith(\"`\") else \"an error occurred while running your code → \" + errors[t]\n        results[t] = {\"ok\": False, \"pts\": 0, \"max\": points, \"partial\": False,\n                      \"msg\": FAIL_MSG.format(t=t), \"detail\": detail}\n\n    ns[\"check\"] = check\n\n    for st in steps:\n        kind = st[\"k\"]\n        if kind == \"var\":\n            ns[st[\"var\"]] = _coerce(answers.get(st[\"task\"]))\n            continue\n        label = st.get(\"task\")\n        code = st[\"code\"]\n        expected_fns = re.findall(r\"^\\s*def\\s+([A-Za-z_]\\w*)\", st[\"code\"], re.M) if kind == \"code\" else []\n        if kind == \"code\":\n            for name in expected_fns:          # a function from an earlier task must not be reused here\n                ns.pop(name, None)\n        if kind == \"code\" and label in answers and answers[label] is not None:\n            code = normalize_code(answers[label])\n        before = {k: id(v) for k, v in ns.items()}\n        out = io.StringIO()\n        try:\n            _exec_limited(code, ns, budget, out)\n        except BaseException as e:\n            if label:\n                errors[label] = _describe(e)\n        if kind == \"code\" and expected_fns:\n            # The student renamed the function: if exactly one new function was written, use it\n            new_fns = [v for k, v in ns.items()\n                       if isinstance(v, types.FunctionType) and before.get(k) != id(v) and not k.startswith(\"_\")]\n            for name in expected_fns:\n                if name not in ns and len(new_fns) == 1 and len(expected_fns) == 1:\n                    ns[name] = new_fns[0]\n        if label:\n            output[label] = out.getvalue()[-2000:]\n        elif kind == \"test\" and out.getvalue():\n            # what the student's function printed during the test\n            output[st[\"ids\"][0]] = (output.get(st[\"ids\"][0], \"\") + out.getvalue())[-2000:]\n        if kind == \"test\" and upto and upto in st[\"ids\"]:\n            break\n\n    if upto:\n        results = {k: v for k, v in results.items() if k == upto}\n        output = {k: v for k, v in output.items() if k == upto}\n    return {\"results\": results, \"output\": output}\n\n\ndef run_json(payload):\n    \"\"\"Pyodide bridge: JSON text in, JSON text out.\"\"\"\n    p = json.loads(payload)\n    return json.dumps(run_variant(p[\"steps\"], p.get(\"answers\"), p.get(\"upto\"), p.get(\"budget\", 10.0)),\n                      ensure_ascii=False)\n",
 "variants": {
  "A": {
   "name": "Variant A",
   "max_score": 100,
   "items": [
    {
     "type": "task",
     "id": "T1"
    },
    {
     "type": "task",
     "id": "T2"
    },
    {
     "type": "task",
     "id": "T3"
    },
    {
     "type": "task",
     "id": "T4"
    },
    {
     "type": "task",
     "id": "T5"
    },
    {
     "type": "task",
     "id": "T6"
    },
    {
     "type": "task",
     "id": "T7"
    },
    {
     "type": "task",
     "id": "T8"
    },
    {
     "type": "task",
     "id": "T9"
    },
    {
     "type": "task",
     "id": "T10"
    }
   ],
   "tasks": [
    {
     "id": "T1",
     "title": "Task T1. Reversing the digits of a number (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T1. Reversing the digits of a number (10 points)</h4>\n<p><i>Coding task · C. Loops, Sequences & Number Theory · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a function <code>reverse_number(n)</code> that reverses the digits of a positive integer <code>n</code> and returns the new number.</p>\n<p>Example: <code>reverse_number(1234)</code> → <code>4321</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def reverse_number(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T2",
     "title": "Task T2. Core data types, type() and type casting (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T2. Core data types, type() and type casting (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>What does this code print?</p>\n<pre class=\"md-code\"><code>x = \"7\"\ny = int(x) + 3\nprint(type(x), y, float(y))</code></pre>",
     "options": {
      "a": "<code>&lt;class 'str'&gt; 73 73.0</code>",
      "b": "<code>&lt;class 'int'&gt; 10 10.0</code>",
      "c": "<code>&lt;class 'str'&gt; 10 10.0</code>",
      "d": "<code>&lt;class 'str'&gt; 10 10</code>"
     }
    },
    {
     "id": "T3",
     "title": "Task T3. Valid triangle check (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T3. Valid triangle check (10 points)</h4>\n<p><i>Coding task · B. Branching & Complex Decision-Making · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>is_triangle(a, b, c)</code> that checks whether three side lengths form a <b>valid triangle</b>, using the<br>Triangle Inequality Theorem: a + b &gt; c, a + c &gt; b and b + c &gt; a.<br>Return <code>True</code> / <code>False</code> (or print a message such as \"Forms a valid triangle\" / \"Does not form a triangle\").</p>\n<p>Example: <code>is_triangle(3, 4, 5)</code> → <code>True</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def is_triangle(a, b, c):\n    # write your code here\n    pass"
    },
    {
     "id": "T4",
     "title": "Task T4. Logical and comparison operators (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T4. Logical and comparison operators (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>Given <code>a = 5</code> and <code>b = 10</code>, what is the value of the expression below?</p>\n<pre class=\"md-code\"><code>not (a &gt; 3 and b &lt; 10) or a == b</code></pre>",
     "options": {
      "a": "<code>5</code>",
      "b": "<code>False</code>",
      "c": "An error, because <code>not</code> cannot be written in front of parentheses",
      "d": "<code>True</code>"
     }
    },
    {
     "id": "T5",
     "title": "Task T5. Minutes → days, hours, minutes (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T5. Minutes → days, hours, minutes (10 points)</h4>\n<p><i>Coding task · A. Fundamental Operations & Mathematical Logic · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a function <code>convert_minutes(total)</code> that converts a number of minutes into <b>days, hours and minutes</b><br>and returns them as three values: <code>days, hours, minutes</code>.</p>\n<p>Example: <code>convert_minutes(1500)</code> → <code>(1, 1, 0)</code>  (1 day, 1 hour, 0 minutes)</p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def convert_minutes(total):\n    # write your code here\n    pass"
    },
    {
     "id": "T6",
     "title": "Task T6. Maximum and minimum with their positions (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T6. Maximum and minimum with their positions (10 points)</h4>\n<p><i>Coding task · D. Lists & Matrices (2D Arrays) · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>max_min_index(lst)</code> that finds the <b>maximum</b> and <b>minimum</b> elements of a list together with their<br><b>index positions</b>, and returns four values: <code>max_value, max_index, min_value, min_index</code><br>(if a value appears more than once, use its first position).</p>\n<p>Example: <code>max_min_index([12, 45, 2, 89, 34])</code> → <code>(89, 3, 2, 2)</code>  — Max: 89 (index 3), Min: 2 (index 2)</p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def max_min_index(lst):\n    # write your code here\n    pass"
    },
    {
     "id": "T7",
     "title": "Task T7. The else block of a loop (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T7. The else block of a loop (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — C. Loop Operators & Iteration · choose the correct answer (0 or 10 points)</i></p>\n<p>When is the <code>else</code> block attached to a <code>for</code> or <code>while</code> loop executed?</p>",
     "options": {
      "a": "Only when the loop ends normally (the sequence is exhausted or the <code>while</code> condition becomes <code>False</code>); it is skipped when the loop is left with <code>break</code>",
      "b": "Only when the loop is left with <code>break</code>",
      "c": "After every single iteration of the loop",
      "d": "Only when the loop body was never executed"
     }
    },
    {
     "id": "T8",
     "title": "Task T8. Swapping letter case (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T8. Swapping letter case (10 points)</h4>\n<p><i>Coding task · E. Strings & Modular Functions · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>swap_case(s)</code> that converts all lowercase letters of a string to uppercase and all uppercase letters<br>to lowercase <b>without using the <code>swapcase()</code> method</b> (other characters stay unchanged).</p>\n<p>Example: <code>swap_case(\"PyThOn\")</code> → <code>\"pYtHoN\"</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def swap_case(s):\n    # write your code here\n    pass"
    },
    {
     "id": "T9",
     "title": "Task T9. Sequential if vs if-elif — predicting output (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T9. Sequential if vs if-elif — predicting output (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — B. Conditional Statements & Branching Algorithms · choose the correct answer (0 or 10 points)</i></p>\n<p>What does this code print?</p>\n<pre class=\"md-code\"><code>x = 15\nif x &gt; 10:\n    print(\"A\")\nif x &gt; 5:\n    print(\"B\")\nelif x &gt; 0:\n    print(\"C\")\nelse:\n    print(\"D\")</code></pre>",
     "options": {
      "a": "<code>A</code> and <code>B</code> (on two lines)",
      "b": "<code>A</code>, <code>B</code> and <code>C</code>",
      "c": "only <code>A</code>",
      "d": "only <code>B</code>"
     }
    },
    {
     "id": "T10",
     "title": "Task T10. Cyclic shift to the right by K (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T10. Cyclic shift to the right by K (10 points)</h4>\n<p><i>Coding task · D. Lists & Matrices (2D Arrays) · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>rotate_right(lst, k)</code> that <b>cyclically shifts</b> the elements of a list to the <b>right</b> by <code>k</code><br>positions and returns the result (<code>k</code> may be larger than the length of the list).</p>\n<p>Example: <code>rotate_right([1, 2, 3, 4, 5], 2)</code> → <code>[4, 5, 1, 2, 3]</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def rotate_right(lst, k):\n    # write your code here\n    pass"
    }
   ],
   "steps": [
    {
     "k": "code",
     "task": "T1",
     "code": "def reverse_number(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T1"
     ],
     "code": "def test_t1():\n    assert _same(_call(reverse_number, 1234), 4321), \"reverse_number(1234) should be 4321\"\n    assert _same(_call(reverse_number, 7), 7), \"reverse_number(7) should be 7\"\n    assert _same(_call(reverse_number, 90817), 71809), \"reverse_number(90817) should be 71809\"\n    assert _same(_call(reverse_number, 1200), 21), \"reverse_number(1200) should be 21\"\ncheck(\"T1\", 10, test_t1)"
    },
    {
     "k": "var",
     "task": "T2",
     "var": "answer_T2"
    },
    {
     "k": "test",
     "ids": [
      "T2"
     ],
     "code": "def test_t2():\n    assert _h(answer_T2) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"the selected answer is not correct\"\ncheck(\"T2\", 10, test_t2)"
    },
    {
     "k": "code",
     "task": "T3",
     "code": "def is_triangle(a, b, c):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T3"
     ],
     "code": "def test_t3():\n    return grade(\n        (3, \"is_triangle(3, 4, 5) should be True\", lambda: _same(_call(is_triangle, 3, 4, 5), True)),\n        (2, \"is_triangle(7, 10, 5) should be True\", lambda: _same(_call(is_triangle, 7, 10, 5), True)),\n        (2, \"is_triangle(1, 2, 3) should be False (a + b = c is not enough)\", lambda: _same(_call(is_triangle, 1, 2, 3), False)),\n        (3, \"is_triangle(10, 1, 2) and is_triangle(1, 10, 2) should be False (every side must be checked)\",\n         lambda: _same(_call(is_triangle, 10, 1, 2), False) and _same(_call(is_triangle, 1, 10, 2), False)),\n    )\ncheck(\"T3\", 10, test_t3)"
    },
    {
     "k": "var",
     "task": "T4",
     "var": "answer_T4"
    },
    {
     "k": "test",
     "ids": [
      "T4"
     ],
     "code": "def test_t4():\n    assert _h(answer_T4) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"the selected answer is not correct\"\ncheck(\"T4\", 10, test_t4)"
    },
    {
     "k": "code",
     "task": "T5",
     "code": "def convert_minutes(total):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T5"
     ],
     "code": "def test_t5():\n    assert _same(_call(convert_minutes, 1500), (1, 1, 0)), \"convert_minutes(1500) should be (1, 1, 0)\"\n    assert _same(_call(convert_minutes, 59), (0, 0, 59)), \"convert_minutes(59) should be (0, 0, 59)\"\n    assert _same(_call(convert_minutes, 2881), (2, 0, 1)), \"convert_minutes(2881) should be (2, 0, 1)\"\n    assert _same(_call(convert_minutes, 10000), (6, 22, 40)), \"convert_minutes(10000) should be (6, 22, 40)\"\ncheck(\"T5\", 10, test_t5)"
    },
    {
     "k": "code",
     "task": "T6",
     "code": "def max_min_index(lst):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T6"
     ],
     "code": "def test_t6():\n    cases = [([12, 45, 2, 89, 34], (89, 3, 2, 2)), ([-5, -1, -9, 0], (0, 3, -9, 2)), ([7, 3, 7, 3], (7, 0, 3, 1))]\n    res = [_seq(_call(max_min_index, lst), 4) for lst, _ in cases]\n    return grade(\n        (3, \"maximum value\", lambda: all(r and _same(r[0], e[0]) for r, (_, e) in zip(res, cases))),\n        (2, \"index of the maximum\", lambda: all(r and _same(r[1], e[1]) for r, (_, e) in zip(res, cases))),\n        (3, \"minimum value\", lambda: all(r and _same(r[2], e[2]) for r, (_, e) in zip(res, cases))),\n        (2, \"index of the minimum\", lambda: all(r and _same(r[3], e[3]) for r, (_, e) in zip(res, cases))),\n    )\ncheck(\"T6\", 10, test_t6)"
    },
    {
     "k": "var",
     "task": "T7",
     "var": "answer_T7"
    },
    {
     "k": "test",
     "ids": [
      "T7"
     ],
     "code": "def test_t7():\n    assert _h(answer_T7) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T7\", 10, test_t7)"
    },
    {
     "k": "code",
     "task": "T8",
     "code": "def swap_case(s):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T8"
     ],
     "code": "def test_t8():\n    return grade(\n        (5, 'swap_case(\"PyThOn\") should be \"pYtHoN\"', lambda: _same(_call(swap_case, \"PyThOn\"), \"pYtHoN\")),\n        (3, 'spaces and digits stay: swap_case(\"Hello World 2026\") should be \"hELLO wORLD 2026\"',\n         lambda: _same(_call(swap_case, \"Hello World 2026\"), \"hELLO wORLD 2026\")),\n        (2, 'swap_case(\"abc\") should be \"ABC\"', lambda: _same(_call(swap_case, \"abc\"), \"ABC\")),\n    )\ncheck(\"T8\", 10, test_t8)"
    },
    {
     "k": "var",
     "task": "T9",
     "var": "answer_T9"
    },
    {
     "k": "test",
     "ids": [
      "T9"
     ],
     "code": "def test_t9():\n    assert _h(answer_T9) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T9\", 10, test_t9)"
    },
    {
     "k": "code",
     "task": "T10",
     "code": "def rotate_right(lst, k):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T10"
     ],
     "code": "def test_t10():\n    return grade(\n        (5, \"rotate_right([1, 2, 3, 4, 5], 2) should be [4, 5, 1, 2, 3]\",\n         lambda: _same(_call(rotate_right, [1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3])),\n        (2, \"k = 1: rotate_right([10, 20, 30], 1) should be [30, 10, 20]\",\n         lambda: _same(_call(rotate_right, [10, 20, 30], 1), [30, 10, 20])),\n        (3, \"k larger than the length: rotate_right([1, 2, 3, 4, 5], 7) should be [4, 5, 1, 2, 3]\",\n         lambda: _same(_call(rotate_right, [1, 2, 3, 4, 5], 7), [4, 5, 1, 2, 3])),\n    )\ncheck(\"T10\", 10, test_t10)"
    }
   ]
  },
  "B": {
   "name": "Variant B",
   "max_score": 100,
   "items": [
    {
     "type": "task",
     "id": "T1"
    },
    {
     "type": "task",
     "id": "T2"
    },
    {
     "type": "task",
     "id": "T3"
    },
    {
     "type": "task",
     "id": "T4"
    },
    {
     "type": "task",
     "id": "T5"
    },
    {
     "type": "task",
     "id": "T6"
    },
    {
     "type": "task",
     "id": "T7"
    },
    {
     "type": "task",
     "id": "T8"
    },
    {
     "type": "task",
     "id": "T9"
    },
    {
     "type": "task",
     "id": "T10"
    }
   ],
   "tasks": [
    {
     "id": "T1",
     "title": "Task T1. Arithmetic operators and precedence (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T1. Arithmetic operators and precedence (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>What is the value of the following expression?</p>\n<pre class=\"md-code\"><code>2 + 3 * 4 ** 2 // 5 % 4</code></pre>",
     "options": {
      "a": "<code>11</code>",
      "b": "<code>0</code>",
      "c": "<code>9.6</code>",
      "d": "<code>3</code>"
     }
    },
    {
     "id": "T2",
     "title": "Task T2. Character frequency with a dictionary (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T2. Character frequency with a dictionary (10 points)</h4>\n<p><i>Coding task · E. Strings & Modular Functions · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>char_frequency(s)</code> that counts how many times each character occurs in a string and returns the<br>result as a <b>dictionary</b> <code>{character: count}</code>.</p>\n<p>Example: <code>char_frequency(\"kitab\")</code> → <code>{'k': 1, 'i': 1, 't': 1, 'a': 1, 'b': 1}</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def char_frequency(s):\n    # write your code here\n    pass"
    },
    {
     "id": "T3",
     "title": "Task T3. Right-angled triangle star pattern (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T3. Right-angled triangle star pattern (10 points)</h4>\n<p><i>Coding task · C. Loops, Sequences & Number Theory · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>star_triangle(n)</code> that uses <b>nested loops</b> to build an <code>n</code>-row right-angled triangle of stars.<br>You may print the rows, or return them as one text (rows separated by <code>\\n</code>) or as a list of rows.</p>\n<p>Example: <code>star_triangle(4)</code> prints</p>\n<pre class=\"md-code\"><code>*\n**\n***\n****</code></pre>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def star_triangle(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T4",
     "title": "Task T4. break, continue and loop-else — predicting output (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T4. break, continue and loop-else — predicting output (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — C. Loop Operators & Iteration · choose the correct answer (0 or 10 points)</i></p>\n<p>What does this code print?</p>\n<pre class=\"md-code\"><code>for i in range(1, 6):\n    if i == 2:\n        continue\n    if i == 4:\n        break\n    print(i)\nelse:\n    print(\"done\")</code></pre>",
     "options": {
      "a": "<code>1</code>, <code>3</code> and <code>done</code>",
      "b": "<code>1</code>, <code>3</code>, <code>5</code> and <code>done</code>",
      "c": "<code>1</code> and <code>3</code>",
      "d": "<code>1</code>, <code>2</code> and <code>3</code>"
     }
    },
    {
     "id": "T5",
     "title": "Task T5. Leap year (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T5. Leap year (10 points)</h4>\n<p><i>Coding task · B. Branching & Complex Decision-Making · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a function <code>is_leap(year)</code> that determines whether <code>year</code> is a <b>leap year</b> (366 days).<br>Rule: divisible by 4 and not by 100, <b>or</b> divisible by 400.<br>Return <code>True</code> / <code>False</code> (or print \"Leap year\" / \"Not a leap year\").</p>\n<p>Example: <code>is_leap(2024)</code> → <code>True</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def is_leap(year):\n    # write your code here\n    pass"
    },
    {
     "id": "T6",
     "title": "Task T6. Stack and heap memory (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T6. Stack and heap memory (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>In Python's memory model, which statement correctly describes the roles of the <b>stack</b> and the <b>heap</b>?</p>",
     "options": {
      "a": "All objects, including lists, are stored on the stack and are copied every time they are assigned to a new variable",
      "b": "The stack holds function call frames with local names (references) and is released automatically when a function returns; the heap holds the objects themselves (int, str, list …) and they are freed by reference counting / the garbage collector when no reference points to them",
      "c": "Heap memory in Python must be released manually by the programmer with a free() call",
      "d": "The heap is used only for global variables and the stack only for strings"
     }
    },
    {
     "id": "T7",
     "title": "Task T7. Removing duplicate elements (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T7. Removing duplicate elements (10 points)</h4>\n<p><i>Coding task · D. Lists & Matrices (2D Arrays) · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>unique(lst)</code> that builds and returns a <b>new list</b> with the duplicate elements removed.<br>Keep the elements in the order of their <b>first appearance</b>.</p>\n<p>Example: <code>unique([1, 2, 2, 3, 4, 4, 5])</code> → <code>[1, 2, 3, 4, 5]</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def unique(lst):\n    # write your code here\n    pass"
    },
    {
     "id": "T8",
     "title": "Task T8. Product of the digits of a 3-digit number (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T8. Product of the digits of a 3-digit number (10 points)</h4>\n<p><i>Coding task · A. Fundamental Operations & Mathematical Logic · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>digit_product(n)</code> that calculates the <b>product of the digits</b> of a 3-digit positive integer <code>n</code>.</p>\n<p>Example: <code>digit_product(384)</code> → <code>96</code>  (3 × 8 × 4)</p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def digit_product(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T9",
     "title": "Task T9. Nested if and indentation (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T9. Nested if and indentation (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — B. Conditional Statements & Branching Algorithms · choose the correct answer (0 or 10 points)</i></p>\n<p>What does this code print?</p>\n<pre class=\"md-code\"><code>x = 7\nif x &gt; 0:\n    if x % 2 == 0:\n        print(\"positive even\")\n    else:\n        print(\"positive odd\")\nelse:\n    print(\"not positive\")</code></pre>",
     "options": {
      "a": "<code>positive even</code> — a nested <code>if</code> is skipped, so its <code>else</code> part never runs",
      "b": "Nothing — nested <code>if</code> statements need curly braces <code>{ }</code> to run",
      "c": "<code>not positive</code> — every <code>else</code> belongs to the outermost <code>if</code>",
      "d": "<code>positive odd</code> — the inner <code>else</code> has the same indentation as the inner <code>if</code>, so it belongs to it"
     }
    },
    {
     "id": "T10",
     "title": "Task T10. Recursive factorial (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T10. Recursive factorial (10 points)</h4>\n<p><i>Coding task · E. Strings & Modular Functions · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a <b>recursive</b> function <code>factorial_recursive(n)</code> that calculates n! (the function calls itself; 0! = 1).</p>\n<p>Example: <code>factorial_recursive(5)</code> → <code>120</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def factorial_recursive(n):\n    # write your code here\n    pass"
    }
   ],
   "steps": [
    {
     "k": "var",
     "task": "T1",
     "var": "answer_T1"
    },
    {
     "k": "test",
     "ids": [
      "T1"
     ],
     "code": "def test_t1():\n    assert _h(answer_T1) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"the selected answer is not correct\"\ncheck(\"T1\", 10, test_t1)"
    },
    {
     "k": "code",
     "task": "T2",
     "code": "def char_frequency(s):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T2"
     ],
     "code": "def test_t2():\n    return grade(\n        (4, \"char_frequency('kitab') should be {'k': 1, 'i': 1, 't': 1, 'a': 1, 'b': 1}\",\n         lambda: _same(_call(char_frequency, \"kitab\"), {'k': 1, 'i': 1, 't': 1, 'a': 1, 'b': 1})),\n        (4, \"repeated characters: char_frequency('hello') should be {'h': 1, 'e': 1, 'l': 2, 'o': 1}\",\n         lambda: _same(_call(char_frequency, \"hello\"), {'h': 1, 'e': 1, 'l': 2, 'o': 1})),\n        (2, \"char_frequency('aaa') should be {'a': 3}\", lambda: _same(_call(char_frequency, \"aaa\"), {'a': 3})),\n    )\ncheck(\"T2\", 10, test_t2)"
    },
    {
     "k": "code",
     "task": "T3",
     "code": "def star_triangle(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T3"
     ],
     "code": "def test_t3():\n    def rows(n):\n        return [r.replace(\" \", \"\") for r in _lines(_call(star_triangle, n))]\n    return grade(\n        (5, \"star_triangle(4) should give 4 rows: *, **, ***, ****\", lambda: rows(4) == [\"*\" * i for i in range(1, 5)]),\n        (3, \"star_triangle(6) should give 6 rows\", lambda: rows(6) == [\"*\" * i for i in range(1, 7)]),\n        (2, \"star_triangle(1) should give one row: *\", lambda: rows(1) == [\"*\"]),\n    )\ncheck(\"T3\", 10, test_t3)"
    },
    {
     "k": "var",
     "task": "T4",
     "var": "answer_T4"
    },
    {
     "k": "test",
     "ids": [
      "T4"
     ],
     "code": "def test_t4():\n    assert _h(answer_T4) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"the selected answer is not correct\"\ncheck(\"T4\", 10, test_t4)"
    },
    {
     "k": "code",
     "task": "T5",
     "code": "def is_leap(year):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T5"
     ],
     "code": "def test_t5():\n    assert _same(_call(is_leap, 2024), True), \"2024 is a leap year\"\n    assert _same(_call(is_leap, 2023), False), \"2023 is not a leap year\"\n    assert _same(_call(is_leap, 1900), False), \"1900 is not a leap year (divisible by 100 but not by 400)\"\n    assert _same(_call(is_leap, 2000), True), \"2000 is a leap year (divisible by 400)\"\ncheck(\"T5\", 10, test_t5)"
    },
    {
     "k": "var",
     "task": "T6",
     "var": "answer_T6"
    },
    {
     "k": "test",
     "ids": [
      "T6"
     ],
     "code": "def test_t6():\n    assert _h(answer_T6) == \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\", \"the selected answer is not correct\"\ncheck(\"T6\", 10, test_t6)"
    },
    {
     "k": "code",
     "task": "T7",
     "code": "def unique(lst):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T7"
     ],
     "code": "def test_t7():\n    return grade(\n        (5, \"unique([1, 2, 2, 3, 4, 4, 5]) should be [1, 2, 3, 4, 5]\",\n         lambda: _same(_call(unique, [1, 2, 2, 3, 4, 4, 5]), [1, 2, 3, 4, 5])),\n        (3, \"order of first appearance: unique([3, 1, 3, 2, 1]) should be [3, 1, 2]\",\n         lambda: _same(_call(unique, [3, 1, 3, 2, 1]), [3, 1, 2])),\n        (2, \"all elements equal: unique([7, 7, 7]) should be [7]\", lambda: _same(_call(unique, [7, 7, 7]), [7])),\n    )\ncheck(\"T7\", 10, test_t7)"
    },
    {
     "k": "code",
     "task": "T8",
     "code": "def digit_product(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T8"
     ],
     "code": "def test_t8():\n    return grade(\n        (4, \"digit_product(384) should be 96\", lambda: _same(_call(digit_product, 384), 96)),\n        (2, \"digit_product(999) should be 729\", lambda: _same(_call(digit_product, 999), 729)),\n        (2, \"digit_product(211) should be 2\", lambda: _same(_call(digit_product, 211), 2)),\n        (2, \"digit_product(105) should be 0 (a zero digit)\", lambda: _same(_call(digit_product, 105), 0)),\n    )\ncheck(\"T8\", 10, test_t8)"
    },
    {
     "k": "var",
     "task": "T9",
     "var": "answer_T9"
    },
    {
     "k": "test",
     "ids": [
      "T9"
     ],
     "code": "def test_t9():\n    assert _h(answer_T9) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"the selected answer is not correct\"\ncheck(\"T9\", 10, test_t9)"
    },
    {
     "k": "code",
     "task": "T10",
     "code": "def factorial_recursive(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T10"
     ],
     "code": "def test_t10():\n    assert _same(_call(factorial_recursive, 5), 120), \"factorial_recursive(5) should be 120\"\n    assert _same(_call(factorial_recursive, 1), 1), \"factorial_recursive(1) should be 1\"\n    assert _same(_call(factorial_recursive, 0), 1), \"factorial_recursive(0) should be 1\"\n    assert _same(_call(factorial_recursive, 10), 3628800), \"factorial_recursive(10) should be 3628800\"\ncheck(\"T10\", 10, test_t10)"
    }
   ]
  },
  "C": {
   "name": "Variant C",
   "max_score": 100,
   "items": [
    {
     "type": "task",
     "id": "T1"
    },
    {
     "type": "task",
     "id": "T2"
    },
    {
     "type": "task",
     "id": "T3"
    },
    {
     "type": "task",
     "id": "T4"
    },
    {
     "type": "task",
     "id": "T5"
    },
    {
     "type": "task",
     "id": "T6"
    },
    {
     "type": "task",
     "id": "T7"
    },
    {
     "type": "task",
     "id": "T8"
    },
    {
     "type": "task",
     "id": "T9"
    },
    {
     "type": "task",
     "id": "T10"
    }
   ],
   "tasks": [
    {
     "id": "T1",
     "title": "Task T1. Prime or composite (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T1. Prime or composite (10 points)</h4>\n<p><i>Coding task · C. Loops, Sequences & Number Theory · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>is_prime(n)</code> that determines whether a positive integer <code>n</code> is <b>prime</b>.<br>Return <code>True</code> / <code>False</code> (or print \"Prime number\" / \"Composite number\"). Remember: 1 is not prime.</p>\n<p>Example: <code>is_prime(17)</code> → <code>True</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def is_prime(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T2",
     "title": "Task T2. References: two names, one object (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T2. References: two names, one object (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>What does this code print, and why?</p>\n<pre class=\"md-code\"><code>a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)</code></pre>",
     "options": {
      "a": "<code>[1, 2, 3, 4]</code> — <code>b = a</code> copies only the reference, so both names point to the same list object on the heap",
      "b": "<code>[1, 2, 3]</code> — <code>b = a</code> creates an independent copy of the list on the stack",
      "c": "<code>[1, 2, 3, 4]</code> — because <code>append()</code> adds the element to every list in the program",
      "d": "An error — two variables cannot refer to the same object"
     }
    },
    {
     "id": "T3",
     "title": "Task T3. Bubble Sort (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T3. Bubble Sort (10 points)</h4>\n<p><i>Coding task · D. Lists & Matrices (2D Arrays) · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>bubble_sort(lst)</code> that sorts the elements of a list in <b>ascending order</b> using the<br><b>Bubble Sort</b> algorithm (repeatedly swap neighbouring elements that are in the wrong order) and returns the sorted list.</p>\n<p>Example: <code>bubble_sort([64, 34, 25, 12, 22, 11, 90])</code> → <code>[11, 12, 22, 25, 34, 64, 90]</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def bubble_sort(lst):\n    # write your code here\n    pass"
    },
    {
     "id": "T4",
     "title": "Task T4. Armstrong numbers (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T4. Armstrong numbers (10 points)</h4>\n<p><i>Coding task · C. Loops, Sequences & Number Theory · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>armstrong_numbers(start, end)</code> that returns a list of all 3-digit <b>Armstrong numbers</b> in the range<br><code>start … end</code> (both included). A 3-digit number is an Armstrong number if the sum of the cubes of its digits equals the<br>number itself, e.g. 153 = 1³ + 5³ + 3³.</p>\n<p>Example: <code>armstrong_numbers(100, 999)</code> → <code>[153, 370, 371, 407]</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def armstrong_numbers(start, end):\n    # write your code here\n    pass"
    },
    {
     "id": "T5",
     "title": "Task T5. The ternary (inline if) operator (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T5. The ternary (inline if) operator (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>Which line is a <b>correct</b> Python conditional (ternary) expression that stores <code>\"even\"</code> or <code>\"odd\"</code> in <code>parity</code>?</p>",
     "options": {
      "a": "<code>parity = \"even\" if n % 2 == 0 else \"odd\"</code>",
      "b": "<code>parity = if n % 2 == 0 \"even\" else \"odd\"</code>",
      "c": "<code>parity = n % 2 == 0 ? \"even\" : \"odd\"</code>",
      "d": "<code>parity = \"even\" if n % 2 == 0</code>"
     }
    },
    {
     "id": "T6",
     "title": "Task T6. Euclidean distance between two points (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T6. Euclidean distance between two points (10 points)</h4>\n<p><i>Coding task · A. Fundamental Operations & Mathematical Logic · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a function <code>distance(x1, y1, x2, y2)</code> that calculates the Euclidean distance between the points<br>(x1, y1) and (x2, y2):</p>\n<p>d = √((x2 − x1)² + (y2 − y1)²)</p>\n<p>Example: <code>distance(0, 0, 3, 4)</code> → <code>5.0</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def distance(x1, y1, x2, y2):\n    # write your code here\n    pass"
    },
    {
     "id": "T7",
     "title": "Task T7. range(start, stop, step) (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T7. range(start, stop, step) (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — C. Loop Operators & Iteration · choose the correct answer (0 or 10 points)</i></p>\n<p>Which call produces exactly the numbers <code>10, 7, 4, 1</code>?</p>",
     "options": {
      "a": "<code>range(10, 0, -3)</code>",
      "b": "<code>range(1, 10, 3)</code>",
      "c": "<code>range(10, -3)</code>",
      "d": "<code>range(10, 1, -3)</code>"
     }
    },
    {
     "id": "T8",
     "title": "Task T8. 3-digit palindrome (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T8. 3-digit palindrome (10 points)</h4>\n<p><i>Coding task · B. Branching & Complex Decision-Making · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a function <code>is_palindrome(n)</code> that checks whether a 3-digit integer <code>n</code> is a <b>palindrome</b><br>(reads the same forward and backward). Return <code>True</code> / <code>False</code> (or print \"Palindrome\" / \"Not a palindrome\").</p>\n<p>Examples: <code>is_palindrome(121)</code> → <code>True</code>, <code>is_palindrome(123)</code> → <code>False</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def is_palindrome(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T9",
     "title": "Task T9. The pass statement (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T9. The pass statement (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — B. Conditional Statements & Branching Algorithms · choose the correct answer (0 or 10 points)</i></p>\n<p>What is the purpose of the <code>pass</code> statement inside a conditional block?</p>",
     "options": {
      "a": "It is a placeholder that does nothing: a block after <code>if</code> / <code>else</code> / <code>def</code> cannot be empty, so <code>pass</code> lets you leave it empty without a syntax error",
      "b": "It leaves the function and returns a value, exactly like <code>return</code>",
      "c": "It stops the whole program immediately",
      "d": "It skips the rest of the current loop iteration, exactly like <code>continue</code>"
     }
    },
    {
     "id": "T10",
     "title": "Task T10. The longest word in a sentence (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T10. The longest word in a sentence (10 points)</h4>\n<p><i>Coding task · E. Strings & Modular Functions · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>longest_word(sentence)</code> that finds and returns the <b>longest word</b> in a sentence<br>(if several words have the same length, return the first one).</p>\n<p>Example: <code>longest_word(\"Proqramlaşdırma kursu uğurla başladı\")</code> → <code>\"Proqramlaşdırma\"</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def longest_word(sentence):\n    # write your code here\n    pass"
    }
   ],
   "steps": [
    {
     "k": "code",
     "task": "T1",
     "code": "def is_prime(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T1"
     ],
     "code": "def test_t1():\n    return grade(\n        (4, \"primes 17, 2 and 97 should give True\",\n         lambda: all(_same(_call(is_prime, p), True) for p in (17, 2, 97))),\n        (3, \"composite numbers 15, 91 (7 x 13) and 49 should give False\",\n         lambda: all(_same(_call(is_prime, c), False) for c in (15, 91, 49))),\n        (3, \"1 is not prime\", lambda: _same(_call(is_prime, 1), False)),\n    )\ncheck(\"T1\", 10, test_t1)"
    },
    {
     "k": "var",
     "task": "T2",
     "var": "answer_T2"
    },
    {
     "k": "test",
     "ids": [
      "T2"
     ],
     "code": "def test_t2():\n    assert _h(answer_T2) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T2\", 10, test_t2)"
    },
    {
     "k": "code",
     "task": "T3",
     "code": "def bubble_sort(lst):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T3"
     ],
     "code": "def test_t3():\n    return grade(\n        (5, \"bubble_sort([64, 34, 25, 12, 22, 11, 90]) should be [11, 12, 22, 25, 34, 64, 90]\",\n         lambda: _same(_call(bubble_sort, [64, 34, 25, 12, 22, 11, 90]), [11, 12, 22, 25, 34, 64, 90])),\n        (3, \"negative numbers and duplicates: [5, -1, 3, -1, 0] -> [-1, -1, 0, 3, 5]\",\n         lambda: _same(_call(bubble_sort, [5, -1, 3, -1, 0]), [-1, -1, 0, 3, 5])),\n        (2, \"a list in reverse order: [5, 4, 3, 2, 1] -> [1, 2, 3, 4, 5]\",\n         lambda: _same(_call(bubble_sort, [5, 4, 3, 2, 1]), [1, 2, 3, 4, 5])),\n    )\ncheck(\"T3\", 10, test_t3)"
    },
    {
     "k": "code",
     "task": "T4",
     "code": "def armstrong_numbers(start, end):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T4"
     ],
     "code": "def test_t4():\n    return grade(\n        (5, \"armstrong_numbers(100, 999) should be [153, 370, 371, 407]\",\n         lambda: _same(_call(armstrong_numbers, 100, 999), [153, 370, 371, 407])),\n        (3, \"armstrong_numbers(150, 380) should be [153, 370, 371]\",\n         lambda: _same(_call(armstrong_numbers, 150, 380), [153, 370, 371])),\n        (2, \"the end of the range is included: armstrong_numbers(400, 407) should be [407]\",\n         lambda: _same(_call(armstrong_numbers, 400, 407), [407])),\n    )\ncheck(\"T4\", 10, test_t4)"
    },
    {
     "k": "var",
     "task": "T5",
     "var": "answer_T5"
    },
    {
     "k": "test",
     "ids": [
      "T5"
     ],
     "code": "def test_t5():\n    assert _h(answer_T5) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T5\", 10, test_t5)"
    },
    {
     "k": "code",
     "task": "T6",
     "code": "def distance(x1, y1, x2, y2):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T6"
     ],
     "code": "def test_t6():\n    assert _same(_call(distance, 0, 0, 3, 4), 5.0), \"distance(0, 0, 3, 4) should be 5.0\"\n    assert _same(_call(distance, -1, 2, 5, -6), 10.0), \"distance(-1, 2, 5, -6) should be 10.0\"\n    assert _same(_call(distance, 0, 0, 1, 1), 1.41421356), \"distance(0, 0, 1, 1) should be about 1.414\"\n    assert _same(_call(distance, 2, 3, 2, 3), 0), \"distance between equal points should be 0\"\ncheck(\"T6\", 10, test_t6)"
    },
    {
     "k": "var",
     "task": "T7",
     "var": "answer_T7"
    },
    {
     "k": "test",
     "ids": [
      "T7"
     ],
     "code": "def test_t7():\n    assert _h(answer_T7) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T7\", 10, test_t7)"
    },
    {
     "k": "code",
     "task": "T8",
     "code": "def is_palindrome(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T8"
     ],
     "code": "def test_t8():\n    assert _same(_call(is_palindrome, 121), True), \"121 is a palindrome\"\n    assert _same(_call(is_palindrome, 123), False), \"123 is not a palindrome\"\n    assert _same(_call(is_palindrome, 707), True), \"707 is a palindrome\"\n    assert _same(_call(is_palindrome, 100), False), \"100 is not a palindrome\"\ncheck(\"T8\", 10, test_t8)"
    },
    {
     "k": "var",
     "task": "T9",
     "var": "answer_T9"
    },
    {
     "k": "test",
     "ids": [
      "T9"
     ],
     "code": "def test_t9():\n    assert _h(answer_T9) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T9\", 10, test_t9)"
    },
    {
     "k": "code",
     "task": "T10",
     "code": "def longest_word(sentence):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T10"
     ],
     "code": "def test_t10():\n    return grade(\n        (5, 'longest_word(\"Proqramlaşdırma kursu uğurla başladı\") should be \"Proqramlaşdırma\"',\n         lambda: _same(_call(longest_word, \"Proqramlaşdırma kursu uğurla başladı\"), \"Proqramlaşdırma\")),\n        (3, 'longest_word(\"Python is a great language\") should be \"language\"',\n         lambda: _same(_call(longest_word, \"Python is a great language\"), \"language\")),\n        (2, 'equal lengths -> the first one: longest_word(\"cat dog owl\") should be \"cat\"',\n         lambda: _same(_call(longest_word, \"cat dog owl\"), \"cat\")),\n    )\ncheck(\"T10\", 10, test_t10)"
    }
   ]
  },
  "D": {
   "name": "Variant D",
   "max_score": 100,
   "items": [
    {
     "type": "task",
     "id": "T1"
    },
    {
     "type": "task",
     "id": "T2"
    },
    {
     "type": "task",
     "id": "T3"
    },
    {
     "type": "task",
     "id": "T4"
    },
    {
     "type": "task",
     "id": "T5"
    },
    {
     "type": "task",
     "id": "T6"
    },
    {
     "type": "task",
     "id": "T7"
    },
    {
     "type": "task",
     "id": "T8"
    },
    {
     "type": "task",
     "id": "T9"
    },
    {
     "type": "task",
     "id": "T10"
    }
   ],
   "tasks": [
    {
     "id": "T1",
     "title": "Task T1. Ordering three numbers (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T1. Ordering three numbers (10 points)</h4>\n<p><i>Coding task · B. Branching & Complex Decision-Making · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>order_three(a, b, c)</code> that returns the three integers in <b>ascending order</b>:<br><code>smallest, middle, largest</code>. Try to solve it with <code>if</code> / <code>elif</code> comparisons.</p>\n<p>Example: <code>order_three(12, 45, 23)</code> → <code>(12, 23, 45)</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def order_three(a, b, c):\n    # write your code here\n    pass"
    },
    {
     "id": "T2",
     "title": "Task T2. High-level vs low-level languages; compiler vs interpreter (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T2. High-level vs low-level languages; compiler vs interpreter (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>Which statement correctly compares high-level and low-level programming languages, compilers and interpreters, and correctly classifies Python?</p>",
     "options": {
      "a": "A compiler executes the program line by line, while an interpreter first translates the whole program into machine code",
      "b": "Python is a low-level language because it can directly control CPU registers, and it is compiled to an .exe file before every run",
      "c": "High-level languages are close to human language and portable, low-level languages (machine code, assembly) are close to the hardware; a compiler translates the whole program before it runs, an interpreter executes it statement by statement — Python is a high-level, interpreted language",
      "d": "High-level languages always run faster than machine code, because they do not need any translation"
     }
    },
    {
     "id": "T3",
     "title": "Task T3. Filtering even numbers (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T3. Filtering even numbers (10 points)</h4>\n<p><i>Coding task · E. Strings & Modular Functions · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>get_evens(lst)</code> that filters the <b>even numbers</b> from a list and returns them as a <b>new list</b>.</p>\n<p>Example: <code>get_evens([1, 2, 3, 4, 5, 6])</code> → <code>[2, 4, 6]</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def get_evens(lst):\n    # write your code here\n    pass"
    },
    {
     "id": "T4",
     "title": "Task T4. range() — start included, stop excluded (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T4. range() — start included, stop excluded (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — C. Loop Operators & Iteration · choose the correct answer (0 or 10 points)</i></p>\n<p>What does <code>list(range(2, 12, 3))</code> return?</p>",
     "options": {
      "a": "<code>[2, 5, 8, 11]</code> — the start value is included, the stop value (12) is excluded and the step is 3",
      "b": "<code>[3, 6, 9, 12]</code>",
      "c": "<code>[2, 5, 8, 11, 14]</code>",
      "d": "<code>[2, 5, 8]</code>"
     }
    },
    {
     "id": "T5",
     "title": "Task T5. Sum of the digits of a 3-digit number (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T5. Sum of the digits of a 3-digit number (10 points)</h4>\n<p><i>Coding task · A. Fundamental Operations & Mathematical Logic · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>digit_sum(n)</code> that calculates the <b>sum of the digits</b> of a 3-digit positive integer <code>n</code>.</p>\n<p>Example: <code>digit_sum(384)</code> → <code>15</code>  (3 + 8 + 4)</p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def digit_sum(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T6",
     "title": "Task T6. Dynamic typing and indentation (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T6. Dynamic typing and indentation (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>Which statement about <b>dynamic typing</b> and <b>indentation</b> in Python is correct?</p>",
     "options": {
      "a": "Every variable must be declared with its type, e.g. <code>int x = 5</code>, and the type can never change",
      "b": "The type belongs to the object, not to the variable, so the same name can refer to an <code>int</code> and later to a <code>str</code>; indentation is part of the syntax — it defines code blocks after <code>if</code>, <code>for</code>, <code>def</code> …, and wrong indentation causes an <code>IndentationError</code>",
      "c": "After <code>x = 5</code>, the statement <code>x = \"hello\"</code> raises a <code>TypeError</code> because <code>x</code> is already an integer",
      "d": "Indentation is only for readability; Python uses curly braces <code>{ }</code> to define blocks"
     }
    },
    {
     "id": "T7",
     "title": "Task T7. Cyclic shift to the left by K (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T7. Cyclic shift to the left by K (10 points)</h4>\n<p><i>Coding task · D. Lists & Matrices (2D Arrays) · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a function <code>rotate_left(lst, k)</code> that <b>cyclically shifts</b> the elements of a list to the <b>left</b> by <code>k</code><br>positions and returns the result (<code>k</code> may be larger than the length of the list).</p>\n<p>Example: <code>rotate_left([1, 2, 3, 4, 5], 2)</code> → <code>[3, 4, 5, 1, 2]</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def rotate_left(lst, k):\n    # write your code here\n    pass"
    },
    {
     "id": "T8",
     "title": "Task T8. Quadrant of a point (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T8. Quadrant of a point (10 points)</h4>\n<p><i>Coding task · B. Branching & Complex Decision-Making · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>quadrant(x, y)</code> that determines where the point (x, y) lies in the 2D plane:<br><code>\"Quadrant I\"</code>, <code>\"Quadrant II\"</code>, <code>\"Quadrant III\"</code>, <code>\"Quadrant IV\"</code>, <code>\"X axis\"</code>, <code>\"Y axis\"</code> or <code>\"Origin\"</code>.<br>(Answers like <code>\"II\"</code>, <code>2</code> or <code>\"Quadrant 2\"</code> are also accepted.)</p>\n<p>Example: <code>quadrant(-3, 5)</code> → <code>\"Quadrant II\"</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def quadrant(x, y):\n    # write your code here\n    pass"
    },
    {
     "id": "T9",
     "title": "Task T9. All prime numbers up to N (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T9. All prime numbers up to N (10 points)</h4>\n<p><i>Coding task · C. Loops, Sequences & Number Theory · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>primes_up_to(n)</code> that returns a list of all <b>prime numbers up to <code>n</code></b> (including <code>n</code> if it is prime).</p>\n<p>Example: <code>primes_up_to(20)</code> → <code>[2, 3, 5, 7, 11, 13, 17, 19]</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def primes_up_to(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T10",
     "title": "Task T10. if / elif / else execution flow (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T10. if / elif / else execution flow (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — B. Conditional Statements & Branching Algorithms · choose the correct answer (0 or 10 points)</i></p>\n<p>Which statement correctly describes the difference between several separate <code>if</code> statements and an <code>if-elif-else</code> chain?</p>",
     "options": {
      "a": "Separate <code>if</code> statements are all checked independently, so more than one block can run; in an <code>if-elif-else</code> chain the conditions are checked from top to bottom and only the first true block runs (<code>else</code> runs only if no condition is true)",
      "b": "In an <code>if-elif-else</code> chain every block whose condition is true is executed",
      "c": "<code>elif</code> can be used on its own, without a preceding <code>if</code>",
      "d": "The <code>else</code> block of an <code>if-elif-else</code> chain always runs at the end, whatever the conditions are"
     }
    }
   ],
   "steps": [
    {
     "k": "code",
     "task": "T1",
     "code": "def order_three(a, b, c):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T1"
     ],
     "code": "def test_t1():\n    return grade(\n        (4, \"order_three(12, 45, 23) should be (12, 23, 45)\", lambda: _same(_call(order_three, 12, 45, 23), (12, 23, 45))),\n        (2, \"order_three(9, 5, 1) should be (1, 5, 9)\", lambda: _same(_call(order_three, 9, 5, 1), (1, 5, 9))),\n        (2, \"order_three(-2, 8, -5) should be (-5, -2, 8)\", lambda: _same(_call(order_three, -2, 8, -5), (-5, -2, 8))),\n        (2, \"order_three(4, 4, 2) should be (2, 4, 4)\", lambda: _same(_call(order_three, 4, 4, 2), (2, 4, 4))),\n    )\ncheck(\"T1\", 10, test_t1)"
    },
    {
     "k": "var",
     "task": "T2",
     "var": "answer_T2"
    },
    {
     "k": "test",
     "ids": [
      "T2"
     ],
     "code": "def test_t2():\n    assert _h(answer_T2) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"the selected answer is not correct\"\ncheck(\"T2\", 10, test_t2)"
    },
    {
     "k": "code",
     "task": "T3",
     "code": "def get_evens(lst):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T3"
     ],
     "code": "def test_t3():\n    return grade(\n        (5, \"get_evens([1, 2, 3, 4, 5, 6]) should be [2, 4, 6]\", lambda: _same(_call(get_evens, [1, 2, 3, 4, 5, 6]), [2, 4, 6])),\n        (3, \"negative numbers and zero: get_evens([-4, 0, 7, 10]) should be [-4, 0, 10]\",\n         lambda: _same(_call(get_evens, [-4, 0, 7, 10]), [-4, 0, 10])),\n        (2, \"no even numbers: get_evens([1, 3, 5]) should be []\", lambda: _same(_call(get_evens, [1, 3, 5]), [])),\n    )\ncheck(\"T3\", 10, test_t3)"
    },
    {
     "k": "var",
     "task": "T4",
     "var": "answer_T4"
    },
    {
     "k": "test",
     "ids": [
      "T4"
     ],
     "code": "def test_t4():\n    assert _h(answer_T4) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T4\", 10, test_t4)"
    },
    {
     "k": "code",
     "task": "T5",
     "code": "def digit_sum(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T5"
     ],
     "code": "def test_t5():\n    return grade(\n        (4, \"digit_sum(384) should be 15\", lambda: _same(_call(digit_sum, 384), 15)),\n        (2, \"digit_sum(999) should be 27\", lambda: _same(_call(digit_sum, 999), 27)),\n        (2, \"digit_sum(105) should be 6 (a zero digit in the middle)\", lambda: _same(_call(digit_sum, 105), 6)),\n        (2, \"digit_sum(100) should be 1\", lambda: _same(_call(digit_sum, 100), 1)),\n    )\ncheck(\"T5\", 10, test_t5)"
    },
    {
     "k": "var",
     "task": "T6",
     "var": "answer_T6"
    },
    {
     "k": "test",
     "ids": [
      "T6"
     ],
     "code": "def test_t6():\n    assert _h(answer_T6) == \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\", \"the selected answer is not correct\"\ncheck(\"T6\", 10, test_t6)"
    },
    {
     "k": "code",
     "task": "T7",
     "code": "def rotate_left(lst, k):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T7"
     ],
     "code": "def test_t7():\n    assert _same(_call(rotate_left, [1, 2, 3, 4, 5], 2), [3, 4, 5, 1, 2]), \"rotate_left([1, 2, 3, 4, 5], 2) should be [3, 4, 5, 1, 2]\"\n    assert _same(_call(rotate_left, [10, 20, 30], 1), [20, 30, 10]), \"rotate_left([10, 20, 30], 1) should be [20, 30, 10]\"\n    assert _same(_call(rotate_left, [1, 2, 3, 4, 5], 6), [2, 3, 4, 5, 1]), \"rotate_left([1, 2, 3, 4, 5], 6) should be [2, 3, 4, 5, 1]\"\ncheck(\"T7\", 10, test_t7)"
    },
    {
     "k": "code",
     "task": "T8",
     "code": "def quadrant(x, y):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T8"
     ],
     "code": "def test_t8():\n    import re\n    def where(x, y):\n        t = str(_call(quadrant, x, y)).casefold().replace(\"-\", \" \").replace(\"_\", \" \")\n        if \"origin\" in t or \"(0, 0)\" in t or \"mərkəz\" in t or \"başlanğıc\" in t:\n            return \"O\"\n        if \"axis\" in t or \"ox\" in t.split() or \"oy\" in t.split() or \"ox\" in t or \"oy\" in t:\n            if re.search(r\"\\bx\\b|ox|abscissa\", t):\n                return \"X\"\n            if re.search(r\"\\by\\b|oy|ordinate\", t):\n                return \"Y\"\n        t = t.replace(\"quadrant\", \" \").replace(\"rüb\", \" \")\n        for word, q in ((\"iv\", 4), (\"iii\", 3), (\"ii\", 2), (\"i\", 1)):\n            if re.search(r\"\\b\" + word + r\"\\b\", t):\n                return q\n        ns = _nums(t)\n        return ns[-1] if ns else None\n    return grade(\n        (2, \"quadrant(4, 7) should be Quadrant I\", lambda: where(4, 7) == 1),\n        (2, \"quadrant(-3, 5) should be Quadrant II\", lambda: where(-3, 5) == 2),\n        (2, \"quadrant(-2, -9) should be Quadrant III\", lambda: where(-2, -9) == 3),\n        (2, \"quadrant(6, -1) should be Quadrant IV\", lambda: where(6, -1) == 4),\n        (2, \"points on the axes / origin: (5, 0) X axis, (0, -3) Y axis, (0, 0) Origin\",\n         lambda: where(5, 0) == \"X\" and where(0, -3) == \"Y\" and where(0, 0) == \"O\"),\n    )\ncheck(\"T8\", 10, test_t8)"
    },
    {
     "k": "code",
     "task": "T9",
     "code": "def primes_up_to(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T9"
     ],
     "code": "def test_t9():\n    return grade(\n        (5, \"primes_up_to(20) should be [2, 3, 5, 7, 11, 13, 17, 19]\",\n         lambda: _same(_call(primes_up_to, 20), [2, 3, 5, 7, 11, 13, 17, 19])),\n        (3, \"primes_up_to(29) should end with 23, 29 (n itself is included)\",\n         lambda: _same(_call(primes_up_to, 29), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29])),\n        (2, \"primes_up_to(2) should be [2]\", lambda: _same(_call(primes_up_to, 2), [2])),\n    )\ncheck(\"T9\", 10, test_t9)"
    },
    {
     "k": "var",
     "task": "T10",
     "var": "answer_T10"
    },
    {
     "k": "test",
     "ids": [
      "T10"
     ],
     "code": "def test_t10():\n    assert _h(answer_T10) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T10\", 10, test_t10)"
    }
   ]
  },
  "E": {
   "name": "Variant E",
   "max_score": 100,
   "items": [
    {
     "type": "task",
     "id": "T1"
    },
    {
     "type": "task",
     "id": "T2"
    },
    {
     "type": "task",
     "id": "T3"
    },
    {
     "type": "task",
     "id": "T4"
    },
    {
     "type": "task",
     "id": "T5"
    },
    {
     "type": "task",
     "id": "T6"
    },
    {
     "type": "task",
     "id": "T7"
    },
    {
     "type": "task",
     "id": "T8"
    },
    {
     "type": "task",
     "id": "T9"
    },
    {
     "type": "task",
     "id": "T10"
    }
   ],
   "tasks": [
    {
     "id": "T1",
     "title": "Task T1. Division operators: /, // and % (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T1. Division operators: /, // and % (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>What do the expressions <code>7 / 2</code>, <code>7 // 2</code>, <code>7 % 2</code> and <code>-7 // 2</code> evaluate to (in this order)?</p>",
     "options": {
      "a": "<code>3</code>, <code>3</code>, <code>1</code>, <code>-3</code>",
      "b": "<code>3.5</code>, <code>3</code>, <code>1</code>, <code>-3</code>",
      "c": "<code>3.5</code>, <code>3.5</code>, <code>1</code>, <code>-3</code>",
      "d": "<code>3.5</code>, <code>3</code>, <code>1</code>, <code>-4</code>"
     }
    },
    {
     "id": "T2",
     "title": "Task T2. GCD with the Euclidean Algorithm (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T2. GCD with the Euclidean Algorithm (10 points)</h4>\n<p><i>Coding task · E. Strings & Modular Functions · grading: 0 or 10 points (all checks must pass)</i></p>\n<p>Write a function <code>gcd(a, b)</code> that calculates the <b>Greatest Common Divisor</b> of two numbers using the<br><b>Euclidean Algorithm</b> (repeatedly replace (a, b) with (b, a % b) until b becomes 0).</p>\n<p>Example: <code>gcd(48, 18)</code> → <code>6</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def gcd(a, b):\n    # write your code here\n    pass"
    },
    {
     "id": "T3",
     "title": "Task T3. Short-circuit evaluation (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T3. Short-circuit evaluation (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — B. Conditional Statements & Branching Algorithms · choose the correct answer (0 or 10 points)</i></p>\n<p><code>x = 0</code>. What happens when Python evaluates the condition below?</p>\n<pre class=\"md-code\"><code>if x != 0 and 10 / x &gt; 1:\n    print(\"big\")</code></pre>",
     "options": {
      "a": "The condition is <code>False</code> and no error occurs: <code>and</code> stops at the first false operand, so <code>10 / x</code> is never evaluated",
      "b": "A <code>ZeroDivisionError</code> is raised, because Python always evaluates both operands of <code>and</code>",
      "c": "The condition is <code>True</code>, because <code>10 / 0</code> is treated as infinity",
      "d": "Python evaluates the right operand first, so the result depends only on <code>10 / x &gt; 1</code>"
     }
    },
    {
     "id": "T4",
     "title": "Task T4. First and last digit of a 4-digit number (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T4. First and last digit of a 4-digit number (10 points)</h4>\n<p><i>Coding task · A. Fundamental Operations & Mathematical Logic · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>first_last(n)</code> that finds the <b>first digit</b>, the <b>last digit</b> of a 4-digit positive integer <code>n</code><br>and their <b>sum</b>, and returns the three values: <code>first, last, total</code>.</p>\n<p>Example: <code>first_last(4579)</code> → <code>(4, 9, 13)</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def first_last(n):\n    # write your code here\n    pass"
    },
    {
     "id": "T5",
     "title": "Task T5. Truthy and falsy values (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T5. Truthy and falsy values (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — A. Core Concepts, Memory, Types & Operators · choose the correct answer (0 or 10 points)</i></p>\n<p>Which list contains <b>only</b> values that evaluate to <code>False</code> in a condition (falsy values)?</p>",
     "options": {
      "a": "<code>0</code>, <code>'0'</code>, <code>[]</code>, <code>None</code>",
      "b": "<code>0</code>, <code>0.0</code>, <code>''</code>, <code>[]</code>, <code>{}</code>, <code>None</code>, <code>False</code>",
      "c": "<code>None</code>, <code>[0]</code>, <code>0.0</code>, <code>''</code>",
      "d": "<code>False</code>, <code>' '</code> (a space), <code>()</code>, <code>0</code>"
     }
    },
    {
     "id": "T6",
     "title": "Task T6. Second largest element of a list (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T6. Second largest element of a list (10 points)</h4>\n<p><i>Coding task · D. Lists & Matrices (2D Arrays) · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>second_largest(lst)</code> that returns the <b>second largest distinct value</b> in a list<br>(repeated copies of the maximum do not count as the second largest).</p>\n<p>Examples: <code>second_largest([12, 45, 2, 89, 34])</code> → <code>45</code>, <code>second_largest([10, 20, 20, 5])</code> → <code>10</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def second_largest(lst):\n    # write your code here\n    pass"
    },
    {
     "id": "T7",
     "title": "Task T7. for vs while loops and infinite loops (10 points)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Task T7. for vs while loops and infinite loops (10 points)</h4>\n<p><i>Theoretical question · Theoretical Concepts — C. Loop Operators & Iteration · choose the correct answer (0 or 10 points)</i></p>\n<p>Which statement about <code>for</code> and <code>while</code> loops in Python is correct?</p>",
     "options": {
      "a": "<code>for</code> iterates over the elements of a sequence / iterable, <code>while</code> repeats as long as its condition is <code>True</code>; a <code>while</code> loop becomes infinite when its condition never becomes <code>False</code> (for example, the loop variable is never changed inside the loop)",
      "b": "A <code>while</code> loop must always run a fixed number of times that is known in advance",
      "c": "A <code>for</code> loop over a list becomes infinite if the list has more than 1000 elements",
      "d": "Infinite loops are impossible in Python because the interpreter stops every loop after 1000 iterations"
     }
    },
    {
     "id": "T8",
     "title": "Task T8. Maximum and minimum of three numbers (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T8. Maximum and minimum of three numbers (10 points)</h4>\n<p><i>Coding task · B. Branching & Complex Decision-Making · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>max_min(a, b, c)</code> that finds the <b>maximum</b> and the <b>minimum</b> of three integers and returns them<br>as two values: <code>maximum, minimum</code>.</p>\n<p>Example: <code>max_min(12, 45, 23)</code> → <code>(45, 12)</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def max_min(a, b, c):\n    # write your code here\n    pass"
    },
    {
     "id": "T9",
     "title": "Task T9. Seconds → hours, minutes, seconds (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T9. Seconds → hours, minutes, seconds (10 points)</h4>\n<p><i>Coding task · A. Fundamental Operations & Mathematical Logic · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>convert_seconds(total)</code> that converts a number of seconds into <b>hours, minutes and seconds</b><br>and returns them as three values: <code>hours, minutes, seconds</code>.</p>\n<p>Example: <code>convert_seconds(3665)</code> → <code>(1, 1, 5)</code>  (1 hour, 1 minute, 5 seconds)</p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def convert_seconds(total):\n    # write your code here\n    pass"
    },
    {
     "id": "T10",
     "title": "Task T10. GCD and LCM of two numbers (10 points)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Task T10. GCD and LCM of two numbers (10 points)</h4>\n<p><i>Coding task · C. Loops, Sequences & Number Theory · grading: partial credit, 0–10 points (every correct part earns points)</i></p>\n<p>Write a function <code>gcd_lcm(a, b)</code> that calculates the <b>Greatest Common Divisor (GCD)</b> and the<br><b>Least Common Multiple (LCM)</b> of two natural numbers and returns them as two values: <code>gcd, lcm</code>.</p>\n<p>Example: <code>gcd_lcm(12, 18)</code> → <code>(6, 36)</code></p>\n<p><i>Return the result from the function (printing it is also accepted). Do not use <code>input()</code> — the values arrive as function parameters.</i></p>",
     "starter": "def gcd_lcm(a, b):\n    # write your code here\n    pass"
    }
   ],
   "steps": [
    {
     "k": "var",
     "task": "T1",
     "var": "answer_T1"
    },
    {
     "k": "test",
     "ids": [
      "T1"
     ],
     "code": "def test_t1():\n    assert _h(answer_T1) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"the selected answer is not correct\"\ncheck(\"T1\", 10, test_t1)"
    },
    {
     "k": "code",
     "task": "T2",
     "code": "def gcd(a, b):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T2"
     ],
     "code": "def test_t2():\n    assert _same(_call(gcd, 48, 18), 6), \"gcd(48, 18) should be 6\"\n    assert _same(_call(gcd, 17, 5), 1), \"gcd(17, 5) should be 1\"\n    assert _same(_call(gcd, 100, 75), 25), \"gcd(100, 75) should be 25\"\n    assert _same(_call(gcd, 7, 0), 7), \"gcd(7, 0) should be 7\"\ncheck(\"T2\", 10, test_t2)"
    },
    {
     "k": "var",
     "task": "T3",
     "var": "answer_T3"
    },
    {
     "k": "test",
     "ids": [
      "T3"
     ],
     "code": "def test_t3():\n    assert _h(answer_T3) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T3\", 10, test_t3)"
    },
    {
     "k": "code",
     "task": "T4",
     "code": "def first_last(n):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T4"
     ],
     "code": "def test_t4():\n    cases = {4579: (4, 9, 13), 1000: (1, 0, 1), 9081: (9, 1, 10), 2222: (2, 2, 4)}\n    res = {n: _seq(_call(first_last, n), 3) for n in cases}\n    return grade(\n        (3, \"first digit\", lambda: all(res[n] and _same(res[n][0], e[0]) for n, e in cases.items())),\n        (3, \"last digit\", lambda: all(res[n] and _same(res[n][1], e[1]) for n, e in cases.items())),\n        (4, \"sum of the first and last digit\", lambda: all(res[n] and _same(res[n][2], e[2]) for n, e in cases.items())),\n    )\ncheck(\"T4\", 10, test_t4)"
    },
    {
     "k": "var",
     "task": "T5",
     "var": "answer_T5"
    },
    {
     "k": "test",
     "ids": [
      "T5"
     ],
     "code": "def test_t5():\n    assert _h(answer_T5) == \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\", \"the selected answer is not correct\"\ncheck(\"T5\", 10, test_t5)"
    },
    {
     "k": "code",
     "task": "T6",
     "code": "def second_largest(lst):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T6"
     ],
     "code": "def test_t6():\n    return grade(\n        (5, \"second_largest([12, 45, 2, 89, 34]) should be 45\", lambda: _same(_call(second_largest, [12, 45, 2, 89, 34]), 45)),\n        (3, \"repeated maximum: second_largest([10, 20, 20, 5]) should be 10\", lambda: _same(_call(second_largest, [10, 20, 20, 5]), 10)),\n        (2, \"negative numbers: second_largest([-8, -3, -5]) should be -5\", lambda: _same(_call(second_largest, [-8, -3, -5]), -5)),\n    )\ncheck(\"T6\", 10, test_t6)"
    },
    {
     "k": "var",
     "task": "T7",
     "var": "answer_T7"
    },
    {
     "k": "test",
     "ids": [
      "T7"
     ],
     "code": "def test_t7():\n    assert _h(answer_T7) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"the selected answer is not correct\"\ncheck(\"T7\", 10, test_t7)"
    },
    {
     "k": "code",
     "task": "T8",
     "code": "def max_min(a, b, c):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T8"
     ],
     "code": "def test_t8():\n    cases = [((12, 45, 23), (45, 12)), ((7, 3, 9), (9, 3)), ((-3, -7, -1), (-1, -7)), ((5, 5, 1), (5, 1))]\n    res = [_seq(_call(max_min, *args), 2) for args, _ in cases]\n    return grade(\n        (5, \"maximum\", lambda: all(r and _same(r[0], e[0]) for r, (_, e) in zip(res, cases))),\n        (5, \"minimum\", lambda: all(r and _same(r[1], e[1]) for r, (_, e) in zip(res, cases))),\n    )\ncheck(\"T8\", 10, test_t8)"
    },
    {
     "k": "code",
     "task": "T9",
     "code": "def convert_seconds(total):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T9"
     ],
     "code": "def test_t9():\n    return grade(\n        (4, \"convert_seconds(3665) should be (1, 1, 5)\", lambda: _same(_call(convert_seconds, 3665), (1, 1, 5))),\n        (2, \"convert_seconds(59) should be (0, 0, 59)\", lambda: _same(_call(convert_seconds, 59), (0, 0, 59))),\n        (2, \"convert_seconds(7200) should be (2, 0, 0)\", lambda: _same(_call(convert_seconds, 7200), (2, 0, 0))),\n        (2, \"convert_seconds(86399) should be (23, 59, 59)\", lambda: _same(_call(convert_seconds, 86399), (23, 59, 59))),\n    )\ncheck(\"T9\", 10, test_t9)"
    },
    {
     "k": "code",
     "task": "T10",
     "code": "def gcd_lcm(a, b):\n    # write your code here\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "T10"
     ],
     "code": "def test_t10():\n    cases = [((12, 18), (6, 36)), ((7, 13), (1, 91)), ((20, 5), (5, 20)), ((21, 6), (3, 42))]\n    res = [_seq(_call(gcd_lcm, *args), 2) for args, _ in cases]\n    return grade(\n        (5, \"GCD\", lambda: all(r and _same(r[0], e[0]) for r, (_, e) in zip(res, cases))),\n        (5, \"LCM\", lambda: all(r and _same(r[1], e[1]) for r, (_, e) in zip(res, cases))),\n    )\ncheck(\"T10\", 10, test_t10)"
    }
   ]
  }
 }
};
