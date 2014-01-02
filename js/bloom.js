var loading = false;
var usable = false;
var index = false;

$("form").submit(function(e) {
    e.preventDefault();
});

$("#search").click(function() {
    if($(this).val() == "Search for articles...") {
        $(this).val("");
    }

    if(index === false) {
        loading = true;
        $("#loading").text("Loading index file...");
        $.getJSON("index.json", function(data) {
            loading = false;
            usable = true;
            $("#loading").text("");
            index = new Array();

            for(var key in data) {
                index[key] = new BloomFilter(32*256, 16);

                for(var word_index in data[key]) {
                    index[key].add(data[key][word_index]);
                }
            }

            callback_change();
        });
    }
});

function callback_change() {
    if(!usable) {
        return;
    }
    var search = $("#search").val();
    $("#results").html("<h2>Results :</h2>");
    for(var key in index) {
        if(index[key].test(search)) {
            $("#results").append("<p>"+key+"</p>");
        }
    }
    if(!$("#results p").length) {
        $("#results").append("<p>No results...</p>");
    }
}

$("#search").on('input', callback_change);
