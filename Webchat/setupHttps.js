//RUN curl --ssl-no-revoke https://raw.githubusercontent.com/Sharkbyteprojects/webchat/scripts/Webchat/changeToHttps.sh|sh
const fs = require("fs");
const data = fs.readFileSync(__dirname+"/app.js", "utf8");
fs.writeFileSync(__dirname+"/app.js",data.split(`false;/////////////////`).join(`true;/////////////////`),"utf8");