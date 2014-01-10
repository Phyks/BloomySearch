var loading = false;
var usable = false;
var index = false;

window.onload = function() {
};

document.getElementById('search_form').addEventListener('submit', function(e) {
    e.preventDefault();
});

document.getElementById('search').addEventListener('click', function() {
    if(this.value == "Search for articles...") {
        this.value = "";
    }

    if(index === false) {
        loading = true;
        document.getElementById("loading").innerHTML = "Loading index file...";

        var oReq = new XMLHttpRequest();
        oReq.open("GET", "/index_generation/search_index", true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                loading = false;
                usable = true;
                document.getElementById("loading").innerHTML = "";

                var tmp = new Uint8Array(arrayBuffer);
                for (var i = 0; i < tmp.byteLength; i++) {
                    // TODO
                }
            }
        };
        oReq.send(null);
    }
});

function callback_change() {
    if(!usable) {
        return;
    }
    var search = document.getElementById("search").value;
    document.getElementById("results").innerHTML = "<h2>Results :</h2>";
    for(var key in index) {
        //if(index[key].test(search)) { TODO
            document.getElementById("results").innerHTML += "<p>"+key+"</p>";
        //}
    }
    if(!document.querySelectorAll("#results p").length) {
        document.getElementById("results").innerHTML += "<p>No results...</p>";
    }
}

document.getElementById("search").addEventListener('input', callback_change);
