const fs = require("fs");
const data = fs.readFileSync(__dirname+"/app.js", "utf8");
fs.writeFileSync(__dirname+"/app.js", "utf8",data.split(`false;/////////////////`).join(`true;/////////////////`));