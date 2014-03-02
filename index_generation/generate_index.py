#!/usr/bin/env python3

import os
import sys
from lxml import html
import re
import stemmer
import json
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

def padding_16(x):
    if x < 256:
        return bytes([0,x])
    else:
        return bytes([int(x/256), x%256])

# =============================================================================
samples = list_directory("../samples/")
filters = {}
p = stemmer.PorterStemmer()
write_little = bitarray(endian="little")
write_big = bitarray(endian="big")

write_little.frombytes(padding_16(len(samples)))
write_big.frombytes(padding_16(len(samples)))

if len(samples) > 65535:
    sys.exit("[ERROR] Too many articles to index. You will have to change the "
             "way data is stored in the binary file to handle such amount of "
             "files.")

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

    if filters[sample].bitarray.length() > 65535:
        sys.exit("[ERROR] Bloomfilter is too long for file "+sample+". You "
                 "will have to change the way data is stored in the binary "
                 "file to handle such amount of text.")

    tmp = bitarray(endian="little")
    tmp.frombytes(padding_16(filters[sample].bitarray.length()))
    write_little.extend(tmp)
    write_little.extend(filters[sample].bitarray)
    write_little.extend([0 for i in range(filters[sample].bitarray.length() %
                                          8)])
    tmp = bitarray(endian="big")
    tmp.frombytes(padding_16(filters[sample].bitarray.length()))
    write_big.extend(tmp)
    write_big.extend(filters[sample].bitarray)
    write_big.extend([0 for i in range(filters[sample].bitarray.length() %
                                          8)])

with open('../data/search_index_little', 'wb') as index_fh:
    print(write_little)
    write_little.tofile(index_fh)
with open('../data/search_index_big', 'wb') as index_fh:
    print(write_big)
    write_big.tofile(index_fh)

with open('../data/pages_index.json', 'w') as pages_fh:
    pages_fh.write(json.dumps(samples))
