var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

const DatabaseHelperDataService = require("../../../../src/main/services/data/DatabaseHelperDataService.js");

describe('DatabaseHelperDataService: init', function() {
  it('should throw an  error if dabatase sesion is null or undefined', async function() {
    var databaseHelperDataService = new DatabaseHelperDataService();
    var ex;
    try {
      await databaseHelperDataService.init();
    } catch (e) {
      ex = e;
    }
    assert(ex, "The error should have been thrown");
  });

  it('should return true if tables already exist', async function() {

    var schema = function() {
      return new function() {
        this.hasTable = function() {
          return new Promise((resolve, reject) => {
            resolve(true)
          })
        }
      }
    }

    var dbSession = function() {
      this.schema = new schema();
    }

    var databaseHelperDataService = new DatabaseHelperDataService(new dbSession());
    var result = await databaseHelperDataService.init();
    expect(result).to.equal(true);
  });

  it('should return false if iam_permission dont exist', async function() {

    var schema = function() {
      return new function() {
        this.hasTable = function(tableName) {
          return new Promise((resolve, reject) => {
            resolve(tableName == "iam_subject")
          })
        }
      }
    }

    var dbSession = function() {
      this.schema = new schema();
    }

    var databaseHelperDataService = new DatabaseHelperDataService(new dbSession());
    var result = await databaseHelperDataService.init();
    expect(result).to.equal(false);
  });

  it('should return false if iam_subject dont exist', async function() {

    var schema = function() {
      return new function() {
        this.hasTable = function(tableName) {
          return new Promise((resolve, reject) => {
            resolve(tableName == "iam_permission")
          })
        }
      }
    }

    var dbSession = function() {
      this.schema = new schema();
    }

    var databaseHelperDataService = new DatabaseHelperDataService(new dbSession());
    var result = await databaseHelperDataService.init();
    expect(result).to.equal(false);
  });

  it('should throw an error if tables dont exist but they were not created', async function() {

    function table() {}

    function increments() {
      return new function() {
        this.primary = function() {}
      };
    }

    function string() {
      return new function() {
        this.unique = function() {
          return new function() {
            this.notNullable = function() {}
          }
        }
        this.notNullable = function() {}
      };
    }

    table.increments = increments;
    table.string = string;

    var schema = function() {
      this.hasTable = function(tableName) {
        return new Promise((resolve, reject) => {
          resolve(false)
        })
      }
    }

    var dbSession = function() {
      this.schema = new schema();
      this.createTable = async function(tableName, callback) {
        callback(table)
      }
    }

    var databaseHelperDataService = new DatabaseHelperDataService(new dbSession());

    try {
      await databaseHelperDataService.init();
    } catch (e) {
      ex = e;
    }
    assert(ex, "The error should have been thrown");
  });

  it('should return true if tables dont exist and they were created', async function() {

    function table() {}

    function increments() {
      return new function() {
        this.primary = function() {}
      };
    }

    function string() {
      return new function() {
        this.unique = function() {
          return new function() {
            this.notNullable = function() {}
          }
        }
        this.notNullable = function() {}
      };
    }

    table.increments = increments;
    table.string = string;

    var hasTableCallsCount = 0;

    var schema = function() {
      this.hasTable = function(tableName) {
        return new Promise((resolve, reject) => {
          if (hasTableCallsCount < 2) {
            resolve(false)
          } else {
            resolve(true)
          }
          hasTableCallsCount++;
        })
      }
    }

    var dbSession = function() {
      this.schema = new schema();
      this.createTable = async function(tableName, callback) {
        callback(table)
      }
    }

    var databaseHelperDataService = new DatabaseHelperDataService(new dbSession());
    var result = await databaseHelperDataService.init();
    expect(result).to.equal(true);
  });

});
