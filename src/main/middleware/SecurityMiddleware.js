const jwt = require('jsonwebtoken')
const ObjectHelper = require('../common/object/ObjectHelper.js')

function SecurityMiddleware(permissionRawString, configuration, subjectDataService, iamDataService){

  this.subjectDataService = subjectDataService;

  this.iamDataService = iamDataService;

  this.configuration = configuration;

  this.permissionsByRouteStrings;

  this.ensureAuthorization = async (req, res, next) => {

    if(!ObjectHelper.hasProperty(this.configuration, "nodeboot.iam_simple.jwtSecret")){
      return res.json({
        code: 500,
        message: "Internal error"
      });
    }

    const authHeader = req.headers['authorization']
    if (authHeader == null){
      return res.json({
        code: 401,
        message: "Missing token"
      });
    }
    //one space : https://datatracker.ietf.org/doc/html/rfc6750#section-2.1
    const tokenInfo = authHeader.split(/\s{1}/)

    if (tokenInfo.length!=2){
      return res.json({
        code: 401,
        message: "Token should be Bearer"
      });
    }

    if (tokenInfo[0]!="Bearer"){
      return res.json({
        code: 401,
        message: "Token should be Bearer"
      });
    }

    if (tokenInfo[1].length<5){
      return res.json({
        code: 401,
        message: "Token is wrong"
      });
    }
    var token = tokenInfo[1]
    var payload;
    try {
      payload = await jwt.verify(token, this.configuration.nodeboot.iam_simple.jwtSecret);
    } catch (e) {
      console.log(e);
      return res.json({
        code: 401,
        message: "Invalid token"
      });
    }

    //TODO: validate payload.subject_id
    var subject;
    try{
      subject = await this.subjectDataService.findSubjectByIdentifier(payload.subject_id);
    }catch(e){
      console.log(e);
      return res.json({
        code: 403,
        message: "You are not allowed"
      });
    }

    if(typeof subject ==='undefined'){
      return res.json({
        code: 403,
        message: "You are not allowed"
      });
    }

    var permissionScope = permissionRawString.split(":");
    var validator = await this.iamDataService.hasPermissions(subject.role, permissionScope[0].trim(), permissionScope[1].trim());
    if(validator.has_permission === "false"){
      return res.json({
        code: 403,
        message: "You are not allowed"
      });
    }
    return next();
  }
}

module.exports = SecurityMiddleware;
