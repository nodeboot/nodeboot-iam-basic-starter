const escape = require('escape-html');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const ObjectHelper = require('../../common/object/ObjectHelper.js')

function Oauth2SpecService(subjectDataService, configuration) {

  this.subjectDataService = subjectDataService;
  this.configuration = configuration;

  this.generateToken = async (generateTokenRequest) => {

    if(!ObjectHelper.hasProperty(this.configuration, "nodeboot.iam_simple.jwtSecret")){
      console.log("nodeboot.iam_simple.jwtSecret was not found");
      return {
        code: 500,
        message: "Internal error"
      };
    }

    if (!generateTokenRequest.grant_type) {
      let response = {
        code: 400,
        message: "grant_type is required"
      };
      return response;
    }

    var subject_id, subject_secret
    if (generateTokenRequest.grant_type == "client_credentials") {
      if (typeof generateTokenRequest.client_id === 'undefined' || typeof generateTokenRequest.client_secret === 'undefined') {
        let response = {
          code: 400,
          message: "client_id and client_secret is required"
        };
        return response;
      }
      subject_id = escape(generateTokenRequest.client_id)
      subject_secret = escape(generateTokenRequest.client_secret)
    } else if (generateTokenRequest.grant_type == "password") {
      if (!generateTokenRequest.username || !generateTokenRequest.password) {
        let response = {
          code: 400,
          message: "username and password is required"
        };
        return response;
      }
      subject_id = escape(generateTokenRequest.username)
      subject_secret = escape(generateTokenRequest.password)
    } else{
      let response = {
        code: 400,
        message: "unkown grant"
      };
      return response;
    }

    var subject;
    try {
      subject = await this.subjectDataService.findSubjectByIdentifier(subject_id);
    } catch (e) {
      console.log("database error while subject was be querying");
      console.log(e);
      let response = {
        code: 500,
        message: "internal error"
      };
      return response;
    }

    if(subject.length == 0){
      console.log("User was not found: "+subject_id);
      let response = {
        code: 401,
        message: "Unauthorized"
      };
      return response;
    }

    var isItsCredential = await bcrypt.compare(subject_secret, subject[0].secret)
    if (isItsCredential===false) {
      //TODO: add fba
      console.log("Incorrect password: "+subject_id);
      let response = {
        code: 401,
        message: "unauthorized"
      };
      return response;
    }

    //TODO: validate at least one role

    var jwtExpiration = this.configuration.nodeboot.iam_simple.jwtExpiration || "3600s";
    var access_token = generateJwtToken({subject_id:subject_id}, this.configuration.nodeboot.iam_simple.jwtSecret, jwtExpiration);
    let response = {
      code: 200,
      message: "success",
      content: {
        access_token: access_token,
        expires_in:jwtExpiration
      }
    };
    return response;


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

module.exports = Oauth2SpecService;
