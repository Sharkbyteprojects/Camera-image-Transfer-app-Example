$(document).ready(function () {
    $.get("/service/user", function (data) {
        $.get("/about/session", function (data) {
            if (data.prevHere) {
                $("h2").text("Welcome Back");
            } else {
                $("h2").text("Welcome");
            }
        }, "json");
        $("ul").html('');
        if (data.serverAvail) {
            $("ul").append('<li class="send"><a href="/service/send">Sender</a></li>');
        }
        $("ul").append('<li class="client"><a href="/service/rec">Client</a></li>');
        var socket = io("/user/index");
        socket.on("change", function (data) {
            $("ul").html('');
            if (data) {
                $("ul").append('<li class="send"><a href="/service/send">Sender</a></li>');
            }
            $("ul").append('<li class="client"><a href="/service/rec">Client</a></li>');
        });
    }, "json");
});