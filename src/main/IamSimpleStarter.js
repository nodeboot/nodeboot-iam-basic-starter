const ObjectHelper = require('./common/object/ObjectHelper.js');
const DatabaseHelperDataService = require('./services/data/DatabaseHelperDataService.js');
const SubjectDataService = require('./services/data/SubjectDataService.js');
const IamDataService = require('./services/data/IamDataService.js');
const SecurityMiddleware = require('./middleware/SecurityMiddleware.js');

function IamSimpleStarter(configuration, subjectDataService, iamDataService, databaseHelperDataService) {

  this.configuration = configuration;
  this.subjectDataService = subjectDataService;
  this.iamDataService = iamDataService;
  this.databaseHelperDataService = databaseHelperDataService;
  this.securityMiddleware;

  this.autoConfigure = async () => {
    console.log("Starting iam configurations ...");

    var tablesCreation;
    try {
      tablesCreation = await this.databaseHelperDataService.init();
    } catch (e) {
      console.log(e);
      console.log("Required tables don't exist due to a database error. Iam simple starter will not be loaded");
      return false;
    }

    if(typeof tablesCreation=== 'undefined' || tablesCreation===false){
      console.log("Required tables don't exist. Iam simple starter will not be loaded");
      return false;
    }
    return true;
  }

  this.getSecurityMiddleware = async (permissionRawString) => {
    return new SecurityMiddleware(permissionRawString, this.configuration, this.subjectDataService, this.iamDataService);
  }
}

module.exports = IamSimpleStarter;
