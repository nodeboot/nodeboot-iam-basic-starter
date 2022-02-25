const jwt = require('jsonwebtoken')
const ObjectHelper = require('../common/object/ObjectHelper.js')

@Service
function SecurityMiddleware(permissionRawString){

  //TODO: validate permissionRawString syntax

  this.hasPermissionSqlString = `
  select case when
  count(*) > 0
  then 'true'
  else 'false'
  end as has_permission
  from iam
  where resource  = :resource
  and permission  = :permission
  and role = :role
  `

  @Autowire(name = "dbSession")
  this.dbSession;

  @Autowire(name = "configuration")
  this.configuration;

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
      subject = await this.findSubjectByIdentifier(payload.subject_id);
    }catch(err){
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

    //https://stackoverflow.com/questions/19460481/get-route-definition-in-middleware
    //https://stackoverflow.com/a/28086959/3957754
    var permissionScope = permissionRawString.split(":");
    var validator = await this.hasPermissions(subject.role, permissionScope[0].trim(), permissionScope[0].trim());
    if(validator.has_permission === "false"){
      return res.json({
        code: 403,
        message: "You are not allowed"
      });
    }
    return next();
  }

  this.hasPermissions = (role, resource, permission) => {
    return new Promise(async (resolve, reject) => {
      try {

        var params = {
          resource: resource,
          permission: permission,
          role: role
        };

        var countPermissions = await this.dbSession
          .raw(this.hasPermissionSqlString, params);
        resolve(countPermissions[0][0]);
      } catch (err) {
        console.log(err);
        reject("Failed to find next image");
      }
    });
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
}

module.exports = SecurityMiddleware;
