var express = require('express');
var bodyParser = require('body-parser');

function TestHelper() {

}

TestHelper.createLigthExpress = async function() {
  var app = express();
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());

  var server;
  const startServer = async () => {
    return new Promise((resolve, _reject) => {
      server = app.listen(0, () => {
        resolve();
      });
    });
  };

  await startServer();
  var host = server.address().address;
  var port = server.address().port;
  console.log('express app for testing is listening at http://%s:%s', host, port);
  if(port>0) return {app:app, server:server};
};

module.exports = TestHelper;
