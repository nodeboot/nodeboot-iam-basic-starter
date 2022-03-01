function IamDataService(dbSession) {

  this.dbSession = dbSession;

  //TODO: validate permissionRawString syntax

  this.hasPermissionSqlString = `
  select case when
  count(*) > 0
  then 'true'
  else 'false'
  end as has_permission
  from iam_permission
  where resource  = :resource
  and permission  = :permission
  and role = :role
  `

  this.hasPermissions = (role, resource, permission) => {
    var params;
    return new Promise(async (resolve, reject) => {
      try {

        params = {
          resource: resource,
          permission: permission,
          role: role
        };

        var countPermissions = await this.dbSession
          .raw(this.hasPermissionSqlString, params);
        resolve(countPermissions[0][0]);
      } catch (err) {
        console.log(err);
        reject("Failed to query permissions with these parameters: "+JSON.stringify(params));
      }
    });
  }
}

module.exports = IamDataService;
