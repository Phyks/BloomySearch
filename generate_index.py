#!/usr/bin/env python3

import os
from lxml import html
import re
import json
from collections import defaultdict


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

# =============================================================================
samples = list_directory("samples/")
index = defaultdict(list)

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
    # TODO : Could use http://tartarus.org/martin/PorterStemmer/

    for word in words:
        index[sample].append(word)

with open("index.json", 'w') as index_fh:
    index_fh.write(json.dumps(index))
