const expr = require("express");
const events = require('events');
const http = require("http");
const morgan = require("morgan");
const helmet = require("helmet")();
const crypto = require("crypto");
const hash = crypto.createHash('sha256');
hash.update(Math.random().toString());
const secretOfSess = hash.digest('hex');
const session = require('express-session');
const app = expr();
app.use(morgan("tiny"));
app.use(helmet);
app.use(expr.static(__dirname + '/p'));
const changeServ = new events.EventEmitter();
app.set('trust proxy', 1);
app.use(session({
    secret: secretOfSess,
    resave: false,
    saveUninitialized: true,
    cookie: { path: '/about/session', httpOnly: false, secure: false, expires: new Date(Date.now() + 3600000 * 3), maxAge: 3600000*3 }
}));
const pars = [
    {
        "path": "/",
        "file": "index.html",
        "onlyon": false
    },
    {
        "path": "/service/send/",
        "file": "send.html",
        "onlyon": true
    },
    {
        "file": "clie.html",
        "path": "/service/rec/",
        "onlyon": false
    }
];
let userhere = false;
for (let xx of pars) {
    app.get(xx.path, (req, res) => {
        if (!xx.onlyon) {
            res.sendFile(`${__dirname}/views/${xx.file}`);
        } else {
            if (!userhere) {
                res.sendFile(`${__dirname}/views/${xx.file}`);
            } else {
                res.sendStatus(423);
            }
        }
    });
}
app.get("/service/user", (req, res) => {
    res.json({ "serverAvail": !userhere });
});

app.get("/about/session", (req, res) => {
    let prevHere = false;
    if (req.session.prevHere) {
        prevHere = true;
    } else {
        req.session.prevHere = true;
    }
    res.json({ prevHere: prevHere, "time": req.session.cookie.maxAge });
});
const server = http.createServer(app);
const io = require('socket.io')(server);
const serverNamespace = io.of('/server');
const clientNamespace = io.of('/client');
const indexNamespace = io.of("/user/index");
/*indexNamespace.on('connection', (socket) => {
});*/
changeServ.on('change', () => {
    indexNamespace.emit("change", !userhere);
});
function doOn() {
    if (!userhere) {
        userhere = true;
        changeServ.emit('change');
    }
}
serverNamespace.on('connection', (socket) => {
    socket.emit("welcome", true);
    console.log('a user connected');
    socket.on("imagestream", (data) => {
        doOn();
        if (data !== "data:,") {
            clientNamespace.emit("imagestream", data);
        }
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
        userhere = false;
        changeServ.emit('change');
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