var loading = false;
var usable = false;
var search_index = false;

// Check endianness to serve right file
function checkEndian(){
    var a = new ArrayBuffer(4);
    var b = new Uint8Array(a);
    var c = new Uint32Array(a);
    b[0] = 0xa1;
    b[1] = 0xb2;
    b[2] = 0xc3;
    b[3] = 0xd4;
    if(c[0] == 0xd4c3b2a1) return "little";
    if(c[0] == 0xa1b2c3d4) return "big";
    else return 0;
}

document.getElementById('search_form').addEventListener('submit', function(e) {
    e.preventDefault();
});

document.getElementById('search').addEventListener('click', function() {
    if(this.value == "Search for articles...") {
        this.value = "";
    }

    if(search_index === false) {
        loading = true;
        document.getElementById("loading").innerHTML = "Loading index file...";

        var oReq = new XMLHttpRequest();
        oReq.open("GET", "data/search_index_"+checkEndian(), true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText

            if (arrayBuffer) {
                var tmp = new Uint8Array(arrayBuffer);
                var nb_filters = 0;
                console.log(tmp);
                return;

                // First 16 bits == number of bitarrays
                for (var i = 0; i < 16; i++) {
                    nb_filters += tmp[i] << i;
                }
                search_index = new Array(nb_filters);

                // For each of the bitarrays, parse it
                var offset = 0;
                for (var i = 0; i < nb_filters; i++) {
                    // Size of the filter
                    var length = 0;
                    for (var j = offset; j < offset + 16; j++) {
                        length += tmp[j] << j;
                    }
                    search_index[i] = new Uint8Array(length);

                    // Parse filter
                    for (var j = 16; j < 16 + length; j++) {
                        search_index[i][j] = tmp[j + offset];
                    }

                    offset += 16 + length;
                }
                document.getElementById("loading").innerHTML = "";
                loading = false;
                usable = true;
            }
            else {
                document.getElementById("loading").innerHTML = "Error while loading search index.";
            }
        };
        oReq.send(null);

        var oReq2 = new XMLHttpRequest();
        oReq2.open("GET", "data/pages_index.json", true);
        oReq2.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    pages_index = window.JSON ? JSON.parse(this.responseText) : eval("("+this.responseText+")");
                }
                else {
                    document.getElementById("loading").innerHTML = "Error while loading pages index : HTTP error " + this.status + " " + this.statusText;
                }
            }
        }
        oReq2.send();
    }
});

/*function callback_change() {
    if(!usable) {
        return;
    }
    var search = document.getElementById("search").value;
    document.getElementById("results").innerHTML = "<h2>Results :</h2>";
//*    for(var key in index) {
        if(index[key].test(search)) {
            document.getElementById("results").innerHTML += "<p>"+key+"</p>";
        }
    }* //
    if(!document.querySelectorAll("#results p").length) {
        document.getElementById("results").innerHTML += "<p>No results...</p>";
    }
}

document.getElementById("search").addEventListener('input', callback_change);*/
