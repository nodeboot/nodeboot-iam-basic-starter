var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var sinon = require('sinon');
const request = require('supertest');
const TestHelper = require('./test/TestHelper.js')

const IamOauth2ElementaryStarter = require("../main/IamOauth2ElementaryStarter.js");

describe('IamOauth2ElementaryStarter: autoConfigure', function() {
  it('should return false if a database init returns undefined or false', async function() {
    function DatabaseHelperDataService1() {
      this.init = function() {
        return new Promise((resolve, reject) => {
          resolve(undefined)
        })
      }
    }

    function DatabaseHelperDataService2() {
      this.init = function() {
        return new Promise((resolve, reject) => {
          resolve(false)
        })
      }
    }

    function DatabaseHelperDataService3() {
      this.init = function() {
        return new Promise((resolve, reject) => {
          reject(new Error("im a jerk"))
        })
      }
    }

    var iamOauth2ElementaryStarter = new IamOauth2ElementaryStarter({}, null, null, new DatabaseHelperDataService1());
    var flag = await iamOauth2ElementaryStarter.autoConfigure()
    expect(flag).to.equal(false);

    iamOauth2ElementaryStarter = new IamOauth2ElementaryStarter({}, null, null, new DatabaseHelperDataService2());
    flag = await iamOauth2ElementaryStarter.autoConfigure()
    expect(flag).to.equal(false);

    iamOauth2ElementaryStarter = new IamOauth2ElementaryStarter({}, null, null, new DatabaseHelperDataService3());
    flag = await iamOauth2ElementaryStarter.autoConfigure()
    expect(flag).to.equal(false);
  });
  it('should return true if tables exist or were created', async function() {
    function DatabaseHelperDataService() {
      this.init = function() {
        return new Promise((resolve, reject) => {
          resolve(true)
        })
      }
    }
    function ExpressMock() {
      this.post = function() {
        return new Promise((resolve, reject) => {
          resolve(true)
        })
      }
    }

    var iamOauth2ElementaryStarter = new IamOauth2ElementaryStarter({}, null, null, new DatabaseHelperDataService(), new ExpressMock());
    var flag = await iamOauth2ElementaryStarter.autoConfigure()
    expect(flag).to.equal(true);
  });
});


describe('IamOauth2ElementaryStarter: getSecurityMiddleware', function() {
  it('should return a not null middleware', async function() {
    function DatabaseHelperDataService() {
      this.init = function() {
        return new Promise((resolve, reject) => {
          resolve(undefined)
        })
      }
    }

    function IamDataService(){
      this.hasPermissions = function(){
        return new Promise((resolve, reject) => {
          resolve([[{has_permission:"false"}]])
        })
      }
    }

    function SubjectDataService(){
      this.findSubjectByIdentifier = function(identifier){
        return new Promise((resolve, reject) => {
          resolve({role:"foo"})
        })
      }
    }

    var iamOauth2ElementaryStarter = new IamOauth2ElementaryStarter({}, new SubjectDataService(), new IamDataService(), new DatabaseHelperDataService());
    var middleware = await iamOauth2ElementaryStarter.getSecurityMiddleware()
    assert(middleware);
  });
});
