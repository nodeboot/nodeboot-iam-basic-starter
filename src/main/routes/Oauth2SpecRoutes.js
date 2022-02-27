const escape = require('escape-html');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const SubjectDataService = require('../services/data/SubjectDataService.js');

function Oauth2SpecRoutes(subjectDataService, configuration, expressInstance) {

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

    var subject = await this.subjectDataService.findSubjectByIdentifier(subject_id);
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
}

module.exports = Oauth2SpecRoutes;
