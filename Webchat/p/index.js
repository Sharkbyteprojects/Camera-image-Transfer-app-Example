import $ from "./jquery";
import io from "./socket";

$(document).ready(function () {
    $.get("/service/user", function (data) {
        $.get("/about/session", function (data) {
            if (data.prevHere) {
                $("h2").text("Welcome Back");
            } else {
                $("h2").text("Welcome");
            }
            $("p").text(data.host);
        }, "json");
        $("ul").html('');
        if (data.serverAvail) {
            $("ul").append('<li class="send" style="color:#ffea00"><a style="color:#c2fa01" href="/service/send">Sender</a></li><li class="scr"><a style="color:#c2fa01" href="/service/send#d">Send Screen (Experimental)</a></li>');
        }
        $("ul").append('<li class="client" style="color:#ffea00"><a style="color:#c2fa01" href="/service/rec">Client</a></li>');
        var socket = io("/user/index");
        socket.on("change", function (data) {
            $("ul").html('');
            if (data) {
                $("ul").append('<li class="send" style="color:#ffea00"><a style="color:#c2fa01" href="/service/send">Sender</a></li><li class="scr"><a style="color:#c2fa01" href="/service/send#d">Send Screen (Experimental)</a></li>');
            }
            $("ul").append('<li class="client" style="color:#ffea00"><a style="color:#c2fa01" href="/service/rec">Client</a></li>');
        });
    }, "json");
});