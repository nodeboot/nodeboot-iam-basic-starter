const jwt = require('jsonwebtoken')
const ObjectHelper = require('../common/object/ObjectHelper.js')

function SecurityMiddleware(permissionRawString, configuration, subjectDataService, iamDataService){

  this.subjectDataService = subjectDataService;

  this.iamDataService = iamDataService;

  this.configuration = configuration;

  this.permissionsByRouteStrings;

  this.ensureAuthorization = async (req, res, next) => {

    if(!ObjectHelper.hasProperty(this.configuration, "nodeboot.iam_oauth2_elementary_starter.jwtSecret")){
      console.log("nodeboot.iam_oauth2_elementary_starter.jwtSecret was not found");
      res.status(500);
      return res.json({
        code: 500002,
        message: "Internal error"
      });
    }

    const authHeader = req.headers['authorization']
    if (authHeader == null){
      res.status(401);
      return res.json({
        code: 401001,
        message: "Missing token"
      });
    }
    //one space : https://datatracker.ietf.org/doc/html/rfc6750#section-2.1
    const tokenInfo = authHeader.split(/\s{1}/)

    if (tokenInfo.length!=2){
      res.status(401);
      return res.json({
        code: 401002,
        message: "Token should be Bearer. Spec https://datatracker.ietf.org/doc/html/rfc6750#section-2.1"
      });
    }

    if (tokenInfo[0]!="Bearer"){
      res.status(401);
      return res.json({
        code: 401003,
        message: "Token should be Bearer"
      });
    }

    if (tokenInfo[1].length<5){
      res.status(401);
      return res.json({
        code: 401004,
        message: "Token is wrong"
      });
    }
    var token = tokenInfo[1]
    var payload;
    try {
      payload = await jwt.verify(token, this.configuration.nodeboot.iam_oauth2_elementary_starter.jwtSecret);
    } catch (e) {
      console.log(e);
      res.status(401);
      return res.json({
        code: 401005,
        message: "Invalid token"
      });
    }

    //TODO: validate payload.subject_identifier
    var subject;
    try{
      subject = await this.subjectDataService.findSubjectByIdentifier(payload.subject_identifier);
    }catch(e){
      console.log(e);
      res.status(403);
      return res.json({
        code: 403001,
        message: "You are not allowed"
      });
    }

    if(typeof subject ==='undefined'){
      res.status(403);
      return res.json({
        code: 403002,
        message: "You are not allowed"
      });
    }

    //validation for long live token
    //at this point, the token has a valid signature
    var lltu = payload.lltu;
    if(typeof lltu !== "undefined" && lltu != ""){
      //if token has a lltu is because was generated as long live token
      //no body can send a token with fake lltu (cornerstone of jwt)

      //get longLiveTokenUuid from database
      var longLiveTokenUuid = subject[0].longLiveTokenUuid;
      if(lltu != longLiveTokenUuid){
        return res.json({
          code: 403004,
          message: "You are not allowed"
        });
      }
    }

    var permissionScope = permissionRawString.split(":");
    var resource = `${permissionScope[0].trim()}:${permissionScope[1].trim()}`;
    var validator = await this.iamDataService.hasPermissions(subject[0].role, resource, permissionScope[2].trim());

    if(validator.has_permission === "false"){
      res.status(403);
      return res.json({
        code: 403003,
        message: "You are not allowed"
      });
    }

    req.app.locals.secure_context = {
      subject_identifier: payload.subject_identifier,
      subject_id: subject[0].id
    }
    return next();
  }
}

module.exports = SecurityMiddleware;
