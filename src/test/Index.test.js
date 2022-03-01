var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

describe('Index', function() {
  it('requires should work', async function() {
    var starter = require("../main/Index.js")
    assert(starter, "starter loaded as library should not be null")
    assert(starter.DatabaseHelperDataService, "DatabaseHelperDataService loaded from library should not be null")
    assert(starter.SubjectDataService, "SubjectDataService loaded from library should not be null")
    assert(starter.IamDataService, "IamDataService loaded from library should not be null")
    assert(starter.IamOauth2ElementaryStarter, "IamOauth2ElementaryStarter loaded from library should not be null")
    assert(starter.SecurityMiddleware, "SecurityMiddleware loaded from library should not be null")    
  });
});
