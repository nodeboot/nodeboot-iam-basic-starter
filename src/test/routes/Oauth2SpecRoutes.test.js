var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
const http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
const request = require('supertest');
const util = require('util');
var Oauth2SpecRoutes = require('../../main/routes/Oauth2SpecRoutes.js');
describe('Oauth2SpecRoutes : configure', function() {
  it('should return 500 if error raises on the generateToken method ...', async function() {

    function Oauth2SpecService() {
      this.generateToken = function(identifier) {
        return new Promise((resolve, reject) => {
          reject(new Error("im a jerk2"))
        })
      }
    }

    var app = express();
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use(bodyParser.json());
    var expressListen = util.promisify(app.listen);

    app.get('/', function(req, res) {
      res.type('text/plain');
      res.send('Hell , its about time!!');
    });

    var server;
    const startServer = async () => {
      return new Promise((resolve, _reject) => {
        server = app.listen(0, () => {
          console.log('Express server started');
          resolve();
        });
      });
    };

    await startServer();
    var host = server.address().address;
    var port = server.address().port;
    console.log('express app for testing is listening at http://%s:%s', host, port);
    expect(true).to.equal(port > 0);

    var oauth2SpecRoutes = new Oauth2SpecRoutes(new Oauth2SpecService(), app);
    await oauth2SpecRoutes.configure();
    const response = await request(app)
      .post('/oauth2/token')
      .send('grant_type=password&username=foo&password=bar');
    expect(response.status).to.equal(500);
    server.close();
  });
  it('should return valid token if request is fine ...', async function() {

    function Oauth2SpecService() {
      this.generateToken = function(identifier) {
        return new Promise((resolve, reject) => {
          resolve({
            code: 200,
            message: "success",
            content: {
              access_token: "123456789"
            }
          })
        })
      }
    }

    var app = express();
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use(bodyParser.json());
    var expressListen = util.promisify(app.listen);

    app.get('/', function(req, res) {
      res.type('text/plain');
      res.send('Hell , its about time!!');
    });

    var server;
    const startServer = async () => {
      return new Promise((resolve, _reject) => {
        server = app.listen(0, () => {
          console.log('Express server started');
          resolve();
        });
      });
    };

    await startServer();
    var host = server.address().address;
    var port = server.address().port;
    console.log('express app for testing is listening at http://%s:%s', host, port);

    var oauth2SpecRoutes = new Oauth2SpecRoutes(new Oauth2SpecService(), app);
    await oauth2SpecRoutes.configure();
    const response = await request(app)
      .post('/oauth2/token')
      .send('grant_type=password&username=foo&password=bar');
    expect(response.status).to.equal(200);
    var responseTextAsObject = JSON.parse(response.text);
    expect(responseTextAsObject.code).to.equal(200);
    expect(responseTextAsObject.content.access_token).to.equal("123456789");
    server.close();
  });
});
