var sinon = require('sinon');
var chai = require('chai');
const bcrypt = require('bcrypt');
var expect = chai.expect;
var assert = chai.assert;

const Oauth2SpecService = require("../../../../src/main/services/logic/Oauth2SpecService.js");

describe('Oauth2SpecService: generateToken', function() {
  it('should return 500 on missing secret', async function() {
    var oauth2SpecService = new Oauth2SpecService(null, {});
    var response = await oauth2SpecService.generateToken({});
    assert(response);
    expect(response.code).to.equal(500);
  });
  it('should return 400 on missing or unknown grant_type', async function() {
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }
    var oauth2SpecService = new Oauth2SpecService(null, configuration);
    var response = await oauth2SpecService.generateToken({});
    assert(response);
    expect(response.code).to.equal(400);
    var response2 = await oauth2SpecService.generateToken({grant_type:"foo"});
    assert(response2);
    expect(response2.code).to.equal(400);
  });
  it('should return 400 on missing client_id/client_secret for grant_type:client_credentials', async function() {
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }
    var oauth2SpecService = new Oauth2SpecService(null, configuration);
    var response1 = await oauth2SpecService.generateToken({grant_type:"client_credentials", client_id:"foo"});
    assert(response1);
    expect(response1.code).to.equal(400);
    var response2 = await oauth2SpecService.generateToken({grant_type:"client_credentials", client_secret:"foo"});
    assert(response2);
    expect(response2.code).to.equal(400);
  });
  it('should return 400 on missing username/password for grant_type:password', async function() {
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }
    var oauth2SpecService = new Oauth2SpecService(null, configuration);
    var response1 = await oauth2SpecService.generateToken({grant_type:"password", username:"foo"});
    assert(response1);
    expect(response1.code).to.equal(400);
    var response2 = await oauth2SpecService.generateToken({grant_type:"password", password:"foo"});
    assert(response2);
    expect(response2.code).to.equal(400);
  });
  it('should return 500 on db error while subject is querying', async function() {
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }

    function subjectDataService(){
      this.findSubjectByIdentifier = function(identifier){
        return new Promise((resolve, reject) => {
          reject(new Error("im a jerk"))
        })
      }
    }

    var oauth2SpecService = new Oauth2SpecService(new subjectDataService(), configuration);
    var response1 = await oauth2SpecService.generateToken({grant_type:"password", username:"foo", password:"bar"});
    assert(response1);
    expect(response1.code).to.equal(500);
  });
  it('should return 401 if user was not found', async function() {
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }

    function subjectDataService(){
      this.findSubjectByIdentifier = function(identifier){
        return new Promise((resolve, reject) => {
          resolve([])
        })
      }
    }

    var oauth2SpecService = new Oauth2SpecService(new subjectDataService(), configuration);
    var response1 = await oauth2SpecService.generateToken({grant_type:"password", username:"foo", password:"bar"});
    assert(response1);
    expect(response1.code).to.equal(401);
  });
  it('should return 401 on bad password', async function() {
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret"
        }
      }
    }

    function subjectDataService(){
      this.findSubjectByIdentifier = function(identifier){
        return new Promise((resolve, reject) => {
          resolve([{role:"foo", secret:"bar"}])
        })
      }
    }

    var myStub = sinon.stub(bcrypt, 'compare').callsFake(() => Promise.resolve(false))

    var oauth2SpecService = new Oauth2SpecService(new subjectDataService(), configuration);
    var response1 = await oauth2SpecService.generateToken({grant_type:"password", username:"foo", password:"bar"});
    assert(response1);
    expect(response1.code).to.equal(401);
    myStub.restore()
  });
  it('should return 200 and valid access_token, on valid subject, secret, jwt_secret', async function() {
    var configuration = {
      nodeboot:{
        iam_simple:{
          jwtSecret:"secret",
          jwtExpiration:"1800s"
        }
      }
    }

    function subjectDataService(){
      this.findSubjectByIdentifier = function(identifier){
        return new Promise((resolve, reject) => {
          resolve([{role:"foo", secret:"bar"}])
        })
      }
    }

    var myStub = sinon.stub(bcrypt, 'compare').callsFake(() => Promise.resolve(true))

    var oauth2SpecService = new Oauth2SpecService(new subjectDataService(), configuration);
    var response1 = await oauth2SpecService.generateToken({grant_type:"password", username:"foo", password:"bar"});
    assert(response1);
    expect(response1.code).to.equal(200);
    assert(response1.content);
    assert(response1.content.access_token);
    expect(response1.content.access_token.length>25).to.equal(true);
    myStub.restore()
  });

});
