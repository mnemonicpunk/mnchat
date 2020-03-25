const PORT = 8000;

var Server = require('./server/server.js');

var express = require('express');
var https = require('https');
var app = express();
var expressWs = require('express-ws')(app);

var SERVER_CFG = require('./config/server.json');

var server = new Server(SERVER_CFG);

app.use(express.static('client'));
app.ws('/chat', function(ws, req) {
    server.connectUser(ws);
});

let web_server = app;
if (SERVER_CFG.HTTPS == true) {
  web_server = https.createServer({
    key: fs.readFileSync(SERVER_CFG.cert_path + '/server.key'),
    cert: fs.readFileSync(SERVER_CFG.cert_path + '/server.cert')
  }, app)
}

web_server.listen(SERVER_CFG.port, function () {
  console.log('Webserver listening on ' + SERVER_CFG.port);
});

