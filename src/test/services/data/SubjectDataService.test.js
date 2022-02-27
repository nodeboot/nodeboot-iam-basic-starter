var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

const SubjectDataService = require("../../../../src/main/services/data/SubjectDataService.js");

describe('SubjectDataService: findSubjectByIdentifier', function() {
  it('should throw an error on db error', async function() {
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

    var dbSession = new dbSession();
    var subjectDataService = new SubjectDataService(dbSession);
    var ex;
    try {
      await subjectDataService.findSubjectByIdentifier("foo");
    } catch (e) {
      ex = e;
    }
    assert(ex, "The error should have been thrown");
  });

  it('should return undefined on unknown subject', async function() {

    var dbSession = function(){
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

    var dbSession = new dbSession();
    var subjectDataService = new SubjectDataService(dbSession);
    var subject = await subjectDataService.findSubjectByIdentifier("foo");
    expect(subject).to.equal(undefined);

  });


});
