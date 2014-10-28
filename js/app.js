/* Params */
var error_rate = 0.1;


/* Vars */
var bloom = Array(), index;
var ready = false;


/* Functions */
function callback() {
    if (typeof(index) === 'undefined' || bloom.length == 0) {
        return;
    }

    // Sets up the page, that is now ready
    ready = true;
    document.getElementById('main').innerHTML = '<form role="form" id="search_form"><p class="form-group"><label for="search">What are you thinking about?</label><input class="form-control" type="text" id="search" name="search" placeholder="Type something to search for…"/></p></form>';

    // Handle onchange actions
    document.getElementById('search').oninput = function (e) {
        if (!ready) {
            return;
        }

        if (e.target.value !== "") {
            filter_results(e.target.value);
        }
        else {
            document.getElementById("results").innerHTML = "";
        }
    }
}

// Returns true iff all the terms in the array are in the bloom filter b
function terms_in_bloom(terms, b) {
    for (var i = 0; i < terms.length; i++) {
        if (!b.test(terms[i])) {
            return false;
        }
    }
    return true;
}

// Filter the results to match the query
function filter_results(query) {
    var search_terms = query.trim();
    if (search_terms === "") {
        document.getElementById('results').innerHTML = "";
    }
    search_terms = query.split(" ").map(stemmer);

    var results = Array();
    for (var i = 0; i < index.length; i++) {
        if (terms_in_bloom(search_terms, bloom[i])) {
            results.push(index[i]);
        }
    }

    if (results.length > 0) {
        results_html = '<h4>' + results.length + ' results found:</h4><div>';
        for (var i = 0; i < results.length; i++) {
            results_html += '<a href="' + results[i]["url"] + '" class="list-group-item">' + results[i]["title"] + '</a>';
        }
        results_html += '</div>'
    }
    else {
        results_html = '<p class="alert alert-danger">No results found =(</p>';
    }
    document.getElementById('results').innerHTML = results_html;
}


/* App */

// Get the words index (a.k.a. Bloom Filter)
var oReq = new XMLHttpRequest();
oReq.open("GET", "data/filters", true);
oReq.responseType = "arraybuffer";
oReq.onload = function (oEvent) {
    var array_buffer = oReq.response;
    if (array_buffer) {
        var byte_array = new Int32Array(array_buffer);

        // First element is the number of bloom filters in the binary file
        var nb_bloom_filters = byte_array[0];
        // nb_bloom_filters next elements are the lengths of the arrays
        var lengths = Array();
        for (var i = 0; i < nb_bloom_filters; i++) {
            lengths.push(byte_array[1 + i]);
        }
        // Then, builds Bloom filters
        var l = 0, tmp_array;
        for (var i = 0; i < nb_bloom_filters; i++) {
            tmp_array = byte_array.subarray(1 + nb_bloom_filters + l, 1 + nb_bloom_filters + l + lengths[i]);
            var l = lengths[i];
            bloom.push(new BloomFilter(tmp_array, error_rate));
        }

        callback();
    }
    else {
        var error = document.getElementById('error');
        error.innerHTML = 'Unable to load the bloom filters.';
        error.className = "alert alert-danger";
    }
};
oReq.send(null);

// Get the pages index
var req = new XMLHttpRequest();
req.open('GET', 'data/pages.json', true);
req.onreadystatechange = function () {
    if (req.readyState == 4) {
        if (req.status == 200) {
            var tmp = JSON.parse(req.responseText);
            index = tmp['index'];

            callback();
        }
        else {
            document.getElementById('error').innerHTML = 'Unable to load the index.';
        }
    }
};
req.send(null);
