/////////////////CONFIG/////////////////
const useHttpS = false;/////////////////
//////////////HTTPS CONFIG//////////////
let optionshttps;
if (useHttpS) {
    const fs = require("fs");
    optionshttps = {
        key: fs.readFileSync("key.pem"),
        cert: fs.readFileSync("cert.pem")
    };
}
//////////////////CODE//////////////////
const expr = require("express");
const events = require('events');
const http = require("http");
const https = require("https");
const morgan = require("morgan");
const helmet = require("helmet")();
const crypto = require("crypto");
const hash = crypto.createHash('md5');
hash.update(Math.random().toString());
const token = crypto.createHmac('sha256', Math.random().toString())
    .update(Math.random().toString())
    .digest('hex');
console.log(`Token: ${token}\nYou need the token for auth on the webpage!\n\n`);
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
const hashn = crypto.createHash('md5');
hashn.update(Date.now().toString());
const n = hashn.digest("hex");
app.get("/service/token/server", (req, res) => {
    res.json({ serverid: n });
});
app.get("/service/token/veri", (req, res) => {
    const tokens = req.query.token;
    const iscorr = tokens === token;
    res.json({veri: iscorr});
});
const errinfo = [
    {
        path: "/service/token/err/unauth",
        file: __dirname + "/views/unauthorized.xml"
    },
    {
        path: "/service/token/err/exp",
        file: __dirname + "/views/expired.xml"
    }
];
for (let errx of errinfo) {
    app.get(errx.path, (req, res) => {
        res.set({
            'Content-Type': 'text/xml'
        });
        res.sendFile(errx.file);
    });
}
app.get("/about/session", (req, res) => {
    let prevHere = false;
    if (req.session.prevHere) {
        prevHere = true;
    } else {
        req.session.prevHere = true;
    }
    res.json({ prevHere: prevHere, "time": req.session.cookie.maxAge, "host": req.headers.host });
});
let server;
if (useHttpS) {
    server = https.createServer(optionshttps, app);
    http.createServer((req, res) => {
        const hostname = req.headers.host;
        res.writeHead(302, { "Location": "https://" + hostname });
        res.end("302 - HTTP FORBIDDEN\nUSE HTTPS");
        console.log("USER CALLED HTTP");
    }).listen(80, () => {
        console.log("ONLINE: http://localhost Redirector");
    });
} else {
    server = http.createServer(app);
}
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
let count = 0;
serverNamespace.on('connection', (socket) => {
    socket.emit("welcome", true);
    serverNamespace.emit("users", count);
    socket.on("imagestream", (datas) => {
        const data = datas.data;
        if (datas.token === token) {
            doOn();
            if (data !== "data:,") {
                clientNamespace.emit("imagestream", data);
            }
        } else {
            socket.emit("unauth", true);
        }
    });
    socket.on('disconnect', () => {
        userhere = false;
        changeServ.emit('change');
    });
});
changeServ.on('newClient', () => {
    serverNamespace.emit("users", count);
});
clientNamespace.on('connection', (socket) => {
    socket.emit("welcome", true);
    count++;
    changeServ.emit('newClient');
    socket.on('disconnect', () => {
        count--;
        changeServ.emit('newClient');
    });
});
let port = 80;
let xxx = "http://";
if (useHttpS) {
    port = 443;
    xxx = "https://";
}
server.listen(port, () => {
    console.log("Listen on "+xxx+"localhost");
});