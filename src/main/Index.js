const ObjectHelper = require('./common/object/ObjectHelper.js');
const DatabaseHelperDataService = require('./services/data/DatabaseHelperDataService.js');
const SubjectDataService = require('./services/data/SubjectDataService.js');
const IamDataService = require('./services/data/IamDataService.js');
const SecurityMiddleware = require('./middleware/SecurityMiddleware.js');
const util = require("util")

function IamSimpleStarter() {

  this.subjectDataService;
  this.iamDataService;
  this.securityMiddleware;
  this.configuration;

  this.autoConfigure = async (dbSession, configuration) => {
    console.log("Starting iam configurations ...");
    if (typeof dbSession === 'undefined' || dbSession == null) {
      return;
    }

    var databaseHelperDataService = new DatabaseHelperDataService();
    var tablesCreation;
    try {
      tablesCreation = await databaseHelperDataService.init(dbSession);
    } catch (e) {
      console.log(e);
    }

    if(typeof tablesCreation=== 'undefined' || tablesCreation==="false"){
      console.log("Required tables don't exist. Iam simple starter will not be loaded");
      return false;
    }

    this.subjectDataService = new SubjectDataService();
    this.iamDataService = new IamDataService();
    this.securityMiddleware = new SecurityMiddleware();
    this.configuration = configuration;
    return true;

  }

  this.getSecurityMiddleware = async (permissionRawString) => {
    return new SecurityMiddleware(permissionRawString, this.configuration, this.subjectDataService, this.iamDataService);
  }
}

module.exports = IamSimpleStarter;
