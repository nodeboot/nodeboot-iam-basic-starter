var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
const request = require('supertest');
var Oauth2SpecRoutes = require('../../main/routes/Oauth2SpecRoutes.js');
const TestHelper = require('../test/TestHelper.js')

describe('Oauth2SpecRoutes : configure', function() {
  it('should return 400 if url encoded is not used', async function() {

    var ligthExpress = await TestHelper.createLigthExpress();

    var oauth2SpecRoutes = new Oauth2SpecRoutes(null, ligthExpress.app);
    await oauth2SpecRoutes.configure();
    const response = await request(ligthExpress.app)
      .post('/oauth2/token')
      .send('grant_type=password&username=foo&password=bar');
    expect(response.status).to.equal(500);
    ligthExpress.server.close();
  });
  it('should return 500 if error raises on the generateToken method ...', async function() {

    function Oauth2SpecService() {
      this.generateToken = function(identifier) {
        return new Promise((resolve, reject) => {
          reject(new Error("im a jerk2"))
        })
      }
    }

    var ligthExpress = await TestHelper.createLigthExpress();

    var oauth2SpecRoutes = new Oauth2SpecRoutes(new Oauth2SpecService(), ligthExpress.app);
    await oauth2SpecRoutes.configure();
    const response = await request(ligthExpress.app)
      .post('/oauth2/token')
      .set('Content-type', 'application/json')
      .send({ username: 'foo', password: 'password' });
    expect(response.status).to.equal(400);
    ligthExpress.server.close();
  });

  it('should return valid token if request is fine ...', async function() {

    function Oauth2SpecService() {
      this.generateToken = function(identifier) {
        return new Promise((resolve, reject) => {
          resolve({
            code: 200000,
            message: "success",
            content: {
              access_token: "123456789"
            }
          })
        })
      }
    }

    var ligthExpress = await TestHelper.createLigthExpress();
    var oauth2SpecRoutes = new Oauth2SpecRoutes(new Oauth2SpecService(), ligthExpress.app);
    await oauth2SpecRoutes.configure();

    const response = await request(ligthExpress.app)
      .post('/oauth2/token')
      .send('grant_type=password&username=foo&password=bar');

    expect(response.status).to.equal(200);
    var responseTextAsObject = JSON.parse(response.text);
    expect(responseTextAsObject.code).to.equal(200000);
    expect(responseTextAsObject.content.access_token).to.equal("123456789");
    ligthExpress.server.close();
  });
});
