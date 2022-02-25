const NodeInternalModulesHook = require('meta-js').NodeInternalModulesHook;
NodeInternalModulesHook._compile();
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var requireOrigin = require
const jwt = require('jsonwebtoken')

const SecurityMiddleware = require("../../main/middleware/SecurityMiddleware.js");

describe('SecurityMiddleware: ensureAuthorization', function() {
  it('should return 500 on missing nodeboot.iam_simple.jwtSecret', async function() {
    var req = {};
    req.headers = {};
    var res = function() {
      this.json = function(data) {
        return data;
      }
    }

    var configuration = {}
    var securityMiddleware = new SecurityMiddleware();
    securityMiddleware.configuration = configuration;
    var response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(500);
  });
  it('should return 401 [Missing token] on missing bearer token', async function() {
    var req = {};
    req.headers = {};
    var res = function() {
      this.json = function(data) {
        return data;
      }
    }
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"theprecious"
        }
      }
    }
    var securityMiddleware = new SecurityMiddleware();
    securityMiddleware.configuration = configuration;
    var response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(401);
  });
  it('should return 401 [Token should be Bearer] on wrong bearer token syntax', async function() {
    var req = {};
    req.headers = {
      authorization: "Bearer  123456"
    };
    var res = function() {
      this.json = function(data) {
        return data;
      }
    }

    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"theprecious"
        }
      }
    }
    var securityMiddleware = new SecurityMiddleware();
    securityMiddleware.configuration = configuration;
    var response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(401);

    req.headers.authorization = "foo bar";
    response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(401);

    req.headers.authorization = "Bearer bar";
    response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(401);
  });
  it('should return 401 [Invalid token] on malformed bearer token', async function() {
    var req = {};
    req.headers = {
      authorization: "Bearer 123456789"
    };
    var res = function() {
      this.json = function(data) {
        return data;
      }
    }
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"theprecious"
        }
      }
    }
    var securityMiddleware = new SecurityMiddleware();
    securityMiddleware.configuration = configuration;
    var response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(401);
  });
  it('should return 403 on valid token but db error or unknown subject', async function() {

    var token = jwt.sign({subject_id:"jane_doe"}, "secret", {
      expiresIn: '3600s'
    });

    var req = {};
    req.headers = {
      authorization: "Bearer "+token
    };
    var res = function() {
      this.json = function(data) {
        return data;
      }
    }
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }

    var dbSession = function(){
      return new function(){
        this.select = function(){
          return new function(){
            this.from = function(){
              return new function(){
                this.where = function(){
                  return new Promise((resolve, reject) => {
                    reject("im a jerk")
                  })
                }
              }
            }
          }
        }
      }
    }

    var securityMiddleware = new SecurityMiddleware();
    securityMiddleware.configuration = configuration;
    securityMiddleware.dbSession = new dbSession();
    var response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(403);

    var dbSession2 = function(){
      return new function(){
        this.select = function(){
          return new function(){
            this.from = function(){
              return new function(){
                this.where = function(){
                  return new Promise((resolve, reject) => {
                    resolve()
                  })
                }
              }
            }
          }
        }
      }
    }

    securityMiddleware.configuration = configuration;
    securityMiddleware.dbSession = new dbSession2();
    var response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(403);

  });
  it('should return 403 on valid token and valid subject but without permission', async function() {

    var token = jwt.sign({subject_id:"jane_doe"}, "secret", {
      expiresIn: '3600s'
    });

    var req = {};
    req.headers = {
      authorization: "Bearer "+token
    };
    var res = function() {
      this.json = function(data) {
        return data;
      }
    }
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }

    var dbSession = function(){
      return new function(){
        this.select = function(){
          return new function(){
            this.from = function(){
              return new function(){
                this.where = function(){
                  return new Promise((resolve, reject) => {
                    resolve({})
                  })
                }
              }
            }
          }
        }

        this.raw = function(){
          return new Promise((resolve, reject) => {
            resolve([[{has_permission:"false"}]])
          })
        }
      }
    }

    var securityMiddleware = new SecurityMiddleware("foo:bar");
    securityMiddleware.configuration = configuration;
    securityMiddleware.dbSession = new dbSession();
    var response = await securityMiddleware.ensureAuthorization(req, new res, null);
    expect(response.code).to.equal(403);


  });

  it('should return a valid callback on valid token, subject and permission', async function() {

    var token = jwt.sign({subject_id:"jane_doe"}, "secret", {
      expiresIn: '3600s'
    });

    var req = {};
    req.headers = {
      authorization: "Bearer "+token
    };
    var res = function() {
      this.json = function(data) {
        return data;
      }
    }
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }

    var dbSession = function(){
      return new function(){
        this.select = function(){
          return new function(){
            this.from = function(){
              return new function(){
                this.where = function(){
                  return new Promise((resolve, reject) => {
                    resolve({})
                  })
                }
              }
            }
          }
        }

        this.raw = function(){
          return new Promise((resolve, reject) => {
            resolve([[{has_permission:"true"}]])
          })
        }
      }
    }

    var securityMiddleware = new SecurityMiddleware("foo:bar");
    securityMiddleware.configuration = configuration;
    securityMiddleware.dbSession = new dbSession();
    await securityMiddleware.ensureAuthorization(req, new res, function(){});    
  });

});
