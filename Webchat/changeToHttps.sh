openssl genrsa -out key.pem 4096
openssl req -new -x509 -key key.pem -out cert.pem -days 9999 -subj /CN=localhost
node setupHttps.js
