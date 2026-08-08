"""Base62 encoding/decoding utility for short code generation.

Converts auto-increment integer IDs to 5-character alphanumeric strings
and back. Character set: 0-9A-Za-z (62 characters).

Capacity: 62^5 = 916,132,832 unique codes.
"""

# fmt: off
ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
# fmt: on
BASE = len(ALPHABET)  # 62
CODE_LENGTH = 5
MAX_VALUE = BASE**CODE_LENGTH - 1  # 916,132,831

# Pre-compute reverse lookup for decoding
_CHAR_TO_VALUE: dict[str, int] = {char: idx for idx, char in enumerate(ALPHABET)}


def encode(num: int) -> str:
    """Convert a non-negative integer to a 5-character Base62 string.

    The result is left-padded with '0' to ensure exactly 5 characters.

    Args:
        num: A non-negative integer (0 <= num <= 916,132,831).

    Returns:
        A 5-character Base62 string.

    Raises:
        ValueError: If num is negative or exceeds the 5-character capacity.
    """
    if num < 0:
        raise ValueError(f"Cannot encode negative number: {num}")
    if num > MAX_VALUE:
        raise ValueError(
            f"Number {num} exceeds 5-character Base62 capacity ({MAX_VALUE})"
        )

    if num == 0:
        return ALPHABET[0] * CODE_LENGTH  # "00000"

    chars: list[str] = []
    n = num
    while n > 0:
        n, remainder = divmod(n, BASE)
        chars.append(ALPHABET[remainder])

    # Reverse (least-significant digit was appended first) and left-pad
    chars.reverse()
    return "".join(chars).rjust(CODE_LENGTH, ALPHABET[0])


def decode(code: str) -> int:
    """Convert a 5-character Base62 string back to an integer.

    Args:
        code: A 5-character string using the Base62 alphabet.

    Returns:
        The decoded integer.

    Raises:
        ValueError: If the code contains invalid characters or wrong length.
    """
    if len(code) != CODE_LENGTH:
        raise ValueError(
            f"Expected {CODE_LENGTH}-character code, got {len(code)}: '{code}'"
        )

    result = 0
    for char in code:
        if char not in _CHAR_TO_VALUE:
            raise ValueError(f"Invalid Base62 character: '{char}'")
        result = result * BASE + _CHAR_TO_VALUE[char]

    return result
