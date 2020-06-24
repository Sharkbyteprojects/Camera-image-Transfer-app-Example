$(document).ready(function(){
    var socket = io("/client");
    function xxbtn() {
        $("button").attr("style", "display:block;");
        $("button").click(function () {
            var a = document.createElement("a");
            a.href = $("img.video").attr("src");
            a.download = "screenshot.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
    var b = false;
    socket.on("imagestream", function (data) {
        $("img.video").attr("src", data);
        if (!b) {
            b = true;
            xxbtn();
        }
    });
    socket.on("welcome", function (data) {
        console.log("Connected");
            $("img.video").attr("style", "border-color: #00ffc8;");
            $("h2").attr("style", "color:#00ffc8;");
            $("p").attr("style", "color:#00ffc8;");
            $("html").attr("style", "border-color: #00ffc8;");
        $("p.msg").text("Connected!");
    });
    socket.on("disconnect", function () {
        disc = true;
        $("img.video").attr("style", "border-color: #f00;");
        $("h2").attr("style", "color:#f00;");
        $("p").attr("style", "color:#f00;");
        $("html").attr("style", "border-color: #f00;");
        $("p.msg").text("Disconnected!");
    });
    
});