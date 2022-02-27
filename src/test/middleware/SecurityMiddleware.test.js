var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var requireOrigin = require
const jwt = require('jsonwebtoken')
const request = require('supertest');

const SecurityMiddleware = require("../../main/middleware/SecurityMiddleware.js");
const TestHelper = require('../test/TestHelper.js')

describe('SecurityMiddleware: ensureAuthorization', function() {
  it('should return 500 on missing nodeboot.iam_simple.jwtSecret', async function() {
    var configuration = {}
    var securityMiddleware = new SecurityMiddleware("bar:baz", configuration, null, null);
    var ligthExpress = await TestHelper.createLigthExpress();
    ligthExpress.app.get("/foo", securityMiddleware.ensureAuthorization, function(req, res){
      return res.send("im the protected")
    })
    const response = await request(ligthExpress.app).get('/foo');
    expect(response.status).to.equal(500);
  });
  it('should return 401 [Missing token] on missing bearer token', async function() {
    var configuration = {
      nodeboot: {
        iam_simple: {
          jwtSecret: "theprecious"
        }
      }
    }
    var securityMiddleware = new SecurityMiddleware(null, configuration);
    var ligthExpress = await TestHelper.createLigthExpress();
    ligthExpress.app.get("/foo", securityMiddleware.ensureAuthorization, function(req, res){
      return res.send("im the protected")
    })
    const response = await request(ligthExpress.app).get('/foo');
    expect(response.status).to.equal(401);
  });
  it('should return 401 [Token should be Bearer] on wrong bearer token syntax', async function() {
    var configuration = {
      nodeboot: {
        iam_simple: {
          jwtSecret: "theprecious"
        }
      }
    }

    var securityMiddleware = new SecurityMiddleware(null, configuration);
    var ligthExpress = await TestHelper.createLigthExpress();
    ligthExpress.app.get("/foo", securityMiddleware.ensureAuthorization, function(req, res){
      return res.send("im the protected")
    })
    const response1 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': 'foobarbaz'});
    expect(response1.status).to.equal(401)

    const response2 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': 'foo bar'});
    expect(response2.status).to.equal(401)

    const response3 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': 'Bearer bar'});
    expect(response2.status).to.equal(401)

  });
  it('should return 401 [Invalid token] on malformed bearer token', async function() {
    var configuration = {
      nodeboot: {
        iam_simple: {
          jwtSecret: "theprecious"
        }
      }
    }
    var securityMiddleware = new SecurityMiddleware(null, configuration);
    var ligthExpress = await TestHelper.createLigthExpress();
    ligthExpress.app.get("/foo", securityMiddleware.ensureAuthorization, function(req, res){
      return res.send("im the protected")
    })
    const response1 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': 'Bearer 123456789'});;
    expect(response1.status).to.equal(401)
  });
  it('should return 403 when token is valid but there is a db error or unknown subject', async function() {

    var token1 = jwt.sign({
      subject_id: "jane_doe"
    }, "secret", {
      expiresIn: '3600s'
    });
    var token2 = jwt.sign({
      subject_id: "kurt_weller"
    }, "secret", {
      expiresIn: '3600s'
    });

    var req1 = {};
    req1.headers = {
      authorization: "Bearer " + token1
    };
    var req2 = {};
    req2.headers = {
      authorization: "Bearer " + token2
    };
    var res = function() {
      this.json = function(data) {
        return data;
      }
      this.status = function(status) {
      }
    }
    var configuration = {
      nodeboot: {
        iam_simple: {
          jwtSecret: "secret"
        }
      }
    }

    function subjectDataService() {
      this.findSubjectByIdentifier = function(identifier) {
        return new Promise((resolve, reject) => {
          if (identifier == "jane_doe") {
            reject("im a jerk")
          } else if (identifier == "kurt_weller") {
            resolve()
          }
        })
      }
    }

    var subjectDataService = new subjectDataService();
    var securityMiddleware = new SecurityMiddleware(null, configuration, subjectDataService);
    var ligthExpress = await TestHelper.createLigthExpress();
    ligthExpress.app.get("/foo", securityMiddleware.ensureAuthorization, function(req, res){
      return res.send("im the protected")
    })
    const response1 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': "Bearer " + token1});
    expect(response1.status).to.equal(403)
    const response2 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': "Bearer " + token2});
    expect(response2.status).to.equal(403)

  });
  it('should return 403 on valid token and valid subject but without permission', async function() {

    var token = jwt.sign({
      subject_id: "jane_doe"
    }, "secret", {
      expiresIn: '3600s'
    });

    var configuration = {
      nodeboot: {
        iam_simple: {
          jwtSecret: "secret"
        }
      }
    }

    function iamDataService() {
      this.hasPermissions = function() {
        return new Promise((resolve, reject) => {
          resolve({
            has_permission: "false"
          })
        })
      }
    }

    function subjectDataService() {
      this.findSubjectByIdentifier = function(identifier) {
        return new Promise((resolve, reject) => {
          resolve({
            role: "foo"
          })
        })
      }
    }

    var subjectDataService = new subjectDataService();
    var iamDataService = new iamDataService();
    var securityMiddleware = new SecurityMiddleware("foo:bar", configuration, subjectDataService, iamDataService);
    var ligthExpress = await TestHelper.createLigthExpress();
    ligthExpress.app.get("/foo", securityMiddleware.ensureAuthorization, function(req, res){
      return res.send("im the protected")
    })
    const response1 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': "Bearer " + token});
    var responseTextAsObject = JSON.parse(response1.text);
    expect(responseTextAsObject.code).to.equal(403);

  });
  it('should get the protected resource on valid token and valid subject with permission', async function() {

    var token = jwt.sign({
      subject_id: "jane_doe"
    }, "secret", {
      expiresIn: '3600s'
    });

    var configuration = {
      nodeboot: {
        iam_simple: {
          jwtSecret: "secret"
        }
      }
    }

    function iamDataService() {
      this.hasPermissions = function() {
        return new Promise((resolve, reject) => {
          resolve({
            has_permission: "true"
          })
        })
      }
    }

    function subjectDataService() {
      this.findSubjectByIdentifier = function(identifier) {
        return new Promise((resolve, reject) => {
          resolve({
            role: "foo"
          })
        })
      }
    }

    var subjectDataService = new subjectDataService();
    var iamDataService = new iamDataService();
    var securityMiddleware = new SecurityMiddleware("foo:bar", configuration, subjectDataService, iamDataService);
    var ligthExpress = await TestHelper.createLigthExpress();
    ligthExpress.app.get("/foo", securityMiddleware.ensureAuthorization, function(req, res){
      return res.send("im the protected")
    })
    const response1 = await request(ligthExpress.app).get('/foo').set({ 'Authorization': "Bearer " + token});
    expect(response1.status).to.equal(200);
    expect(response1.text).to.equal("im the protected");

  });

});
