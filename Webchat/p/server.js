(function () {
  function getFrame() {
    const canvas = document.createElement("canvas");
    canvas.width = document.getElementById("videos").videoWidth;
    canvas.height = document.getElementById("videos").videoHeight;
    canvas.getContext("2d").drawImage(document.getElementById("videos"), 0, 0);
    return canvas.toDataURL("image/png");
  }
  $(document).ready(function () {
    var socket = io("/server");
    try {
      var conn = false;
        var disc = false;
        if (document.location.hash !== "#d") {
            navigator.mediaDevices
                .getUserMedia({ video: { width: 426, height: 300 } })
                .then(function (stream) {
                    if (conn) {
                        $("video.video#videos").attr("style", "border-color: #00ffc8;");
                        $("h2").attr("style", "color:#00ffc8;");
                        $("p").attr("style", "color:#00ffc8;");
                        $("html").attr("style", "border-color: #00ffc8;");
                        $("p.msg").text("Connected!");
                    } else if (!disc) {
                        conn = true;
                        $("p.msg").text("Camera on, waiting for Socket");
                    }
                    document.getElementById("videos").srcObject = stream;
                });
        } else {
            navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"/*, width: 426, height: 300*/
                },
                audio: false
            }).then(function (stream) {
                if (conn) {
                    $("video.video#videos").attr("style", "border-color: #00ffc8;");
                    $("h2").attr("style", "color:#00ffc8;");
                    $("p").attr("style", "color:#00ffc8;");
                    $("html").attr("style", "border-color: #00ffc8;");
                    $("p.msg").text("Connected!");
                } else if (!disc) {
                    conn = true;
                    $("p.msg").text("Camera on, waiting for Socket");
                }
                document.getElementById("videos").srcObject = stream;
            });
        }
      socket.on("users", function (data) {
        $("p.usr").text("Listening Users:" + data);
      });
      socket.on("welcome", function (data) {
        disc = false;
        console.log("Connected");
        if (conn) {
          $("video.video#videos").attr("style", "border-color: #00ffc8;");
          $("h2").attr("style", "color:#00ffc8;");
          $("p").attr("style", "color:#00ffc8;");
          $("html").attr("style", "border-color: #00ffc8;");
          $("p.msg").text("Connected!");
        } else {
          conn = true;
          $("p.msg").text("Socket on, waiting for Camera");
        }
      });
      socket.on("disconnect", function () {
        disc = true;
        $("video.video#videos").attr("style", "border-color: #f00;");
        $("h2").attr("style", "color:#f00;");
        $("p").attr("style", "color:#f00;");
        $("html").attr("style", "border-color: #f00;");
        $("p.msg").text("Disconnected!");
      });
        var erroee = false;
        socket.on("unauth", function () {
            if (!erroee) {
                erroee = true;
                console.error("Unauthorized - EXPIRED");
                $.get("/service/token/err/exp", function (dd) {
                    document.open();
                    var xxxxxx = $(dd).find("data");
                    var info = $(xxxxxx).find("info");
                    var text = $(xxxxxx).find("text");
                    document.write("<body style=\"background-color:black;color:red;\"><h1>" + $(info).html() + "</h1><p>" + $(text).html() + "</p><p><button onclick=\"document.location.reload();\">Type a new Token in</button></p></body>");
                    document.close();
                }, "xml");
            }
        });
        $.get("/service/token/server", function (dataset) {
            var tokens;
            if (localStorage.getItem('token') && dataset.serverid === localStorage.getItem('server')) {
                tokens = localStorage.getItem('token');
            } else {
                tokens = prompt("SHARKAUTH\nEnter your Token:");
                if (tokens === null) {
                    document.location.href = "/";
                }
            }
            if (!tokens) {
                tokens = prompt("SHARKAUTH\nEnter your Token:");
            }
            $.get("/service/token/veri", { token: tokens }, function (datas) {
                if (datas.veri) {
                    setInterval(function () {
                        try {
                            localStorage.setItem('token', tokens);
                            localStorage.setItem("server", dataset.serverid);
                        } catch (e) {
                            console.warn("Localstorage Error");
                        }
                        var frame = getFrame();
                        const ds = { data: frame, token: tokens };
                        socket.emit("imagestream", ds);
                        console.log(frame);
                    }, 1000 / 6);
                } else {
                    localStorage.removeItem('token');
                    document.open();
                    document.write("LOAD ERROR MESSAGE");
                    document.close();
                    $.get("/service/token/err/unauth", function (dd) {
                        document.open();
                        var xxxxxx = $(dd).find("data");
                        var info = $(xxxxxx).find("info");
                        var text = $(xxxxxx).find("text");
                        var typed = $(xxxxxx).find("typed");
                        document.write("<body style=\"background-color:black;color:red;\"><h1>" + $(info).html() + "</h1><p>" + $(text).html() + "</p><p>" + $(typed).text().replace("${token}", tokens) + "</p><p><button onclick=\"document.location.reload();\">Retry</button></p></body>");
                        document.close();
                    }, "xml");
                }
            }, "json");
        },"json");
    } catch (e) {
      console.error(e);
      $("body").append(
        '<h1 style="color:red">ERROR, TRY TO USE A NEWER BROWSER! - More Information in the Console</h1>'
      );
    }
  });
})();
