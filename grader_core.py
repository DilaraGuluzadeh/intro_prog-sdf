# -*- coding: utf-8 -*-
"""
Grading engine — the same code runs in the browser (Pyodide, index.html) and on the
teacher's computer (regrade.py).

HARNESS_SOURCE is embedded into exam_data.js by tools/build_bank.py.

Design goal: grade the RESULT, not the writing style.
  * A function may `return` its answer or simply `print` it — both are accepted.
  * Output format is flexible: 15, "15", "Sum of digits: 15", (1, 1, 5), "1 hour, 1 minute, 5 seconds" ...
  * list / tuple / NumPy-like values, 5 / 5.0, small rounding differences are all treated as equal.
  * Yes/no answers may be True/False or text such as "Prime number", "Not a palindrome", "Leap year".
  * If the student renames the function, the single function they wrote is used.
  * Tabs, Windows line breaks, "smart" quotes and copied Jupyter lines are cleaned automatically.
  * Only a few modules that could break the exam page are blocked; everything else is allowed.
"""

import types

HARNESS_SOURCE = r'''
import ast
import builtins
import contextlib
import copy
import hashlib
import io
import json
import math
import re
import sys
import time
import types

# Only modules that could interfere with the exam page are blocked; all other standard modules are allowed
_BLOCKED_MODULES = ("js", "pyodide", "pyodide_js", "_pyodide", "micropip", "subprocess", "socket")
_real_import = builtins.__import__


def _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
    if name.split(".")[0] in _BLOCKED_MODULES:
        raise ImportError(f"the '{name}' module is not available during the exam")
    return _real_import(name, globals, locals, fromlist, level)


class InputNotNeeded(Exception):
    pass


def _no_input(prompt=""):
    raise InputNotNeeded("input() is not needed in this exam — the values are passed to your function as parameters "
                         "(e.g. digit_sum(384)). Use the parameters instead of input().")


def _h(x):
    return hashlib.sha256(str(x).strip().lower().encode()).hexdigest()


def _plain(v):
    """Converts tuple / set / NumPy-like values to plain Python lists (for tolerant comparison)."""
    if hasattr(v, "tolist"):
        v = v.tolist()
    if isinstance(v, (list, tuple)):
        return [_plain(x) for x in v]
    if isinstance(v, dict):
        return {k: _plain(x) for k, x in v.items()}
    return v


def _close(a, b):
    """Number comparison: 5 == 5.0; floats may differ by a small rounding error (e.g. 1.41 vs 1.41421)."""
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    try:
        if math.isclose(a, b, rel_tol=1e-6, abs_tol=1e-9):
            return True
        if isinstance(b, float) and not float(b).is_integer():
            return abs(a - b) <= 0.006
        return False
    except TypeError:
        return False


def _eq(a, b):
    """Tolerant equality: list ~ tuple ~ array, 1.0 ~ 1, small float rounding allowed."""
    a, b = _plain(a), _plain(b)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(_eq(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_eq(a[k], b[k]) for k in a)
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return _close(a, b)
    return a == b


_NUM_RE = re.compile(r"-?\d+(?:\.\d+)?")


def _nums(text):
    """All numbers that appear in a text, e.g. 'GCD: 6, LCM: 36' -> [6, 36]."""
    return [float(m) if "." in m else int(m) for m in _NUM_RE.findall(str(text))]


def _call(fn, *args):
    """
    Calls the student's function with copies of the arguments.
    The returned value is used; if the function returns nothing, its printed output is used;
    if it only changed a list argument in place (e.g. sorting), that list is used.
    """
    args = copy.deepcopy(args)
    before = copy.deepcopy(args)
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        result = fn(*args)
    printed = buf.getvalue()
    if printed:
        sys.stdout.write(printed)
    if result is None:
        if printed.strip():
            return printed.strip()
        for now, was in zip(args, before):
            if isinstance(now, list) and now != was:
                return now
    return result


# Yes / no words (English, plus a few Azerbaijani words so students may also answer in their own language)
_NO = re.compile(r"\b(not|no|non|isn'?t|aren'?t|doesn'?t|does not|cannot|can'?t|invalid|composite|common|false|"
                 r"deyil|yox|xeyr|mürəkkəb|adi)\b")
_YES = re.compile(r"\b(yes|true|prime|leap|valid|palindrome|forms?|triangle|"
                  r"bəli|sadə|uyğun|palindrom|polindrom|üçbucaq|uzun)")


def _yes(v):
    """True / False from a yes-no style answer: True, 1, 'Prime number', 'Not a palindrome', 'Leap year' ..."""
    if isinstance(v, bool):
        return v
    if isinstance(v, int) and v in (0, 1):
        return bool(v)
    if isinstance(v, str):
        t = v.casefold()
        if _NO.search(t):
            return False
        if _YES.search(t):
            return True
    return None


def _clean_text(s):
    return " ".join(str(s).strip().strip("'\"").split())


def _same(got, exp):
    """Is the student's answer (returned or printed) equal to the expected value? Format-tolerant."""
    if isinstance(exp, bool):
        return _yes(got) is exp
    if got is None:
        return False
    if isinstance(exp, str):
        g, e = _clean_text(got), _clean_text(exp)
        if g == e:
            return True
        # a label in front of the answer is fine: "Longest word: 'Proqramlaşdırma'"
        g = g.rstrip(".!").strip("'\"")
        return g == e or (g.endswith(e) and g[-len(e) - 1] in " :='\"-")
    if isinstance(got, str):
        text = got.strip()
        try:
            if _eq(ast.literal_eval(text), exp):
                return True
        except Exception:
            pass
        if isinstance(exp, dict):
            m = re.search(r"\{.*\}", text, re.S)
            if m:
                try:
                    return _eq(ast.literal_eval(m.group(0)), exp)
                except Exception:
                    return False
            return False
        if isinstance(exp, (list, tuple)) and exp and all(isinstance(x, (int, float)) for x in exp):
            m = re.search(r"\[.*\]|\(.*\)", text, re.S)
            if m:
                try:
                    if _eq(ast.literal_eval(m.group(0)), exp):
                        return True
                except Exception:
                    pass
            ns = _nums(text)
            return len(ns) >= len(exp) and _eq(ns[len(ns) - len(exp):], list(exp))
        if isinstance(exp, (list, tuple)) and not exp:
            return text in ("[]", "()", "")
        if isinstance(exp, (int, float)):
            ns = _nums(text)
            after_label = [float(x) if "." in x else int(x) for x in re.findall(r"[:=]\s*(-?\d+(?:\.\d+)?)", text)]
            return any(_close(x, exp) for x in ns[-1:] + after_label)
        return False
    if isinstance(exp, (int, float)) and isinstance(got, (list, tuple)) and len(got) == 1:
        got = got[0]
    return _eq(got, exp)


def _seq(got, n):
    """The answer as a list of n values (from a tuple/list, or the last n numbers of a printed text)."""
    if isinstance(got, str):
        ns = _nums(got)
        return ns[len(ns) - n:] if len(ns) >= n else None
    v = _plain(got)
    return v if isinstance(v, list) and len(v) == n else None


def _lines(got):
    """A text pattern as a list of lines (trailing spaces and empty lines ignored)."""
    if got is None:
        return []
    if isinstance(got, (list, tuple)):
        rows = [str(x) for x in got]
    else:
        rows = str(got).split("\n")
    return [r.rstrip() for r in rows if r.strip()]


OK_MSG = "✅ Task {t}: CORRECT (+{p} points)"
PARTIAL_MSG = "🟡 Task {t}: PARTIALLY CORRECT (+{p} / {m} points)"
FAIL_MSG = "❌ Task {t}: NOT CORRECT — the returned / printed value does not match the expected result."


def grade(*items):
    """
    Partial credit: items = (weight, "what is checked", callable) ...
    Every part is checked separately; the weights of the passed parts are added up.
    Returns: (earned_weight, total_weight, [descriptions of failed parts]).
    """
    got = tot = 0
    failed = []
    for w, label, fn in items:
        tot += w
        try:
            r = fn()
            if r is None or (isinstance(r, bool) and not r):
                raise AssertionError
            got += w
        except AssertionError:
            failed.append(label)
        except Exception as e:
            failed.append(f"{label} ({type(e).__name__}: {e})")
    return (got, tot, failed)


def _exec_limited(code, ns, budget, out):
    """Runs code with a time limit (an infinite loop must not freeze the browser)."""
    deadline = time.monotonic() + budget

    def tracer(frame, event, arg):
        if time.monotonic() > deadline:
            raise TimeoutError(f"execution took longer than {budget:g} seconds (possible infinite loop)")
        return tracer

    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
        sys.settrace(tracer)
        try:
            exec(compile(code, "<code>", "exec"), ns)
        finally:
            sys.settrace(None)


_QUOTES = {"“": '"', "”": '"', "„": '"', "‘": "'", "’": "'", " ": " ", " ": " ",
           "​": "", "‌": "", "‍": "", "﻿": "", "–": "-", "−": "-"}


def normalize_code(code):
    """
    Accepts code in a tolerant way:
    CRLF, leading tabs (-> 4 spaces), invisible / non-standard characters (NBSP, ​), "smart" quotes,
    common extra indentation (code copied from inside a cell) and Jupyter magic lines (%magic, !command) are fixed.
    """
    import textwrap
    code = str(code).replace("\r\n", "\n").replace("\r", "\n")
    code = "".join(_QUOTES.get(c, c) for c in code)
    lines = []
    for ln in code.split("\n"):
        stripped = ln.lstrip(" \t")
        lead = ln[:len(ln) - len(stripped)].replace("\t", "    ")
        if stripped.startswith(("%", "!")) and not stripped.startswith("!="):
            continue                      # Jupyter: %matplotlib inline, !pip install ...
        lines.append((lead + stripped).rstrip())
    return textwrap.dedent("\n".join(lines)).strip("\n") + "\n"


def _describe(exc):
    if "'___'" in str(exc):
        return "the `___` blanks have not been filled in yet"
    if isinstance(exc, InputNotNeeded):
        return str(exc)
    if isinstance(exc, IndentationError):
        return f"Indentation error (line {exc.lineno}): {exc.msg}. Indent the lines inside a block (after ':') by 4 spaces."
    if isinstance(exc, SyntaxError):
        return f"Syntax error (line {exc.lineno}): {exc.msg}"
    return f"{type(exc).__name__}: {exc}"


def _coerce(value):
    if value is None:
        return None
    s = str(value).strip()
    if s == "":
        return None
    if re.fullmatch(r"[+-]?\d+", s):
        return int(s)
    return s


def run_variant(steps, answers, upto=None, budget=10.0):
    """
    steps   : the steps in exam_data.js (in task order)
    answers : {"T1": "<code>", "T2": "b", ...}
    upto    : run only up to the test of this task ("Check code" button)
    Result  : {"results": {id: {ok, pts, max, msg, detail}}, "output": {id: stdout}}
    """
    answers = answers or {}
    ns = {
        "__name__": "__main__",
        "__builtins__": dict(vars(builtins), __import__=_guarded_import, input=_no_input),
        "math": math, "hashlib": hashlib, "_h": _h, "_eq": _eq, "grade": grade,
        "_call": _call, "_same": _same, "_yes": _yes, "_seq": _seq, "_lines": _lines, "_nums": _nums,
    }
    errors, results, output = {}, {}, {}

    def check(task_id, points, test):
        t = task_id.split("_")[0]
        try:
            res = test()
            if isinstance(res, tuple) and len(res) == 3:
                got, tot, failed = res
                pts = int(points * got / tot + 0.5) if tot else 0
                if pts >= points:
                    results[t] = {"ok": True, "pts": points, "max": points, "partial": False,
                                  "msg": OK_MSG.format(t=t, p=points), "detail": ""}
                    return
                detail = "Failed parts: " + "; ".join(failed)
                if pts > 0:
                    results[t] = {"ok": False, "pts": pts, "max": points, "partial": True,
                                  "msg": PARTIAL_MSG.format(t=t, p=pts, m=points), "detail": detail}
                    return
                if t in errors:
                    detail = errors[t] if errors[t].startswith("`") else "an error occurred while running your code → " + errors[t]
                results[t] = {"ok": False, "pts": 0, "max": points, "partial": False,
                              "msg": FAIL_MSG.format(t=t), "detail": detail}
                return
            results[t] = {"ok": True, "pts": points, "max": points, "partial": False,
                          "msg": OK_MSG.format(t=t, p=points), "detail": ""}
            return
        except AssertionError as e:
            detail = str(e) or "the test condition was not met"
        except NameError as e:
            detail = f"a required function / variable is not defined ({e})"
        except BaseException as e:
            detail = _describe(e)
        if t in errors:
            detail = errors[t] if errors[t].startswith("`") else "an error occurred while running your code → " + errors[t]
        results[t] = {"ok": False, "pts": 0, "max": points, "partial": False,
                      "msg": FAIL_MSG.format(t=t), "detail": detail}

    ns["check"] = check

    for st in steps:
        kind = st["k"]
        if kind == "var":
            ns[st["var"]] = _coerce(answers.get(st["task"]))
            continue
        label = st.get("task")
        code = st["code"]
        expected_fns = re.findall(r"^\s*def\s+([A-Za-z_]\w*)", st["code"], re.M) if kind == "code" else []
        if kind == "code":
            for name in expected_fns:          # a function from an earlier task must not be reused here
                ns.pop(name, None)
        if kind == "code" and label in answers and answers[label] is not None:
            code = normalize_code(answers[label])
        before = {k: id(v) for k, v in ns.items()}
        out = io.StringIO()
        try:
            _exec_limited(code, ns, budget, out)
        except BaseException as e:
            if label:
                errors[label] = _describe(e)
        if kind == "code" and expected_fns:
            # The student renamed the function: if exactly one new function was written, use it
            new_fns = [v for k, v in ns.items()
                       if isinstance(v, types.FunctionType) and before.get(k) != id(v) and not k.startswith("_")]
            for name in expected_fns:
                if name not in ns and len(new_fns) == 1 and len(expected_fns) == 1:
                    ns[name] = new_fns[0]
        if label:
            output[label] = out.getvalue()[-2000:]
        elif kind == "test" and out.getvalue():
            # what the student's function printed during the test
            output[st["ids"][0]] = (output.get(st["ids"][0], "") + out.getvalue())[-2000:]
        if kind == "test" and upto and upto in st["ids"]:
            break

    if upto:
        results = {k: v for k, v in results.items() if k == upto}
        output = {k: v for k, v in output.items() if k == upto}
    return {"results": results, "output": output}


def run_json(payload):
    """Pyodide bridge: JSON text in, JSON text out."""
    p = json.loads(payload)
    return json.dumps(run_variant(p["steps"], p.get("answers"), p.get("upto"), p.get("budget", 10.0)),
                      ensure_ascii=False)
'''


def load_harness():
    """Loads HARNESS_SOURCE as a normal Python module (for use in CPython)."""
    mod = types.ModuleType("exam_harness")
    exec(compile(HARNESS_SOURCE, "exam_harness", "exec"), mod.__dict__)
    return mod
