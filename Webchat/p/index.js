$(document).ready(function () {
    $.get("/service/user", function(data) {
        if (data.serverAvail) {
            $("ul").html('<li class="send"><a href="/service/send">Sender</a></li>');
        }
        $("ul").append('<li class="client"><a href="/service/rec">Client</a></li>');
    }, "json");
});