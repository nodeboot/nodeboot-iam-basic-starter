var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
const ObjectHelper = require('../../../main/common/object/ObjectHelper.js');

describe('ObjectHelper : hasProperty', function() {
  it('should return undefined on missing inner property', function() {
    var value = ObjectHelper.hasProperty({}, "foo.bar");
    expect(value).to.equal(false);
  });
  it('should return value on found inner property', function() {
    var value = ObjectHelper.hasProperty({foo:{bar:"baz"}}, "foo.bar");
    expect(value).to.equal(true);
  });
});
