const escape = require('escape-html');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

function Oauth2SpecRoutes() {

  this.token = async (req, res) => {

    if (!req.body.grant_type) {
      let response = {
        code: 400,
        message: "grant_type is required"
      };
      return res.json(response);
    }

    var subject_id, subject_credential
    if (req.body.grant_type == "client_credentials") {
      if (!req.body.client_id || !req.body.client_secret) {
        let response = {
          code: 400,
          message: "client_id and client_secret is required"
        };
        return res.json(response);
      }
      subject_id = escape(req.body.client_id)
      subject_credential = escape(req.body.client_secret)
    }

    var subject = await this.findSubjectByIdentifier(subject_id);
    var isItsCredential = await bcrypt.compare(safeReceivedPassword, subject[0].credential)
    if (isItsCredential===true) {
      let response = {
        code: 200,
        message: "success",
        content: {
          access_token: generateJwtToken(payload, process.env.TOKEN_SECRET, "3600s"),
          role: user[0].role
        }
      };
      return res.json(response);
    } else {
      let response = {
        code: 401,
        message: "incorrect credentials"
      };
      return res.json(response);
    }
  }

  this.findSubjectByIdentifier = (identifier) => {
    return new Promise(async (resolve, reject) => {
      try {
        var user = await this.dbSession
          .select('*')
          .from('subject')
          .where('identifier', identifier);
        resolve(user);
      } catch (err) {
        console.log(err);
        reject("Failed to find user by name");
      }
    });
  }

  generateJwtToken = function(payload, secret, tokenLife) {
    if (tokenLife) {
      return jwt.sign(payload, secret, {
        expiresIn: tokenLife
      });
    } else {
      return jwt.sign(subject, secret)
    }
  }
}

module.exports = Oauth2SpecRoutes;
