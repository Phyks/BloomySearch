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

        kbytes = 1 << math.ceil(math.log(math.ceil(math.log(m, 2) / 8), 2))
        self.buckets = np.zeros(n, dtype=np.int32)
        if kbytes == 1:
            loc_type = np.uint8
        elif kbytes == 2:
            loc_type = np.uint16
        else:
            loc_type = np.int32
        self._locations = np.zeros(k, dtype=loc_type)

    def locations(self, v):
        r = self._locations
        a = self.fnv_1a(v)
        b = self.fnv_1a_b(a)
        print(b)
        i = 0
        x = a % self.m
        while i < self.k:
            r[i] = (x + self.m) if x < 0 else x
            x = (x + b) % self.m
            i += 1
        return r

    def add(self, v):
        l = self.locations(v + "")
        i = 0
        buckets = self.buckets
        while i < self.k:
            buckets[math.floor(l[i] / 32)] |= 1 << int(l[i] % 32)
            i += 1

    def test(self, v):
        l = self.locations(v + "")
        i = 0
        buckets = self.buckets
        while i < self.k:
            b = l[i]
            if buckets[math.floor(b / 32)] & (1 << int(b % 32)) == 0:
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
        v -= (v >> 1) & 0x55555555
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333)
        return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24

    def fnv_1a(self, v):
        """
        Fowler/Noll/Vo hashing.
        """
        n = len(v)
        a = 2166136261
        i = 0
        while i < n:
            c = ord(v[i])
            d = c & 0xff000000
            if d:
                a ^= d >> 24
                a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24)
            d = c & 0xff0000
            if d:
                a ^= d >> 16
                a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24)
            d = c & 0xff00
            if d:
                a ^= d >> 8
                a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24)
            a ^= c & 0xff
            a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24)
            i += 1
        # From http://home.comcast.net/~bretm/hash/6.html
        a += a << 13
        a ^= a >> 7
        a += a << 3
        a ^= a >> 17
        a += a << 5
        return a & 0xffffffff

    def fnv_1a_b(self, a):
        """
        One additional iteration of FNV, given a hash.
        """
        a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24)
        a += a << 13
        a ^= a >> 7
        a += a << 3
        a ^= a >> 17
        a += a << 5
        print(a)
        return a & 0xffffffff
