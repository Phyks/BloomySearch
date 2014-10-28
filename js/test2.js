/* These are some basic unit-tests for the bloom.js module */

var words = JSON.parse('["solut", "devic", "cryptkey2", "contain", "chang", "thi", "conf", "ckeyfiin", "support", "load", "here", "laptop", "file", "exampl", "paramet", "cryptsetup", "when", "proce", "line", "cryptkei", "wiki", "edit", "present", "describ", "ckei", "grub", "first", "warn", "mkinitcpio", "with", "updat", "mount", "manual", "ckeybyif", "least", "need", "multipl", "also", "found", "arch", "then", "us", "encrypt", "packag", "that", "over", "someth", "hook", "doesn", "avail", "avoid", "work", "which", "provid", "order", "initcpio", "anoth", "setup", "mean", "necessari", "default", "disk", "best", "linemkdir", "luk", "system", "unlock", "occurr", "requir", "command", "abl", "cryptdevice2", "encrypt2", "instal", "multi", "last", "extend", "obsolet", "boot", "your", "achiev", "second", "mkdir", "stuff", "final", "displai", "concern", "ad", "cryptdevic", "more", "copi"]');

var bloom2 = new BloomFilter(words.length, 0.1);
console.log(bloom2);

// Add some elements to the filter.
for (var i = 0; i < words.length; i++) {
    bloom2.add(words[i]);
}

// Test if an item is in our filter.
// Returns true if an item is probably in the set,
// or false if an item is definitely not in the set.
for (var i = 0; i < words.length; i++) {
    console.log(words[i] + " : " + bloom2.test(words[i]));
}

// Serialisation. Note that bloom.buckets may be a typed array,
// so we convert to a normal array first.
var array = [].slice.call(bloom2.buckets),
    json = JSON.stringify(array);

console.log(bloom2.buckets);
