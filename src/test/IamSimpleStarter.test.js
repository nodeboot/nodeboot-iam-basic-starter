var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var sinon = require('sinon');
const request = require('supertest');
const TestHelper = require('./test/TestHelper.js')

const IamSimpleStarter = require("../main/IamSimpleStarter.js");

describe('IamSimpleStarter: autoConfigure', function() {
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

    var iamSimpleStarter = new IamSimpleStarter({}, null, null, new DatabaseHelperDataService1());
    var flag = await iamSimpleStarter.autoConfigure()
    expect(flag).to.equal(false);

    iamSimpleStarter = new IamSimpleStarter({}, null, null, new DatabaseHelperDataService2());
    flag = await iamSimpleStarter.autoConfigure()
    expect(flag).to.equal(false);

    iamSimpleStarter = new IamSimpleStarter({}, null, null, new DatabaseHelperDataService3());
    flag = await iamSimpleStarter.autoConfigure()
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

    var iamSimpleStarter = new IamSimpleStarter({}, null, null, new DatabaseHelperDataService());
    var flag = await iamSimpleStarter.autoConfigure()
    expect(flag).to.equal(true);
  });
});


describe('IamSimpleStarter: getSecurityMiddleware', function() {
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

    var iamSimpleStarter = new IamSimpleStarter({}, new SubjectDataService(), new IamDataService(), new DatabaseHelperDataService());
    var middleware = await iamSimpleStarter.getSecurityMiddleware()
    assert(middleware);
  });
});
