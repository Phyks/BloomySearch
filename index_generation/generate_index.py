#!/usr/bin/env python3

import os
from lxml import html
import re
import stemmer
from bitarray import bitarray
from pybloom import BloomFilter


# List all files in path directory
def list_directory(path):
    fichier = []
    for root, dirs, files in os.walk(path):
        for i in files:
            fichier.append(os.path.join(root, i))
    return fichier


def remove_common_words(words):
    returned = [word for word in words if len(word) > 3]
    return returned


def bitfield(n):
    return [1 if digit=='1' else 0 for digit in bin(n)[2:]]

# =============================================================================
samples = list_directory("../samples/")
filters = {}
p = stemmer.PorterStemmer()
write = bitarray()

for sample in samples:
    with open(sample, 'r') as sample_fh:
        content = sample_fh.read()

    # Get text from HTML content
    words = html.fromstring(content).text_content().replace("\n", "")
    words = re.findall(r"[\w]+", words)
    # Remove all punctuation etc., convert words to lower and delete duplicates
    words = list(set([word.lower() for word in words]))

    # Remove common words
    words = remove_common_words(words)
    # Stemming to reduce the number of words
    words = [p.stem(word, 0, len(word)-1) for word in words]

    filters[sample] = BloomFilter(capacity=len(words), error_rate=0.1)
    for word in words:
        filters[sample].add(word)

with open('search_index', 'wb') as index_fh:
    index_fh.write(filters[samples[0]].bitarray.tobytes()) # TODO

write.extend(bitfield(len(filters[samples[0]].bitarray)))
write.extend(filters[samples[0]].bitarray)
print(write)
