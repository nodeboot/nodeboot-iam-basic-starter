const escape = require('escape-html');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const ObjectHelper = require('../../common/object/ObjectHelper.js')

function Oauth2SpecService(subjectDataService, configuration) {

  this.subjectDataService = subjectDataService;
  this.configuration = configuration;

  this.generateToken = async (generateTokenRequest) => {

    if(!ObjectHelper.hasProperty(this.configuration, "nodeboot.iam_oauth2_elementary_starter.jwtSecret")){
      console.log("nodeboot.iam_oauth2_elementary_starter.jwtSecret was not found");
      return {
        code: 401501,
        message: "Internal error"
      };
    }

    if (!generateTokenRequest.grant_type) {
      let response = {
        code: 401400,
        message: "grant_type is required"
      };
      return response;
    }

    var subject_identifier, subject_secret
    if (generateTokenRequest.grant_type == "client_credentials") {
      if (typeof generateTokenRequest.client_id === 'undefined' || typeof generateTokenRequest.client_secret === 'undefined') {
        let response = {
          code: 401402,
          message: "client_id and client_secret is required"
        };
        return response;
      }
      subject_identifier = escape(generateTokenRequest.client_id)
      subject_secret = escape(generateTokenRequest.client_secret)
    } else if (generateTokenRequest.grant_type == "password") {
      if (!generateTokenRequest.username || !generateTokenRequest.password) {
        let response = {
          code: 401403,
          message: "username and password is required"
        };
        return response;
      }
      subject_identifier = escape(generateTokenRequest.username)
      subject_secret = escape(generateTokenRequest.password)
    } else{
      let response = {
        code: 401401,
        message: "unkown grant"
      };
      return response;
    }

    var subject;
    try {
      subject = await this.subjectDataService.findSubjectByIdentifier(subject_identifier);
    } catch (e) {
      console.log("database error while subject was be querying");
      console.log(e);
      let response = {
        code: 401502,
        message: "internal error"
      };
      return response;
    }

    if(subject.length == 0){
      console.log("User was not found: "+subject_identifier);
      let response = {
        code: 401000,
        message: "Unauthorized"
      };
      return response;
    }

    var isItsCredential = await bcrypt.compare(subject_secret, subject[0].secret)
    if (isItsCredential===false) {
      //TODO: add fba
      console.log("Incorrect password: "+subject_identifier);
      let response = {
        code: 401000,
        message: "unauthorized"
      };
      return response;
    }

    //TODO: validate at least one role

    var jwtExpiration = this.configuration.nodeboot.iam_oauth2_elementary_starter.jwtExpiration || "3600s";
    var access_token = generateJwtToken({subject_identifier:subject_identifier}, this.configuration.nodeboot.iam_oauth2_elementary_starter.jwtSecret, jwtExpiration);
    let response = {
      code: 200000,
      message: "success",
      content: {
        access_token: access_token,
        expires_in:jwtExpiration
      }
    };
    return response;


  }

  generateJwtToken = function(payload, secret, tokenLife) {
    return jwt.sign(payload, secret, {
      expiresIn: tokenLife
    });
  }
}

module.exports = Oauth2SpecService;
