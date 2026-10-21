# -*- coding: utf-8 -*-
"""Part 1 of programming_exam_question_bank_en.docx — Theoretical Concepts -> multiple-choice questions.

The Word file has 15 theoretical topics in 3 categories (A: 8, B: 4, C: 3).
5 variants x 4 theoretical questions = 20 questions are needed, so 5 topics get a second,
different question on another aspect of the same topic (id ending in "-b"). A topic and its
"-b" question are never placed in the same variant.

Format: (id, category, short title, question (Markdown), correct answer, [3 wrong answers])
"""

THEORY_CATEGORIES = {
    "A": "Core Concepts, Memory, Types & Operators",
    "B": "Conditional Statements & Branching Algorithms",
    "C": "Loop Operators & Iteration",
}

THEORY = [
 # ------------------------------------------------------------------ Category A
 ("A1", "A", "High-level vs low-level languages; compiler vs interpreter",
  "Which statement correctly compares high-level and low-level programming languages, compilers and interpreters, "
  "and correctly classifies Python?",
  "High-level languages are close to human language and portable, low-level languages (machine code, assembly) are close to the hardware; "
  "a compiler translates the whole program before it runs, an interpreter executes it statement by statement — Python is a high-level, interpreted language",
  ["Python is a low-level language because it can directly control CPU registers, and it is compiled to an .exe file before every run",
   "High-level languages always run faster than machine code, because they do not need any translation",
   "A compiler executes the program line by line, while an interpreter first translates the whole program into machine code"]),

 ("A2", "A", "Stack and heap memory",
  "In Python's memory model, which statement correctly describes the roles of the **stack** and the **heap**?",
  "The stack holds function call frames with local names (references) and is released automatically when a function returns; "
  "the heap holds the objects themselves (int, str, list …) and they are freed by reference counting / the garbage collector when no reference points to them",
  ["All objects, including lists, are stored on the stack and are copied every time they are assigned to a new variable",
   "The heap is used only for global variables and the stack only for strings",
   "Heap memory in Python must be released manually by the programmer with a free() call"]),

 ("A2-b", "A", "References: two names, one object",
  "What does this code print, and why?\n\n```python\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)\n```",
  "`[1, 2, 3, 4]` — `b = a` copies only the reference, so both names point to the same list object on the heap",
  ["`[1, 2, 3]` — `b = a` creates an independent copy of the list on the stack",
   "`[1, 2, 3, 4]` — because `append()` adds the element to every list in the program",
   "An error — two variables cannot refer to the same object"]),

 ("A3", "A", "Dynamic typing and indentation",
  "Which statement about **dynamic typing** and **indentation** in Python is correct?",
  "The type belongs to the object, not to the variable, so the same name can refer to an `int` and later to a `str`; "
  "indentation is part of the syntax — it defines code blocks after `if`, `for`, `def` …, and wrong indentation causes an `IndentationError`",
  ["Every variable must be declared with its type, e.g. `int x = 5`, and the type can never change",
   "Indentation is only for readability; Python uses curly braces `{ }` to define blocks",
   "After `x = 5`, the statement `x = \"hello\"` raises a `TypeError` because `x` is already an integer"]),

 ("A4", "A", "Core data types, type() and type casting",
  "What does this code print?\n\n```python\nx = \"7\"\ny = int(x) + 3\nprint(type(x), y, float(y))\n```",
  "`<class 'str'> 10 10.0`",
  ["`<class 'int'> 10 10.0`",
   "`<class 'str'> 73 73.0`",
   "`<class 'str'> 10 10`"]),

 ("A5", "A", "Arithmetic operators and precedence",
  "What is the value of the following expression?\n\n```python\n2 + 3 * 4 ** 2 // 5 % 4\n```",
  "`3`",
  ["`0`", "`11`", "`9.6`"]),

 ("A5-b", "A", "Division operators: /, // and %",
  "What do the expressions `7 / 2`, `7 // 2`, `7 % 2` and `-7 // 2` evaluate to (in this order)?",
  "`3.5`, `3`, `1`, `-4`",
  ["`3`, `3`, `1`, `-3`",
   "`3.5`, `3.5`, `1`, `-3`",
   "`3.5`, `3`, `1`, `-3`"]),

 ("A6", "A", "Logical and comparison operators",
  "Given `a = 5` and `b = 10`, what is the value of the expression below?\n\n```python\nnot (a > 3 and b < 10) or a == b\n```",
  "`True`",
  ["`False`", "`5`", "An error, because `not` cannot be written in front of parentheses"]),

 ("A7", "A", "Truthy and falsy values",
  "Which list contains **only** values that evaluate to `False` in a condition (falsy values)?",
  "`0`, `0.0`, `''`, `[]`, `{}`, `None`, `False`",
  ["`0`, `'0'`, `[]`, `None`",
   "`False`, `' '` (a space), `()`, `0`",
   "`None`, `[0]`, `0.0`, `''`"]),

 ("A8", "A", "The ternary (inline if) operator",
  "Which line is a **correct** Python conditional (ternary) expression that stores `\"even\"` or `\"odd\"` in `parity`?",
  "`parity = \"even\" if n % 2 == 0 else \"odd\"`",
  ["`parity = n % 2 == 0 ? \"even\" : \"odd\"`",
   "`parity = if n % 2 == 0 \"even\" else \"odd\"`",
   "`parity = \"even\" if n % 2 == 0`"]),

 # ------------------------------------------------------------------ Category B
 ("B1", "B", "if / elif / else execution flow",
  "Which statement correctly describes the difference between several separate `if` statements and an `if-elif-else` chain?",
  "Separate `if` statements are all checked independently, so more than one block can run; in an `if-elif-else` chain the conditions are "
  "checked from top to bottom and only the first true block runs (`else` runs only if no condition is true)",
  ["In an `if-elif-else` chain every block whose condition is true is executed",
   "The `else` block of an `if-elif-else` chain always runs at the end, whatever the conditions are",
   "`elif` can be used on its own, without a preceding `if`"]),

 ("B1-b", "B", "Sequential if vs if-elif — predicting output",
  "What does this code print?\n\n```python\nx = 15\nif x > 10:\n    print(\"A\")\nif x > 5:\n    print(\"B\")\nelif x > 0:\n    print(\"C\")\nelse:\n    print(\"D\")\n```",
  "`A` and `B` (on two lines)",
  ["only `A`", "`A`, `B` and `C`", "only `B`"]),

 ("B2", "B", "Nested if and indentation",
  "What does this code print?\n\n```python\nx = 7\nif x > 0:\n    if x % 2 == 0:\n        print(\"positive even\")\n    else:\n        print(\"positive odd\")\nelse:\n    print(\"not positive\")\n```",
  "`positive odd` — the inner `else` has the same indentation as the inner `if`, so it belongs to it",
  ["`not positive` — every `else` belongs to the outermost `if`",
   "`positive even` — a nested `if` is skipped, so its `else` part never runs",
   "Nothing — nested `if` statements need curly braces `{ }` to run"]),

 ("B3", "B", "Short-circuit evaluation",
  "`x = 0`. What happens when Python evaluates the condition below?\n\n```python\nif x != 0 and 10 / x > 1:\n    print(\"big\")\n```",
  "The condition is `False` and no error occurs: `and` stops at the first false operand, so `10 / x` is never evaluated",
  ["A `ZeroDivisionError` is raised, because Python always evaluates both operands of `and`",
   "The condition is `True`, because `10 / 0` is treated as infinity",
   "Python evaluates the right operand first, so the result depends only on `10 / x > 1`"]),

 ("B4", "B", "The pass statement",
  "What is the purpose of the `pass` statement inside a conditional block?",
  "It is a placeholder that does nothing: a block after `if` / `else` / `def` cannot be empty, so `pass` lets you leave it empty without a syntax error",
  ["It skips the rest of the current loop iteration, exactly like `continue`",
   "It leaves the function and returns a value, exactly like `return`",
   "It stops the whole program immediately"]),

 # ------------------------------------------------------------------ Category C
 ("C1", "C", "for vs while loops and infinite loops",
  "Which statement about `for` and `while` loops in Python is correct?",
  "`for` iterates over the elements of a sequence / iterable, `while` repeats as long as its condition is `True`; a `while` loop becomes infinite "
  "when its condition never becomes `False` (for example, the loop variable is never changed inside the loop)",
  ["A `for` loop over a list becomes infinite if the list has more than 1000 elements",
   "A `while` loop must always run a fixed number of times that is known in advance",
   "Infinite loops are impossible in Python because the interpreter stops every loop after 1000 iterations"]),

 ("C2", "C", "break, continue and loop-else — predicting output",
  "What does this code print?\n\n```python\nfor i in range(1, 6):\n    if i == 2:\n        continue\n    if i == 4:\n        break\n    print(i)\nelse:\n    print(\"done\")\n```",
  "`1` and `3`",
  ["`1`, `3` and `done`", "`1`, `3`, `5` and `done`", "`1`, `2` and `3`"]),

 ("C2-b", "C", "The else block of a loop",
  "When is the `else` block attached to a `for` or `while` loop executed?",
  "Only when the loop ends normally (the sequence is exhausted or the `while` condition becomes `False`); it is skipped when the loop is left with `break`",
  ["Only when the loop is left with `break`",
   "After every single iteration of the loop",
   "Only when the loop body was never executed"]),

 ("C3", "C", "range(start, stop, step)",
  "Which call produces exactly the numbers `10, 7, 4, 1`?",
  "`range(10, 0, -3)`",
  ["`range(10, 1, -3)`", "`range(1, 10, 3)`", "`range(10, -3)`"]),

 ("C3-b", "C", "range() — start included, stop excluded",
  "What does `list(range(2, 12, 3))` return?",
  "`[2, 5, 8, 11]` — the start value is included, the stop value (12) is excluded and the step is 3",
  ["`[2, 5, 8, 11, 14]`", "`[2, 5, 8]`", "`[3, 6, 9, 12]`"]),
]


def check_theory_answers():
    """Sanity check for the code-based questions (run by build_bank.py --verify)."""
    import contextlib
    import io
    a = [1, 2, 3]; b = a; b.append(4)
    assert a == [1, 2, 3, 4]
    x = "7"; y = int(x) + 3
    assert (str(type(x)), y, float(y)) == ("<class 'str'>", 10, 10.0)
    assert 2 + 3 * 4 ** 2 // 5 % 4 == 3
    assert (7 / 2, 7 // 2, 7 % 2, -7 // 2) == (3.5, 3, 1, -4)
    a, b = 5, 10
    assert (not (a > 3 and b < 10) or a == b) is True
    assert not any([0, 0.0, '', [], {}, None, False])
    for wrong in (['0'], [' '], [[0]]):
        assert all(wrong)
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        x = 15
        if x > 10:
            print("A")
        if x > 5:
            print("B")
        elif x > 0:
            print("C")
    assert out.getvalue().split() == ["A", "B"]
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        for i in range(1, 6):
            if i == 2:
                continue
            if i == 4:
                break
            print(i)
        else:
            print("done")
    assert out.getvalue().split() == ["1", "3"]
    assert list(range(10, 0, -3)) == [10, 7, 4, 1]
    assert list(range(10, 1, -3)) != [10, 7, 4, 1]
    assert list(range(2, 12, 3)) == [2, 5, 8, 11]
    assert len(THEORY) == 20 and len({t[0] for t in THEORY}) == 20
    return True
