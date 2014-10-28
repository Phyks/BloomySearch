/*
 * BloomFilters as implemented by https://github.com/jasondavies/bloomfilter.js
 *
 * Original license kept
 *
 * Modified by Phyks to be constructed using the (capacity, error_rate) syntax rather
 * than the explicit (number of bits, number of hash functions) syntax.
*/

(function(exports) {
    exports.BloomFilter = BloomFilter;
    exports.fnv_1a = fnv_1a;
    exports.fnv_1a_b = fnv_1a_b;
    var typedArrays = typeof ArrayBuffer !== "undefined";

    // Creates a new bloom filter given its minimal capacity and an error_rate.
    // Calculation taken from https://en.wikipedia.org/wiki/Bloom_filter.
    // If *capacity* is an array-like object, with a length
    // property, then the bloom filter is loaded with data from the array, where
    // each element is a 32-bit integer.
    // *error_rate* is an estimation of the required error_rate.
    function BloomFilter(capacity, error_rate) {
        // *m* is the number of bits. Note that *m* is rounded up to
        // the nearest multiple of 32. *k* specifies the number of hashing functions.
        if (error_rate < 0 || error_rate > 1 || (typeof(capacity) === "number" && capacity < 0)) {
            return false;
        }
        var a, i = -1;
        // Number of slices, k
        var k = Math.ceil(- Math.log(error_rate) / Math.log(2));
        // Total number of bits, m
        // Size of the Int32 table, n
        var m, n;
        if (typeof capacity !== "number") {
            a = capacity;
            // Total number of bits, m
            m = a.length * 32;
            // Size of the Int32 table, n
            n = a.length;
        }
        else {
            // Total number of bits, m
            m = Math.ceil(capacity * Math.abs(Math.log(error_rate)) / (k * Math.pow(Math.log(2), 2))) * k;
            // Size of the Int32 table, n
            n = Math.ceil(m / 32);
            // Round total number of bits to closest multiple of 32
            m = n * 32;
        }
        this.m = m;
        this.k = k;
        if (typedArrays) {
            var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
                array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
            kbuffer = new ArrayBuffer(kbytes * k),
                    buckets = this.buckets = new Int32Array(n);
            if (a) while (++i < n) buckets[i] = a[i];
            this._locations = new array(kbuffer);
        } else {
            var buckets = this.buckets = [];
            if (a) while (++i < n) buckets[i] = a[i];
            else while (++i < n) buckets[i] = 0;
            this._locations = [];
        }
    }
    // See http://willwhim.wordpress.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
    BloomFilter.prototype.locations = function(v) {
        var k = this.k,
        m = this.m,
        r = this._locations,
            a = fnv_1a(v),
            b = fnv_1a_b(a),
                i = -1,
                x = a % m;
        while (++i < k) {
            r[i] = x < 0 ? (x + m) : x;
            x = (x + b) % m;
        }
        return r;
    };
    BloomFilter.prototype.add = function(v) {
        var l = this.locations(v + ""),
        i = -1,
        k = this.k,
            buckets = this.buckets;
        while (++i < k) buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
    };
    BloomFilter.prototype.test = function(v) {
        var l = this.locations(v + ""),
        i = -1,
        k = this.k,
            b,
            buckets = this.buckets;
        while (++i < k) {
            b = l[i];
            if ((buckets[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
                return false;
            }
        }
        return true;
    };
    // Estimated cardinality.
    BloomFilter.prototype.size = function() {
        var buckets = this.buckets,
        bits = 0;
        for (var i = 0, n = buckets.length; i < n; ++i) bits += popcnt(buckets[i]);
        return -this.m * Math.log(1 - bits / this.m) / this.k;
    };
    // http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
    function popcnt(v) {
        v -= (v >> 1) & 0x55555555;
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
        return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
    }
    // Fowler/Noll/Vo hashing.
    function fnv_1a(v) {
        var n = v.length,
        a = 2166136261,
        c,
            d,
            i = -1;
        while (++i < n) {
            c = v.charCodeAt(i);
            if (d = c & 0xff000000) {
                a ^= d >> 24;
                a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
            }
            if (d = c & 0xff0000) {
                a ^= d >> 16;
                a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
            }
            if (d = c & 0xff00) {
                a ^= d >> 8;
                a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
            }
            a ^= c & 0xff;
            a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
            console.log(a);
        }
        // From http://home.comcast.net/~bretm/hash/6.html
        a += a << 13;
        a ^= a >>> 7;
        a += a << 3;
        a ^= a >>> 17;
        a += a << 5;
        return a & 0xffffffff;
    }
    // One additional iteration of FNV, given a hash.
    function fnv_1a_b(a) {
        a += (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
        a += a << 13;
        a ^= a >>> 7;
        a += a << 3;
        a ^= a >>> 17;
        a += a << 5;
        return a & 0xffffffff;
    }
})(typeof exports !== "undefined" ? exports : this);
