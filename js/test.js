/* These are some basic unit-tests for the bloom.js module */

var bloom = new BloomFilter(4, 0.1);

// Add some elements to the filter.
bloom.add("foo");
bloom.add("bar");

// Test if an item is in our filter.
// Returns true if an item is probably in the set,
// or false if an item is definitely not in the set.
console.assert(bloom.test("foo") === true);
console.assert(bloom.test("bar") === true);
console.assert(bloom.test("blah") === false);
console.assert(bloom.test("blahahvhzfeh") === false);
console.assert(bloom.test("blahahvhzfehgfgahafgfa") === false);

// Serialisation. Note that bloom.buckets may be a typed array,
// so we convert to a normal array first.
var array = [].slice.call(bloom.buckets),
    json = JSON.stringify(array);

console.log(array);
console.log(json);

// Deserialisation. Note that the any array-like object is supported, but
// this will be used directly, so you may wish to use a typed array for
// performance.
var bloom = new BloomFilter(array, 0.1);
console.log(bloom);

console.assert(bloom.test("foo") === true);
console.assert(bloom.test("bar") === true);
console.assert(bloom.test("blah") === false);
console.assert(bloom.test("blahahvhzfeh") === false);
console.assert(bloom.test("blahahvhzfehgfgahafgfa") === false);
