
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
  and action  = :action
  and role = :role
  `

  this.hasPermissions = (role, resource, action) => {
    var params;
    return new Promise(async (resolve, reject) => {
      try {

        params = {
          resource: resource,
          action: action,
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

  this.findSubjectPermissionByRole = async(role) => {

      if (typeof role == "undefined") {
          throw new Error("role is required");
      }

      try {

          return await this.dbSession('iam_subject')
              .join('iam_permission', 'iam_subject.role', 'iam_permission.role')
              .where('iam_subject.role', role)
              .select('iam_permission.*');
      } catch (e) {
          throw new DatabaseError("Failed while devops variables were being searched by repositoryName", e);
      }
  }  

  this.findAllRoles = () => {
    return new Promise(async (resolve, reject) => {
      try {
        var roles = await this.dbSession
          .distinct()
          .from('iam_permission')
          .pluck('role');
        resolve(roles);
      } catch (err) {
        console.log(err);
        reject(new Error("Failed to find all roles"));
      }
    });
  }

  this.findAllResouces = () => {
    return new Promise(async (resolve, reject) => {
      try {
        var items = await this.dbSession
          .distinct()
          .from('iam_permission')
          .pluck('resource');
        resolve(items);
      } catch (err) {
        console.log(err);
        reject(new Error("Failed to find all resources"));
      }
    });
  }

  this.findAllActions = () => {
    return new Promise(async (resolve, reject) => {
      try {
        var items = await this.dbSession
          .distinct()
          .from('iam_permission')
          .pluck('action');
        resolve(items);
      } catch (err) {
        console.log(err);
        reject(new Error("Failed to find all actions"));
      }
    });
  }    

  this.findPermissionByRole = (role) => {
    return new Promise(async (resolve, reject) => {
      try {
        var permission = await this.dbSession
          .select('*')
          .from('iam_permission')
          .where('role', role);
        resolve(permission);
      } catch (err) {
        console.log(err);
        reject(new Error("Failed to find permission by role"));
      }
    });
  }

  this.findPermissionByRoleResourcePermission = (role, resource, action) => {
      return new Promise(async (resolve, reject) => {
        try {
          var permission = await this.dbSession
            .select('*')
            .from('iam_permission')
            .where((builder) => {
                builder.where('role', role);
                builder.where('resource', resource);
                builder.where('action', action);
            })
            .first()
          resolve(permission);
        } catch (err) {
          console.log(err);
          reject(new Error("Failed to find permission by role"));
        }
      });
    }  

  this.createPermission = (permission) => {
    return new Promise(async (resolve, reject) => {
      try {
        let id = await this.dbSession('iam_permission').insert(permission)
        resolve(id[0]);
      } catch (err) {
        console.log(err);
        reject(new Error("Sql error while iam_permission was being creating"));
      }
    });
  }

}

module.exports = IamDataService;
