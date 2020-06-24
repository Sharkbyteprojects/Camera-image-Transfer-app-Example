git clone https://github.com/Sharkbyteprojects/webchat.git
cd ./webchat/Webchat
curl --ssl-no-revoke https://raw.githubusercontent.com/Sharkbyteprojects/webchat/master/Webchat/changeToHttps.sh|sh
npm i&&node app.js