const expr = require("express");
const http = require("http");
const morgan = require("morgan");
const helmet = require("helmet")();
const app = expr();
app.use(morgan("tiny"));
app.use(helmet);
app.use(expr.static(__dirname+'/p'))
const pars = [
    {
        "path": "/",
        "file": "index.html"
    },
    {
        "path": "/service/send/",
        "file": "send.html"
    },
    {
        "file": "clie.html",
        "path": "/service/rec/"
    }
];
for (let xx of pars) {
    app.get(xx.path, (req, res) => {
        res.sendFile(`${__dirname}/views/${xx.file}`);
    });
}
const server = http.createServer(app);
const io = require('socket.io')(server);
const serverNamespace = io.of('/server');
const clientNamespace = io.of('/client');
serverNamespace.on('connection', (socket) => {
    socket.emit("welcome", true);
    console.log('a user connected');
    socket.on("imagestream", (data) => {
        if (data != "data:,") {
            clientNamespace.emit("imagestream", data);
        }
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
clientNamespace.on('connection', (socket) => {
    socket.emit("welcome", true);
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
server.listen(80, () => {
    console.log("Listen on localhost");
});