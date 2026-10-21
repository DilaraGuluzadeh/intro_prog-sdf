# -*- coding: utf-8 -*-
"""Partial-credit and tolerance probes (used by build_bank.py --verify).

Each probe is a deliberately incomplete or differently-formatted solution and the score it must get.
Lenient formats (print instead of return, labels, renamed function, tabs) must still earn full points.
"""

PROBES = {
    # --- partial solutions -> partial points
    "A11": ("def digit_sum(n):\n    return n // 100 + n % 10", 4),                       # forgets the middle digit
    "A16": ("def first_last(n):\n    return n // 1000, n % 10, 0", 6),                     # sum missing
    "B7": ("def max_min(a, b, c):\n    return max(a, b, c), a", 5),                           # min wrong
    "B9": ("def is_triangle(a, b, c):\n    return a + b > c", 7),                              # only one inequality checked
    "C6": ("def is_prime(n):\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True", 7),  # 1 -> True
    "C10": ("def gcd_lcm(a, b):\n    import math\n    return math.gcd(a, b), a * b", 5),      # LCM wrong
    "D4": ("def max_min_index(lst):\n    return max(lst), 0, min(lst), 0", 6),               # indexes wrong
    "D8": ("def unique(lst):\n    return list(set(lst))", 7),                                 # order not kept (sets sort small ints)
    "D9": ("def rotate_right(lst, k):\n    return lst[-k:] + lst[:-k]", 7),                    # k > len not handled
    "E15": ("def get_evens(lst):\n    return [x for x in lst if x % 2 == 0 and x > 0]", 7),   # loses -4 and 0
    "B11": ("def quadrant(x, y):\n    if x > 0 and y > 0:\n        return 'Quadrant I'\n    elif x < 0 and y > 0:\n        return 'Quadrant II'\n"
            "    elif x < 0 and y < 0:\n        return 'Quadrant III'\n    else:\n        return 'Quadrant IV'", 8),         # axes missing
    # --- tolerant formats -> full points
    "A12": ("def convert_seconds(total):\n    h = total // 3600\n    m = total % 3600 // 60\n    s = total % 60\n"
            "    print(h, 'hour,', m, 'minute,', s, 'seconds')", 10),                     # prints instead of returning
    "C9": ("def reverse_number(n):\n    print('Reversed number:', str(n)[::-1])", 10),     # prints '0021' style text
    "B10": ("def is_leap(year):\n    if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:\n        print('Leap year')\n"
            "    else:\n        print('Not a leap year')", 10),
    "E14": ("from collections import Counter\ndef char_frequency(s):\n    return Counter(s)", 10),
    "E12": ("def my_gcd(a, b):\n\twhile b:\n\t\ta, b = b, a % b\n\treturn a", 10),          # renamed + tabs
    "D7": ("def bubble_sort(lst):\n    n = len(lst)\n    for i in range(n):\n        for j in range(n - 1):\n"
           "            if lst[j] > lst[j + 1]:\n                lst[j], lst[j + 1] = lst[j + 1], lst[j]", 10),  # sorts in place, no return
    "A14": ("import math\ndef distance(x1, y1, x2, y2):\n    return round(math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), 2)", 10),
    "C13": ("def star_triangle(n):\n    return '\\n'.join('*' * i for i in range(1, n + 1))", 10),
    "B12": ("def is_palindrome(n):\n    return 'Palindrome' if str(n) == str(n)[::-1] else 'Not a palindrome'", 10),
    "A11-b": ("def digit_product(n):\n    print(f'Product of digits: {(n // 100) * (n // 10 % 10) * (n % 10)}')", 10),
    "D4-b": ("def second_largest(lst):\n    s = sorted(set(lst))\n    print('Second largest:', s[-2])", 10),
    "E13": ("def longest_word(sentence):\n    print(\"Longest word: '\" + max(sentence.split(), key=len) + \"'\")", 10),
    # --- wrong top-level input() -> clear message, 0 points
    "E10": ("n = int(input())\ndef factorial_recursive(n):\n    return 1 if n <= 1 else n * factorial_recursive(n - 1)", 0),
}
