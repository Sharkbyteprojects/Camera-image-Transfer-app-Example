$(document).ready(function(){
    var socket = io("/client");
    socket.on("imagestream", function (data) {
        $("img.video").attr("src", data);
    });
    socket.on("welcome", function (data) {
        console.log("Connected");
            $("img.video").attr("style", "border-color: #00ffc8;");
            $("h2").attr("style", "color:#00ffc8;");
            $("p").attr("style", "color:#00ffc8;");
            $("html").attr("style", "border-color: #00ffc8;");
            $("p").text("Connected!");
    });
    socket.on("disconnect", function () {
        disc = true;
        $("img.video").attr("style", "border-color: #f00;");
        $("h2").attr("style", "color:#f00;");
        $("p").attr("style", "color:#f00;");
        $("html").attr("style", "border-color: #f00;");
        $("p").text("Disconnected!");
    });
});