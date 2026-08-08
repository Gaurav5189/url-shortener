"""Unit tests for the Base62 encoding/decoding utility."""

import pytest

from url_shortener_api.core.base62 import (
    ALPHABET,
    CODE_LENGTH,
    MAX_VALUE,
    decode,
    encode,
)


class TestEncode:
    """Tests for base62.encode()."""

    def test_zero(self):
        """Encoding 0 should produce '00000'."""
        assert encode(0) == "00000"

    def test_one(self):
        """Encoding 1 should produce '00001'."""
        assert encode(1) == "00001"

    def test_small_numbers(self):
        """Small numbers should be left-padded to 5 characters."""
        result = encode(10)
        assert len(result) == CODE_LENGTH
        assert result == "0000A"

    def test_base62_value(self):
        """Encoding 62 should produce '00010' (carry to second digit)."""
        assert encode(62) == "00010"

    def test_known_values(self):
        """Verify specific known encode values."""
        # 61 = last single digit = 'z'
        assert encode(61) == "0000z"
        # 62 = first two-digit = '10'
        assert encode(62) == "00010"
        # 3844 = 62^2 = '100'
        assert encode(3844) == "00100"

    def test_max_value(self):
        """Encoding the max value should produce 'zzzzz'."""
        result = encode(MAX_VALUE)
        assert result == "zzzzz"
        assert len(result) == CODE_LENGTH

    def test_always_five_chars(self):
        """All encodings should be exactly 5 characters."""
        test_values = [0, 1, 10, 100, 1000, 10000, 100000, MAX_VALUE]
        for val in test_values:
            assert len(encode(val)) == CODE_LENGTH, f"Failed for {val}"

    def test_negative_raises(self):
        """Negative numbers should raise ValueError."""
        with pytest.raises(ValueError, match="negative"):
            encode(-1)

    def test_overflow_raises(self):
        """Numbers exceeding 5-char capacity should raise ValueError."""
        with pytest.raises(ValueError, match="exceeds"):
            encode(MAX_VALUE + 1)


class TestDecode:
    """Tests for base62.decode()."""

    def test_zero(self):
        """Decoding '00000' should return 0."""
        assert decode("00000") == 0

    def test_one(self):
        """Decoding '00001' should return 1."""
        assert decode("00001") == 1

    def test_max(self):
        """Decoding 'zzzzz' should return MAX_VALUE."""
        assert decode("zzzzz") == MAX_VALUE

    def test_invalid_length(self):
        """Wrong-length strings should raise ValueError."""
        with pytest.raises(ValueError, match="Expected 5"):
            decode("abc")
        with pytest.raises(ValueError, match="Expected 5"):
            decode("abcdef")

    def test_invalid_character(self):
        """Invalid characters should raise ValueError."""
        with pytest.raises(ValueError, match="Invalid Base62"):
            decode("abc!d")


class TestRoundTrip:
    """Test encode → decode roundtrip integrity."""

    def test_roundtrip_small(self):
        """Small integers should survive encode → decode."""
        for i in range(100):
            assert decode(encode(i)) == i

    def test_roundtrip_large(self):
        """Large integers should survive encode → decode."""
        test_values = [1000, 50000, 1_000_000, 100_000_000, MAX_VALUE]
        for val in test_values:
            assert decode(encode(val)) == val, f"Roundtrip failed for {val}"

    def test_alphabet_coverage(self):
        """Ensure all 62 characters appear in at least one encoding."""
        seen = set()
        # Check first 62 values (each maps to a different last character)
        for i in range(62):
            code = encode(i)
            seen.add(code[-1])
        assert seen == set(ALPHABET)
