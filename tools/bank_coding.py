# -*- coding: utf-8 -*-
"""Part 2 of programming_exam_question_bank_en.docx — coding tasks (5 categories).

The Word file has 25 coding tasks (A: 4, B: 5, C: 6, D: 4, E: 6). 5 variants x 6 tasks = 30 tasks are
needed and every variant must contain every category, so 5 extra tasks are DERIVED from bank tasks
(id ending in "-b": same idea, different input / output). A task and its derived twin are never placed
in the same variant. After this every category has 6 tasks (5 variants + 1 extra).

Every task asks for a function, so it can be checked automatically. Grading is result-based and tolerant
(see grader_core.py): the function may return OR print its answer, labels around the answer are fine,
list / tuple and 5 / 5.0 are the same, and any correct algorithm is accepted.

partial=True  -> graded 0-10 (every test case / part earns its own points; weights add up to 10)
partial=False -> graded 0 or 10 (all checks must pass)
"""
import textwrap

CATEGORIES = {
    "A": "Fundamental Operations & Mathematical Logic",
    "B": "Branching & Complex Decision-Making",
    "C": "Loops, Sequences & Number Theory",
    "D": "Lists & Matrices (2D Arrays)",
    "E": "Strings & Modular Functions",
}

CODING = {}

FOOT = ("\n\n*Return the result from the function (printing it is also accepted). "
        "Do not use `input()` — the values arrive as function parameters.*")


def task(tid, title, desc, starter, solution, test, partial=True, derived_from=None):
    CODING[tid] = dict(id=tid, cat=tid[0], num=int("".join(ch for ch in tid.split("-")[0] if ch.isdigit())),
                       title=title, desc=textwrap.dedent(desc).strip() + FOOT,
                       starter=textwrap.dedent(starter).strip("\n"), solution=textwrap.dedent(solution).strip("\n"),
                       test=textwrap.dedent(test).strip("\n"), partial=partial, derived_from=derived_from)


# =====================================================================
# Category A: Fundamental Operations & Mathematical Logic
# =====================================================================
task("A11", "Sum of the digits of a 3-digit number",
 """
 Write a function `digit_sum(n)` that calculates the **sum of the digits** of a 3-digit positive integer `n`.

 Example: `digit_sum(384)` → `15`  (3 + 8 + 4)
 """,
 """
 def digit_sum(n):
     # write your code here
     pass
 """,
 """
 def digit_sum(n):
     return n // 100 + n // 10 % 10 + n % 10
 """,
 """
 return grade(
     (4, "digit_sum(384) should be 15", lambda: _same(_call(digit_sum, 384), 15)),
     (2, "digit_sum(999) should be 27", lambda: _same(_call(digit_sum, 999), 27)),
     (2, "digit_sum(105) should be 6 (a zero digit in the middle)", lambda: _same(_call(digit_sum, 105), 6)),
     (2, "digit_sum(100) should be 1", lambda: _same(_call(digit_sum, 100), 1)),
 )
 """)

task("A11-b", "Product of the digits of a 3-digit number",
 """
 Write a function `digit_product(n)` that calculates the **product of the digits** of a 3-digit positive integer `n`.

 Example: `digit_product(384)` → `96`  (3 × 8 × 4)
 """,
 """
 def digit_product(n):
     # write your code here
     pass
 """,
 """
 def digit_product(n):
     return (n // 100) * (n // 10 % 10) * (n % 10)
 """,
 """
 return grade(
     (4, "digit_product(384) should be 96", lambda: _same(_call(digit_product, 384), 96)),
     (2, "digit_product(999) should be 729", lambda: _same(_call(digit_product, 999), 729)),
     (2, "digit_product(211) should be 2", lambda: _same(_call(digit_product, 211), 2)),
     (2, "digit_product(105) should be 0 (a zero digit)", lambda: _same(_call(digit_product, 105), 0)),
 )
 """, derived_from="A11")

task("A12", "Seconds → hours, minutes, seconds",
 """
 Write a function `convert_seconds(total)` that converts a number of seconds into **hours, minutes and seconds**
 and returns them as three values: `hours, minutes, seconds`.

 Example: `convert_seconds(3665)` → `(1, 1, 5)`  (1 hour, 1 minute, 5 seconds)
 """,
 """
 def convert_seconds(total):
     # write your code here
     pass
 """,
 """
 def convert_seconds(total):
     return total // 3600, total % 3600 // 60, total % 60
 """,
 """
 return grade(
     (4, "convert_seconds(3665) should be (1, 1, 5)", lambda: _same(_call(convert_seconds, 3665), (1, 1, 5))),
     (2, "convert_seconds(59) should be (0, 0, 59)", lambda: _same(_call(convert_seconds, 59), (0, 0, 59))),
     (2, "convert_seconds(7200) should be (2, 0, 0)", lambda: _same(_call(convert_seconds, 7200), (2, 0, 0))),
     (2, "convert_seconds(86399) should be (23, 59, 59)", lambda: _same(_call(convert_seconds, 86399), (23, 59, 59))),
 )
 """)

task("A12-b", "Minutes → days, hours, minutes",
 """
 Write a function `convert_minutes(total)` that converts a number of minutes into **days, hours and minutes**
 and returns them as three values: `days, hours, minutes`.

 Example: `convert_minutes(1500)` → `(1, 1, 0)`  (1 day, 1 hour, 0 minutes)
 """,
 """
 def convert_minutes(total):
     # write your code here
     pass
 """,
 """
 def convert_minutes(total):
     return total // 1440, total % 1440 // 60, total % 60
 """,
 """
 assert _same(_call(convert_minutes, 1500), (1, 1, 0)), "convert_minutes(1500) should be (1, 1, 0)"
 assert _same(_call(convert_minutes, 59), (0, 0, 59)), "convert_minutes(59) should be (0, 0, 59)"
 assert _same(_call(convert_minutes, 2881), (2, 0, 1)), "convert_minutes(2881) should be (2, 0, 1)"
 assert _same(_call(convert_minutes, 10000), (6, 22, 40)), "convert_minutes(10000) should be (6, 22, 40)"
 """, partial=False, derived_from="A12")

task("A14", "Euclidean distance between two points",
 """
 Write a function `distance(x1, y1, x2, y2)` that calculates the Euclidean distance between the points
 (x1, y1) and (x2, y2):

 d = √((x2 − x1)² + (y2 − y1)²)

 Example: `distance(0, 0, 3, 4)` → `5.0`
 """,
 """
 def distance(x1, y1, x2, y2):
     # write your code here
     pass
 """,
 """
 def distance(x1, y1, x2, y2):
     return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
 """,
 """
 assert _same(_call(distance, 0, 0, 3, 4), 5.0), "distance(0, 0, 3, 4) should be 5.0"
 assert _same(_call(distance, -1, 2, 5, -6), 10.0), "distance(-1, 2, 5, -6) should be 10.0"
 assert _same(_call(distance, 0, 0, 1, 1), 1.41421356), "distance(0, 0, 1, 1) should be about 1.414"
 assert _same(_call(distance, 2, 3, 2, 3), 0), "distance between equal points should be 0"
 """, partial=False)

task("A16", "First and last digit of a 4-digit number",
 """
 Write a function `first_last(n)` that finds the **first digit**, the **last digit** of a 4-digit positive integer `n`
 and their **sum**, and returns the three values: `first, last, total`.

 Example: `first_last(4579)` → `(4, 9, 13)`
 """,
 """
 def first_last(n):
     # write your code here
     pass
 """,
 """
 def first_last(n):
     first = n // 1000
     last = n % 10
     return first, last, first + last
 """,
 """
 cases = {4579: (4, 9, 13), 1000: (1, 0, 1), 9081: (9, 1, 10), 2222: (2, 2, 4)}
 res = {n: _seq(_call(first_last, n), 3) for n in cases}
 return grade(
     (3, "first digit", lambda: all(res[n] and _same(res[n][0], e[0]) for n, e in cases.items())),
     (3, "last digit", lambda: all(res[n] and _same(res[n][1], e[1]) for n, e in cases.items())),
     (4, "sum of the first and last digit", lambda: all(res[n] and _same(res[n][2], e[2]) for n, e in cases.items())),
 )
 """)

# =====================================================================
# Category B: Branching & Complex Decision-Making
# =====================================================================
task("B7", "Maximum and minimum of three numbers",
 """
 Write a function `max_min(a, b, c)` that finds the **maximum** and the **minimum** of three integers and returns them
 as two values: `maximum, minimum`.

 Example: `max_min(12, 45, 23)` → `(45, 12)`
 """,
 """
 def max_min(a, b, c):
     # write your code here
     pass
 """,
 """
 def max_min(a, b, c):
     mx = a
     if b > mx:
         mx = b
     if c > mx:
         mx = c
     mn = a
     if b < mn:
         mn = b
     if c < mn:
         mn = c
     return mx, mn
 """,
 """
 cases = [((12, 45, 23), (45, 12)), ((7, 3, 9), (9, 3)), ((-3, -7, -1), (-1, -7)), ((5, 5, 1), (5, 1))]
 res = [_seq(_call(max_min, *args), 2) for args, _ in cases]
 return grade(
     (5, "maximum", lambda: all(r and _same(r[0], e[0]) for r, (_, e) in zip(res, cases))),
     (5, "minimum", lambda: all(r and _same(r[1], e[1]) for r, (_, e) in zip(res, cases))),
 )
 """)

task("B7-b", "Ordering three numbers",
 """
 Write a function `order_three(a, b, c)` that returns the three integers in **ascending order**:
 `smallest, middle, largest`. Try to solve it with `if` / `elif` comparisons.

 Example: `order_three(12, 45, 23)` → `(12, 23, 45)`
 """,
 """
 def order_three(a, b, c):
     # write your code here
     pass
 """,
 """
 def order_three(a, b, c):
     if a > b:
         a, b = b, a
     if b > c:
         b, c = c, b
     if a > b:
         a, b = b, a
     return a, b, c
 """,
 """
 return grade(
     (4, "order_three(12, 45, 23) should be (12, 23, 45)", lambda: _same(_call(order_three, 12, 45, 23), (12, 23, 45))),
     (2, "order_three(9, 5, 1) should be (1, 5, 9)", lambda: _same(_call(order_three, 9, 5, 1), (1, 5, 9))),
     (2, "order_three(-2, 8, -5) should be (-5, -2, 8)", lambda: _same(_call(order_three, -2, 8, -5), (-5, -2, 8))),
     (2, "order_three(4, 4, 2) should be (2, 4, 4)", lambda: _same(_call(order_three, 4, 4, 2), (2, 4, 4))),
 )
 """, derived_from="B7")

task("B9", "Valid triangle check",
 """
 Write a function `is_triangle(a, b, c)` that checks whether three side lengths form a **valid triangle**, using the
 Triangle Inequality Theorem: a + b > c, a + c > b and b + c > a.
 Return `True` / `False` (or print a message such as "Forms a valid triangle" / "Does not form a triangle").

 Example: `is_triangle(3, 4, 5)` → `True`
 """,
 """
 def is_triangle(a, b, c):
     # write your code here
     pass
 """,
 """
 def is_triangle(a, b, c):
     return a + b > c and a + c > b and b + c > a
 """,
 """
 return grade(
     (3, "is_triangle(3, 4, 5) should be True", lambda: _same(_call(is_triangle, 3, 4, 5), True)),
     (2, "is_triangle(7, 10, 5) should be True", lambda: _same(_call(is_triangle, 7, 10, 5), True)),
     (2, "is_triangle(1, 2, 3) should be False (a + b = c is not enough)", lambda: _same(_call(is_triangle, 1, 2, 3), False)),
     (3, "is_triangle(10, 1, 2) and is_triangle(1, 10, 2) should be False (every side must be checked)",
      lambda: _same(_call(is_triangle, 10, 1, 2), False) and _same(_call(is_triangle, 1, 10, 2), False)),
 )
 """)

task("B10", "Leap year",
 """
 Write a function `is_leap(year)` that determines whether `year` is a **leap year** (366 days).
 Rule: divisible by 4 and not by 100, **or** divisible by 400.
 Return `True` / `False` (or print "Leap year" / "Not a leap year").

 Example: `is_leap(2024)` → `True`
 """,
 """
 def is_leap(year):
     # write your code here
     pass
 """,
 """
 def is_leap(year):
     return (year % 4 == 0 and year % 100 != 0) or year % 400 == 0
 """,
 """
 assert _same(_call(is_leap, 2024), True), "2024 is a leap year"
 assert _same(_call(is_leap, 2023), False), "2023 is not a leap year"
 assert _same(_call(is_leap, 1900), False), "1900 is not a leap year (divisible by 100 but not by 400)"
 assert _same(_call(is_leap, 2000), True), "2000 is a leap year (divisible by 400)"
 """, partial=False)

task("B11", "Quadrant of a point",
 """
 Write a function `quadrant(x, y)` that determines where the point (x, y) lies in the 2D plane:
 `"Quadrant I"`, `"Quadrant II"`, `"Quadrant III"`, `"Quadrant IV"`, `"X axis"`, `"Y axis"` or `"Origin"`.
 (Answers like `"II"`, `2` or `"Quadrant 2"` are also accepted.)

 Example: `quadrant(-3, 5)` → `"Quadrant II"`
 """,
 """
 def quadrant(x, y):
     # write your code here
     pass
 """,
 """
 def quadrant(x, y):
     if x == 0 and y == 0:
         return "Origin"
     elif y == 0:
         return "X axis"
     elif x == 0:
         return "Y axis"
     elif x > 0 and y > 0:
         return "Quadrant I"
     elif x < 0 and y > 0:
         return "Quadrant II"
     elif x < 0:
         return "Quadrant III"
     else:
         return "Quadrant IV"
 """,
 """
 import re
 def where(x, y):
     t = str(_call(quadrant, x, y)).casefold().replace("-", " ").replace("_", " ")
     if "origin" in t or "(0, 0)" in t or "mərkəz" in t or "başlanğıc" in t:
         return "O"
     if "axis" in t or "ox" in t.split() or "oy" in t.split() or "ox" in t or "oy" in t:
         if re.search(r"\\bx\\b|ox|abscissa", t):
             return "X"
         if re.search(r"\\by\\b|oy|ordinate", t):
             return "Y"
     t = t.replace("quadrant", " ").replace("rüb", " ")
     for word, q in (("iv", 4), ("iii", 3), ("ii", 2), ("i", 1)):
         if re.search(r"\\b" + word + r"\\b", t):
             return q
     ns = _nums(t)
     return ns[-1] if ns else None
 return grade(
     (2, "quadrant(4, 7) should be Quadrant I", lambda: where(4, 7) == 1),
     (2, "quadrant(-3, 5) should be Quadrant II", lambda: where(-3, 5) == 2),
     (2, "quadrant(-2, -9) should be Quadrant III", lambda: where(-2, -9) == 3),
     (2, "quadrant(6, -1) should be Quadrant IV", lambda: where(6, -1) == 4),
     (2, "points on the axes / origin: (5, 0) X axis, (0, -3) Y axis, (0, 0) Origin",
      lambda: where(5, 0) == "X" and where(0, -3) == "Y" and where(0, 0) == "O"),
 )
 """)

task("B12", "3-digit palindrome",
 """
 Write a function `is_palindrome(n)` that checks whether a 3-digit integer `n` is a **palindrome**
 (reads the same forward and backward). Return `True` / `False` (or print "Palindrome" / "Not a palindrome").

 Examples: `is_palindrome(121)` → `True`, `is_palindrome(123)` → `False`
 """,
 """
 def is_palindrome(n):
     # write your code here
     pass
 """,
 """
 def is_palindrome(n):
     return n // 100 == n % 10
 """,
 """
 assert _same(_call(is_palindrome, 121), True), "121 is a palindrome"
 assert _same(_call(is_palindrome, 123), False), "123 is not a palindrome"
 assert _same(_call(is_palindrome, 707), True), "707 is a palindrome"
 assert _same(_call(is_palindrome, 100), False), "100 is not a palindrome"
 """, partial=False)

# =====================================================================
# Category C: Loops, Sequences & Number Theory
# =====================================================================
task("C6", "Prime or composite",
 """
 Write a function `is_prime(n)` that determines whether a positive integer `n` is **prime**.
 Return `True` / `False` (or print "Prime number" / "Composite number"). Remember: 1 is not prime.

 Example: `is_prime(17)` → `True`
 """,
 """
 def is_prime(n):
     # write your code here
     pass
 """,
 """
 def is_prime(n):
     if n < 2:
         return False
     i = 2
     while i * i <= n:
         if n % i == 0:
             return False
         i += 1
     return True
 """,
 """
 return grade(
     (4, "primes 17, 2 and 97 should give True",
      lambda: all(_same(_call(is_prime, p), True) for p in (17, 2, 97))),
     (3, "composite numbers 15, 91 (7 x 13) and 49 should give False",
      lambda: all(_same(_call(is_prime, c), False) for c in (15, 91, 49))),
     (3, "1 is not prime", lambda: _same(_call(is_prime, 1), False)),
 )
 """)

task("C9", "Reversing the digits of a number",
 """
 Write a function `reverse_number(n)` that reverses the digits of a positive integer `n` and returns the new number.

 Example: `reverse_number(1234)` → `4321`
 """,
 """
 def reverse_number(n):
     # write your code here
     pass
 """,
 """
 def reverse_number(n):
     r = 0
     while n > 0:
         r = r * 10 + n % 10
         n //= 10
     return r
 """,
 """
 assert _same(_call(reverse_number, 1234), 4321), "reverse_number(1234) should be 4321"
 assert _same(_call(reverse_number, 7), 7), "reverse_number(7) should be 7"
 assert _same(_call(reverse_number, 90817), 71809), "reverse_number(90817) should be 71809"
 assert _same(_call(reverse_number, 1200), 21), "reverse_number(1200) should be 21"
 """, partial=False)

task("C10", "GCD and LCM of two numbers",
 """
 Write a function `gcd_lcm(a, b)` that calculates the **Greatest Common Divisor (GCD)** and the
 **Least Common Multiple (LCM)** of two natural numbers and returns them as two values: `gcd, lcm`.

 Example: `gcd_lcm(12, 18)` → `(6, 36)`
 """,
 """
 def gcd_lcm(a, b):
     # write your code here
     pass
 """,
 """
 def gcd_lcm(a, b):
     x, y = a, b
     while y:
         x, y = y, x % y
     return x, a * b // x
 """,
 """
 cases = [((12, 18), (6, 36)), ((7, 13), (1, 91)), ((20, 5), (5, 20)), ((21, 6), (3, 42))]
 res = [_seq(_call(gcd_lcm, *args), 2) for args, _ in cases]
 return grade(
     (5, "GCD", lambda: all(r and _same(r[0], e[0]) for r, (_, e) in zip(res, cases))),
     (5, "LCM", lambda: all(r and _same(r[1], e[1]) for r, (_, e) in zip(res, cases))),
 )
 """)

task("C11", "Armstrong numbers",
 """
 Write a function `armstrong_numbers(start, end)` that returns a list of all 3-digit **Armstrong numbers** in the range
 `start … end` (both included). A 3-digit number is an Armstrong number if the sum of the cubes of its digits equals the
 number itself, e.g. 153 = 1³ + 5³ + 3³.

 Example: `armstrong_numbers(100, 999)` → `[153, 370, 371, 407]`
 """,
 """
 def armstrong_numbers(start, end):
     # write your code here
     pass
 """,
 """
 def armstrong_numbers(start, end):
     result = []
     for n in range(start, end + 1):
         if (n // 100) ** 3 + (n // 10 % 10) ** 3 + (n % 10) ** 3 == n:
             result.append(n)
     return result
 """,
 """
 return grade(
     (5, "armstrong_numbers(100, 999) should be [153, 370, 371, 407]",
      lambda: _same(_call(armstrong_numbers, 100, 999), [153, 370, 371, 407])),
     (3, "armstrong_numbers(150, 380) should be [153, 370, 371]",
      lambda: _same(_call(armstrong_numbers, 150, 380), [153, 370, 371])),
     (2, "the end of the range is included: armstrong_numbers(400, 407) should be [407]",
      lambda: _same(_call(armstrong_numbers, 400, 407), [407])),
 )
 """)

task("C12", "All prime numbers up to N",
 """
 Write a function `primes_up_to(n)` that returns a list of all **prime numbers up to `n`** (including `n` if it is prime).

 Example: `primes_up_to(20)` → `[2, 3, 5, 7, 11, 13, 17, 19]`
 """,
 """
 def primes_up_to(n):
     # write your code here
     pass
 """,
 """
 def primes_up_to(n):
     result = []
     for k in range(2, n + 1):
         for d in range(2, int(k ** 0.5) + 1):
             if k % d == 0:
                 break
         else:
             result.append(k)
     return result
 """,
 """
 return grade(
     (5, "primes_up_to(20) should be [2, 3, 5, 7, 11, 13, 17, 19]",
      lambda: _same(_call(primes_up_to, 20), [2, 3, 5, 7, 11, 13, 17, 19])),
     (3, "primes_up_to(29) should end with 23, 29 (n itself is included)",
      lambda: _same(_call(primes_up_to, 29), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29])),
     (2, "primes_up_to(2) should be [2]", lambda: _same(_call(primes_up_to, 2), [2])),
 )
 """)

task("C13", "Right-angled triangle star pattern",
 """
 Write a function `star_triangle(n)` that uses **nested loops** to build an `n`-row right-angled triangle of stars.
 You may print the rows, or return them as one text (rows separated by `\\n`) or as a list of rows.

 Example: `star_triangle(4)` prints

 ```
 *
 **
 ***
 ****
 ```
 """,
 """
 def star_triangle(n):
     # write your code here
     pass
 """,
 """
 def star_triangle(n):
     for i in range(1, n + 1):
         row = ""
         for j in range(i):
             row += "*"
         print(row)
 """,
 """
 def rows(n):
     return [r.replace(" ", "") for r in _lines(_call(star_triangle, n))]
 return grade(
     (5, "star_triangle(4) should give 4 rows: *, **, ***, ****", lambda: rows(4) == ["*" * i for i in range(1, 5)]),
     (3, "star_triangle(6) should give 6 rows", lambda: rows(6) == ["*" * i for i in range(1, 7)]),
     (2, "star_triangle(1) should give one row: *", lambda: rows(1) == ["*"]),
 )
 """)

# =====================================================================
# Category D: Lists & Matrices (2D Arrays)
# =====================================================================
task("D4", "Maximum and minimum with their positions",
 """
 Write a function `max_min_index(lst)` that finds the **maximum** and **minimum** elements of a list together with their
 **index positions**, and returns four values: `max_value, max_index, min_value, min_index`
 (if a value appears more than once, use its first position).

 Example: `max_min_index([12, 45, 2, 89, 34])` → `(89, 3, 2, 2)`  — Max: 89 (index 3), Min: 2 (index 2)
 """,
 """
 def max_min_index(lst):
     # write your code here
     pass
 """,
 """
 def max_min_index(lst):
     mx_i = mn_i = 0
     for i in range(len(lst)):
         if lst[i] > lst[mx_i]:
             mx_i = i
         if lst[i] < lst[mn_i]:
             mn_i = i
     return lst[mx_i], mx_i, lst[mn_i], mn_i
 """,
 """
 cases = [([12, 45, 2, 89, 34], (89, 3, 2, 2)), ([-5, -1, -9, 0], (0, 3, -9, 2)), ([7, 3, 7, 3], (7, 0, 3, 1))]
 res = [_seq(_call(max_min_index, lst), 4) for lst, _ in cases]
 return grade(
     (3, "maximum value", lambda: all(r and _same(r[0], e[0]) for r, (_, e) in zip(res, cases))),
     (2, "index of the maximum", lambda: all(r and _same(r[1], e[1]) for r, (_, e) in zip(res, cases))),
     (3, "minimum value", lambda: all(r and _same(r[2], e[2]) for r, (_, e) in zip(res, cases))),
     (2, "index of the minimum", lambda: all(r and _same(r[3], e[3]) for r, (_, e) in zip(res, cases))),
 )
 """)

task("D4-b", "Second largest element of a list",
 """
 Write a function `second_largest(lst)` that returns the **second largest distinct value** in a list
 (repeated copies of the maximum do not count as the second largest).

 Examples: `second_largest([12, 45, 2, 89, 34])` → `45`, `second_largest([10, 20, 20, 5])` → `10`
 """,
 """
 def second_largest(lst):
     # write your code here
     pass
 """,
 """
 def second_largest(lst):
     mx = max(lst)
     second = None
     for x in lst:
         if x != mx and (second is None or x > second):
             second = x
     return second
 """,
 """
 return grade(
     (5, "second_largest([12, 45, 2, 89, 34]) should be 45", lambda: _same(_call(second_largest, [12, 45, 2, 89, 34]), 45)),
     (3, "repeated maximum: second_largest([10, 20, 20, 5]) should be 10", lambda: _same(_call(second_largest, [10, 20, 20, 5]), 10)),
     (2, "negative numbers: second_largest([-8, -3, -5]) should be -5", lambda: _same(_call(second_largest, [-8, -3, -5]), -5)),
 )
 """, derived_from="D4")

task("D7", "Bubble Sort",
 """
 Write a function `bubble_sort(lst)` that sorts the elements of a list in **ascending order** using the
 **Bubble Sort** algorithm (repeatedly swap neighbouring elements that are in the wrong order) and returns the sorted list.

 Example: `bubble_sort([64, 34, 25, 12, 22, 11, 90])` → `[11, 12, 22, 25, 34, 64, 90]`
 """,
 """
 def bubble_sort(lst):
     # write your code here
     pass
 """,
 """
 def bubble_sort(lst):
     n = len(lst)
     for i in range(n - 1):
         for j in range(n - 1 - i):
             if lst[j] > lst[j + 1]:
                 lst[j], lst[j + 1] = lst[j + 1], lst[j]
     return lst
 """,
 """
 return grade(
     (5, "bubble_sort([64, 34, 25, 12, 22, 11, 90]) should be [11, 12, 22, 25, 34, 64, 90]",
      lambda: _same(_call(bubble_sort, [64, 34, 25, 12, 22, 11, 90]), [11, 12, 22, 25, 34, 64, 90])),
     (3, "negative numbers and duplicates: [5, -1, 3, -1, 0] -> [-1, -1, 0, 3, 5]",
      lambda: _same(_call(bubble_sort, [5, -1, 3, -1, 0]), [-1, -1, 0, 3, 5])),
     (2, "a list in reverse order: [5, 4, 3, 2, 1] -> [1, 2, 3, 4, 5]",
      lambda: _same(_call(bubble_sort, [5, 4, 3, 2, 1]), [1, 2, 3, 4, 5])),
 )
 """)

task("D8", "Removing duplicate elements",
 """
 Write a function `unique(lst)` that builds and returns a **new list** with the duplicate elements removed.
 Keep the elements in the order of their **first appearance**.

 Example: `unique([1, 2, 2, 3, 4, 4, 5])` → `[1, 2, 3, 4, 5]`
 """,
 """
 def unique(lst):
     # write your code here
     pass
 """,
 """
 def unique(lst):
     result = []
     for x in lst:
         if x not in result:
             result.append(x)
     return result
 """,
 """
 return grade(
     (5, "unique([1, 2, 2, 3, 4, 4, 5]) should be [1, 2, 3, 4, 5]",
      lambda: _same(_call(unique, [1, 2, 2, 3, 4, 4, 5]), [1, 2, 3, 4, 5])),
     (3, "order of first appearance: unique([3, 1, 3, 2, 1]) should be [3, 1, 2]",
      lambda: _same(_call(unique, [3, 1, 3, 2, 1]), [3, 1, 2])),
     (2, "all elements equal: unique([7, 7, 7]) should be [7]", lambda: _same(_call(unique, [7, 7, 7]), [7])),
 )
 """)

task("D9", "Cyclic shift to the right by K",
 """
 Write a function `rotate_right(lst, k)` that **cyclically shifts** the elements of a list to the **right** by `k`
 positions and returns the result (`k` may be larger than the length of the list).

 Example: `rotate_right([1, 2, 3, 4, 5], 2)` → `[4, 5, 1, 2, 3]`
 """,
 """
 def rotate_right(lst, k):
     # write your code here
     pass
 """,
 """
 def rotate_right(lst, k):
     k = k % len(lst)
     return lst[-k:] + lst[:-k] if k else lst[:]
 """,
 """
 return grade(
     (5, "rotate_right([1, 2, 3, 4, 5], 2) should be [4, 5, 1, 2, 3]",
      lambda: _same(_call(rotate_right, [1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3])),
     (2, "k = 1: rotate_right([10, 20, 30], 1) should be [30, 10, 20]",
      lambda: _same(_call(rotate_right, [10, 20, 30], 1), [30, 10, 20])),
     (3, "k larger than the length: rotate_right([1, 2, 3, 4, 5], 7) should be [4, 5, 1, 2, 3]",
      lambda: _same(_call(rotate_right, [1, 2, 3, 4, 5], 7), [4, 5, 1, 2, 3])),
 )
 """)

task("D9-b", "Cyclic shift to the left by K",
 """
 Write a function `rotate_left(lst, k)` that **cyclically shifts** the elements of a list to the **left** by `k`
 positions and returns the result (`k` may be larger than the length of the list).

 Example: `rotate_left([1, 2, 3, 4, 5], 2)` → `[3, 4, 5, 1, 2]`
 """,
 """
 def rotate_left(lst, k):
     # write your code here
     pass
 """,
 """
 def rotate_left(lst, k):
     k = k % len(lst)
     return lst[k:] + lst[:k]
 """,
 """
 assert _same(_call(rotate_left, [1, 2, 3, 4, 5], 2), [3, 4, 5, 1, 2]), "rotate_left([1, 2, 3, 4, 5], 2) should be [3, 4, 5, 1, 2]"
 assert _same(_call(rotate_left, [10, 20, 30], 1), [20, 30, 10]), "rotate_left([10, 20, 30], 1) should be [20, 30, 10]"
 assert _same(_call(rotate_left, [1, 2, 3, 4, 5], 6), [2, 3, 4, 5, 1]), "rotate_left([1, 2, 3, 4, 5], 6) should be [2, 3, 4, 5, 1]"
 """, partial=False, derived_from="D9")

# =====================================================================
# Category E: Strings & Modular Functions
# =====================================================================
task("E6", "Swapping letter case",
 """
 Write a function `swap_case(s)` that converts all lowercase letters of a string to uppercase and all uppercase letters
 to lowercase **without using the `swapcase()` method** (other characters stay unchanged).

 Example: `swap_case("PyThOn")` → `"pYtHoN"`
 """,
 """
 def swap_case(s):
     # write your code here
     pass
 """,
 """
 def swap_case(s):
     result = ""
     for ch in s:
         if ch.islower():
             result += ch.upper()
         elif ch.isupper():
             result += ch.lower()
         else:
             result += ch
     return result
 """,
 """
 return grade(
     (5, 'swap_case("PyThOn") should be "pYtHoN"', lambda: _same(_call(swap_case, "PyThOn"), "pYtHoN")),
     (3, 'spaces and digits stay: swap_case("Hello World 2026") should be "hELLO wORLD 2026"',
      lambda: _same(_call(swap_case, "Hello World 2026"), "hELLO wORLD 2026")),
     (2, 'swap_case("abc") should be "ABC"', lambda: _same(_call(swap_case, "abc"), "ABC")),
 )
 """)

task("E10", "Recursive factorial",
 """
 Write a **recursive** function `factorial_recursive(n)` that calculates n! (the function calls itself; 0! = 1).

 Example: `factorial_recursive(5)` → `120`
 """,
 """
 def factorial_recursive(n):
     # write your code here
     pass
 """,
 """
 def factorial_recursive(n):
     if n <= 1:
         return 1
     return n * factorial_recursive(n - 1)
 """,
 """
 assert _same(_call(factorial_recursive, 5), 120), "factorial_recursive(5) should be 120"
 assert _same(_call(factorial_recursive, 1), 1), "factorial_recursive(1) should be 1"
 assert _same(_call(factorial_recursive, 0), 1), "factorial_recursive(0) should be 1"
 assert _same(_call(factorial_recursive, 10), 3628800), "factorial_recursive(10) should be 3628800"
 """, partial=False)

task("E12", "GCD with the Euclidean Algorithm",
 """
 Write a function `gcd(a, b)` that calculates the **Greatest Common Divisor** of two numbers using the
 **Euclidean Algorithm** (repeatedly replace (a, b) with (b, a % b) until b becomes 0).

 Example: `gcd(48, 18)` → `6`
 """,
 """
 def gcd(a, b):
     # write your code here
     pass
 """,
 """
 def gcd(a, b):
     while b != 0:
         a, b = b, a % b
     return a
 """,
 """
 assert _same(_call(gcd, 48, 18), 6), "gcd(48, 18) should be 6"
 assert _same(_call(gcd, 17, 5), 1), "gcd(17, 5) should be 1"
 assert _same(_call(gcd, 100, 75), 25), "gcd(100, 75) should be 25"
 assert _same(_call(gcd, 7, 0), 7), "gcd(7, 0) should be 7"
 """, partial=False)

task("E13", "The longest word in a sentence",
 """
 Write a function `longest_word(sentence)` that finds and returns the **longest word** in a sentence
 (if several words have the same length, return the first one).

 Example: `longest_word("Proqramlaşdırma kursu uğurla başladı")` → `"Proqramlaşdırma"`
 """,
 """
 def longest_word(sentence):
     # write your code here
     pass
 """,
 """
 def longest_word(sentence):
     best = ""
     for word in sentence.split():
         if len(word) > len(best):
             best = word
     return best
 """,
 """
 return grade(
     (5, 'longest_word("Proqramlaşdırma kursu uğurla başladı") should be "Proqramlaşdırma"',
      lambda: _same(_call(longest_word, "Proqramlaşdırma kursu uğurla başladı"), "Proqramlaşdırma")),
     (3, 'longest_word("Python is a great language") should be "language"',
      lambda: _same(_call(longest_word, "Python is a great language"), "language")),
     (2, 'equal lengths -> the first one: longest_word("cat dog owl") should be "cat"',
      lambda: _same(_call(longest_word, "cat dog owl"), "cat")),
 )
 """)

task("E14", "Character frequency with a dictionary",
 """
 Write a function `char_frequency(s)` that counts how many times each character occurs in a string and returns the
 result as a **dictionary** `{character: count}`.

 Example: `char_frequency("kitab")` → `{'k': 1, 'i': 1, 't': 1, 'a': 1, 'b': 1}`
 """,
 """
 def char_frequency(s):
     # write your code here
     pass
 """,
 """
 def char_frequency(s):
     freq = {}
     for ch in s:
         freq[ch] = freq.get(ch, 0) + 1
     return freq
 """,
 """
 return grade(
     (4, "char_frequency('kitab') should be {'k': 1, 'i': 1, 't': 1, 'a': 1, 'b': 1}",
      lambda: _same(_call(char_frequency, "kitab"), {'k': 1, 'i': 1, 't': 1, 'a': 1, 'b': 1})),
     (4, "repeated characters: char_frequency('hello') should be {'h': 1, 'e': 1, 'l': 2, 'o': 1}",
      lambda: _same(_call(char_frequency, "hello"), {'h': 1, 'e': 1, 'l': 2, 'o': 1})),
     (2, "char_frequency('aaa') should be {'a': 3}", lambda: _same(_call(char_frequency, "aaa"), {'a': 3})),
 )
 """)

task("E15", "Filtering even numbers",
 """
 Write a function `get_evens(lst)` that filters the **even numbers** from a list and returns them as a **new list**.

 Example: `get_evens([1, 2, 3, 4, 5, 6])` → `[2, 4, 6]`
 """,
 """
 def get_evens(lst):
     # write your code here
     pass
 """,
 """
 def get_evens(lst):
     return [x for x in lst if x % 2 == 0]
 """,
 """
 return grade(
     (5, "get_evens([1, 2, 3, 4, 5, 6]) should be [2, 4, 6]", lambda: _same(_call(get_evens, [1, 2, 3, 4, 5, 6]), [2, 4, 6])),
     (3, "negative numbers and zero: get_evens([-4, 0, 7, 10]) should be [-4, 0, 10]",
      lambda: _same(_call(get_evens, [-4, 0, 7, 10]), [-4, 0, 10])),
     (2, "no even numbers: get_evens([1, 3, 5]) should be []", lambda: _same(_call(get_evens, [1, 3, 5]), [])),
 )
 """)

assert len(CODING) == 30
assert all(sum(1 for t in CODING.values() if t["cat"] == c) == 6 for c in CATEGORIES)
