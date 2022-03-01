const ObjectHelper = require('./common/object/ObjectHelper.js');
const DatabaseHelperDataService = require('./services/data/DatabaseHelperDataService.js');
const SubjectDataService = require('./services/data/SubjectDataService.js');
const IamDataService = require('./services/data/IamDataService.js');
const SecurityMiddleware = require('./middleware/SecurityMiddleware.js');
const Oauth2SpecService = require('./services/logic/Oauth2SpecService.js');
const Oauth2SpecRoutes = require('./routes/Oauth2SpecRoutes.js');

function IamOauth2ElementaryStarter(configuration, subjectDataService, iamDataService, databaseHelperDataService, expressInstance) {

  this.configuration = configuration;
  this.subjectDataService = subjectDataService;
  this.iamDataService = iamDataService;
  this.databaseHelperDataService = databaseHelperDataService;
  this.expressInstance = expressInstance;
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

    var oauth2SpecService = new Oauth2SpecService(this.subjectDataService, this.configuration);
    var oauth2SpecRoutes = new Oauth2SpecRoutes(oauth2SpecService, this.expressInstance);
    await oauth2SpecRoutes.configure();

    return true;
  }

  this.getSecurityMiddleware = (permissionRawString) => {
    return new SecurityMiddleware(permissionRawString, this.configuration, this.subjectDataService, this.iamDataService);
  }
}

module.exports = IamOauth2ElementaryStarter;
