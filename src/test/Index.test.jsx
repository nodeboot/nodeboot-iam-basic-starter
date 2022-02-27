var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;


const IamSimpleStarter = require("../main/Index.js");

describe('IamSimpleStarter: autoConfigure', function() {
  it('should return null if dabatase sesion is null or undefined', async function() {
    var iamSimpleStarter = new IamSimpleStarter();
    var iamMiddleware = await iamSimpleStarter.autoConfigure();
    expect(undefined).to.equal(iamMiddleware);
    iamMiddleware = await iamSimpleStarter.autoConfigure(null);
    expect(undefined).to.equal(iamMiddleware);
  });

  it('should create tables on valid session and non-existing tables', async function() {
    function knexMock(){
    }

    async function hasTable(table){
      Promise.resolve(false)
    }

    function table(){
    }

    function increments(){
      return new function(){
          this.primary = function(){}
      };
    }

    function string(){
      return new function(){
          this.unique = function(){
            return new function(){
              this.notNullable = function(){}
            }
          }
          this.notNullable = function(){}
      };
    }

    table.increments = increments;
    table.string = string;

    async function createTable(tableName, callback){
      callback(table)
    }

    knexMock.schema = function(){}

    knexMock.schema.hasTable = hasTable;
    knexMock.createTable = createTable;
    var iamSimpleStarter = new IamSimpleStarter();
    var iamMiddleware = await iamSimpleStarter.autoConfigure(knexMock);
    console.log(iamMiddleware);
  });


});
