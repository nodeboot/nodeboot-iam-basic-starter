const ObjectHelper = require('./common/object/ObjectHelper.js');
const DatabaseHelperDataService = require('./services/data/DatabaseHelperDataService.js');
const SubjectDataService = require('./services/data/SubjectDataService.js');
const IamDataService = require('./services/data/IamDataService.js');
const SecurityMiddleware = require('./middleware/SecurityMiddleware.js');

function IamOauth2ElementaryStarter(configuration, subjectDataService, iamDataService, databaseHelperDataService) {

  this.configuration = configuration;
  this.subjectDataService = subjectDataService;
  this.iamDataService = iamDataService;
  this.databaseHelperDataService = databaseHelperDataService;
  this.securityMiddleware;

  this.autoConfigure = async () => {
    console.log("Starting Iam oauth2 elementary starter configurations ...");

    var tablesCreation;
    try {
      tablesCreation = await this.databaseHelperDataService.init();
    } catch (e) {
      console.log(e);
      console.log("Required tables don't exist due to a database error. Iam oauth2 elementary starter will not be loaded");
      return false;
    }

    if(typeof tablesCreation=== 'undefined' || tablesCreation===false){
      console.log("Required tables don't exist. Iam oauth2 elementary starter will not be loaded");
      return false;
    }
    return true;
  }

  this.getSecurityMiddleware = (permissionRawString) => {
    return new SecurityMiddleware(permissionRawString, this.configuration, this.subjectDataService, this.iamDataService);
  }
}

module.exports = IamOauth2ElementaryStarter;
