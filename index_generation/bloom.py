#!/usr/bin/env python3

"""
This is a translation of the bloom.js script (originally from
https://github.com/jasondavies/bloomfilter.js) in Python.

Due to its status of translation of the previously mentionned JS code, you
should refer to this one for any particular doc that should be missing in this
implementation.

Needs the bitarray python module to work.

Note : Depending on your use case, the pybloom module available on Pypi may
better suits your needs. I reimplemented the above mentionned JS script in
Python mostly because I had to for this script, as the pybloom module uses
advanced hashing techniques, difficult to implement in JS.

This script has been written by Phyks and is in the public domain (or whatever
is closer to public domain in your country).
"""

import ctypes
import math

try:
    import numpy as np
except ImportError:
    raise ImportError('This script requires numpy')


class BloomFilter():
    def __init__(self, capacity, error_rate=0.1):
        """
        Implements a space-efficient probabilistic data structure.

        capacity
            This is the capacity of the BloomFilter. So to speak, it should be
            able to store at least *capacity* elements
        error_rate
            the error rate of the filter returning false positives. This
            determines the filters capacity. Inserting more than capacity
            elements greatly increases the chance of false positive.
        """
        if not (0 < error_rate < 1):
            raise ValueError("Error_Rate must be between 0 and 1.")
        if not capacity > 0 or type(capacity) != int:
            raise ValueError("Capacity must be > 0")

        # Same calculation as in the js file, see it for reference purpose
        # Basically determines the number of bits and slices from the capacity
        # and error_rate.
        k = math.ceil(- math.log(error_rate, 2))
        m = math.ceil(capacity * abs(math.log(error_rate)) / (k * (math.log(2) ** 2))) * k
        n = math.ceil(m / 32)
        m = n * 32
        self.m = m
        self.k = k

        kbytes = ctypes.c_int(1 << math.ceil(math.log(math.ceil(math.log(m, 2) / 8), 2))).value
        self.buckets = np.zeros(n, dtype=np.int32)
        if kbytes == 1:
            loc_type = np.uint8
        elif kbytes == 2:
            loc_type = np.uint16
        else:
            loc_type = np.int32
        self._locations = np.zeros(k, dtype=loc_type)

    def mod(self, a, b):
        """
        Tweak the % operator so that it behaves like in C and in JS.
        """
        if a > 0:
            return a % b
        else:
            return - (abs(a) % b)

    def locations(self, v):
        r = self._locations
        a = self.fnv_1a(v)
        b = self.fnv_1a_b(a)
        i = 0
        x = self.mod(a, self.m)
        while i < self.k:
            r[i] = (x + self.m) if x < 0 else x
            x = self.mod(x + b, self.m)
            i += 1
        return r

    def add(self, v):
        l = self.locations(str(v))
        i = 0
        buckets = self.buckets
        while i < self.k:
            index = math.floor(l[i] / 32)
            buckets[index] |= ctypes.c_int(1 << self.mod(l[i], 32)).value
            buckets[index] = ctypes.c_int(buckets[index]).value
            i += 1

    def test(self, v):
        l = self.locations(str(v))
        i = 0
        buckets = self.buckets
        while i < self.k:
            b = l[i]
            if ctypes.c_int(buckets[math.floor(b / 32)] & ctypes.c_int(1 << (self.mod(b, 32))).value).value == 0:
                return False
            i += 1
        return True

    def size(self):
        """
        Estimated cardinality
        """
        bits = 0
        buckets = self.buckets
        for i in range(0, len(buckets)):
            bits += self.popcnt(buckets[i])
        return -self.m * math.log(1 - bits / self.m) / self.k

    def popcnt(self, v):
        """
        http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
        """
        v -= ctypes.c_int(ctypes.c_int(v >> 1).value & ctypes.c_int(0x55555555).value).value
        v = ctypes.c_int(v & 0x33333333).value + c_types.c_int(ctypes.c_int(v >> 2).value & 0x33333333).value
        return ctypes.c_int((ctypes.c_int((v + ctypes.c_int(v >> 4).value) & 0xF0F0F0F).value * 0x1010101) >> 24).value


    def rshift(self,val, n):
        """
        Implements the >>> JS operator.

        From https://stackoverflow.com/questions/5832982/how-to-get-the-logical-right-binary-shift-in-python
        """
        return (val % 0x100000000) >> n

    def fnv_1a(self, v):
        """
        Fowler/Noll/Vo hashing.

        Uses a lot of ctypes.c_int because int in JS are represented as 64 bits
        floats. This representation is used for every arithmetical operations
        but not for bitwise operations. In this case they are treated as 32 bits
        integers !
        """
        n = len(v)
        a = 2166136261
        i = 0
        while i < n:
            c = ord(v[i])
            d = ctypes.c_int(c & 0xff000000).value
            if d:
                a ^= ctypes.c_int(d >> 24).value
                a = ctypes.c_int(a).valu
                a += ctypes.c_int(a << 1).value + ctypes.c_int(a << 4).value + ctypes.c_int(a << 7).value + ctypes.c_int(a << 8).value + ctypes.c_int(a << 24).value
            d = ctypes.c_int(c & 0xff0000).value
            if d:
                a ^= ctypes.c_int(d >> 16).value
                a = ctypes.c_int(a).valu
                a += ctypes.c_int(a << 1).value + ctypes.c_int(a << 4).value + ctypes.c_int(a << 7).value + ctypes.c_int(a << 8).value + ctypes.c_int(a << 24).value
            d = ctypes.c_int(c & 0xff00).value
            if d:
                a ^= ctypes.c_int(d >> 8).value
                a = ctypes.c_int(a).value
                a += ctypes.c_int(a << 1).value + ctypes.c_int(a << 4).value + ctypes.c_int(a << 7).value + ctypes.c_int(a << 8).value + ctypes.c_int(a << 24).value
            a ^= ctypes.c_int(c & 0xff).value
            a = ctypes.c_int(a).value
            a += ctypes.c_int(a << 1).value + ctypes.c_int(a << 4).value + ctypes.c_int(a << 7).value + ctypes.c_int(a << 8).value + ctypes.c_int(a << 24).value
            i += 1
        # From http://home.comcast.net/~bretm/hash/6.html
        a += ctypes.c_int(a << 13).value
        a ^= ctypes.c_int(self.rshift(a, 7)).value
        a = ctypes.c_int(a).value
        a += ctypes.c_int(a << 3).value
        a ^= ctypes.c_int(self.rshift(a, 17)).value
        a = ctypes.c_int(a).value
        a += ctypes.c_int(a << 5).value
        return ctypes.c_int(a & 0xffffffff).value

    def fnv_1a_b(self, a):
        """
        One additional iteration of FNV, given a hash.

        ctypes used, as explained above.
        """
        a += ctypes.c_int(a << 1).value + ctypes.c_int(a << 4).value + ctypes.c_int(a << 7).value + ctypes.c_int(a << 8).value + ctypes.c_int(a << 24).value
        a += ctypes.c_int(a << 13).value
        a ^= ctypes.c_int(self.rshift(a, 7)).value
        a = ctypes.c_int(a).value
        a += ctypes.c_int(a << 3).value
        a ^= ctypes.c_int(self.rshift(a, 17)).value
        a = ctypes.c_int(a).value
        a += ctypes.c_int(a << 5).value
        return ctypes.c_int(a & 0xffffffff).value
