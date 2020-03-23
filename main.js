const PORT = 8000;

var express = require('express');
var app = express();

app.use(express.static('client'));

app.listen(PORT, function () {
  console.log('Example app listening on port 3000!');
});