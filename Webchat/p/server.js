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
        socket.on("unauth", function () {
            console.error("Unauthorized");
            document.location.reload();
        });
        $.get("/service/token/server", function (dataset) {
            var tokens;
            if (localStorage.getItem('token') && dataset.serverid === localStorage.getItem('server')) {
                tokens = localStorage.getItem('token');
            } else {
                tokens = prompt("SHARKAUTH\nEnter your Token:");
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
                    document.location.href = "/service/token/unauth";
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
