@Service
function DatabaseHelperDataService() {

  @Autowire(name = "dbSession")
  this.dbSession;

  this.init = () => {
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
}

module.exports = DatabaseHelperDataService;
