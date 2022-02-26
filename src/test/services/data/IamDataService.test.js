const NodeInternalModulesHook = require('meta-js').NodeInternalModulesHook;
NodeInternalModulesHook._compile();
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var requireOrigin = require
const jwt = require('jsonwebtoken')

const IamDataService = require("../../../../src/main/services/data/IamDataService.js");

describe('IamDataService: hasPermissions', function() {
  it('should throw an error on db error', async function() {
    var dbSession = function(){
      return new function(){
        this.raw = function(){
          return new Promise((resolve, reject) => {
            reject(new Error("Im a jerk error"))
          })
        }
      }
    }

    var iamDataService = new IamDataService();
    iamDataService.dbSession = new dbSession();
    var ex;
    try {
      await iamDataService.hasPermissions("foo");
    } catch (e) {
      ex = e;
    }
    assert(ex, "The error should have been thrown");
  });

  it('should return true/false on success db response', async function() {

    var dbSession = function(){
      return new function(){
        this.raw = function(){
          return new Promise((resolve, reject) => {
            resolve([[{has_permission:"false"}]])
          })
        }
      }
    }

    var iamDataService = new IamDataService();
    iamDataService.dbSession = new dbSession();
    var response = await iamDataService.hasPermissions("foo");
    expect(response.has_permission).to.equal("false");

  });


});
