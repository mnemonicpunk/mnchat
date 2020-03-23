const PORT = 8000;

var Server = require('./server/server.js');

var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

var server = new Server();

app.use(express.static('client'));
app.ws('/chat', function(ws, req) {
    server.connectUser(ws);
});

app.listen(PORT, function () {
  console.log('Webserver listening on ' + PORT);
});

