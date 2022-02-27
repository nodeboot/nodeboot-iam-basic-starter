function DatabaseHelperDataService(dbSession) {

  this.init = () => {
    return new Promise(async (resolve, reject) => {
      if(typeof dbSession === 'undefined'){
        reject(new Error("is not possible stabilish a database connection"))
        return;//TODO: why return is required to end this reject execution
      }

      var existsSubjectTable = await dbSession.schema.hasTable('iam_subject');
      var existsIamPermissionTable = await dbSession.schema.hasTable('iam_permission');
      if (existsSubjectTable === true && existsIamPermissionTable === true) {
        console.log("iam tables already exist");
        resolve(true);
      }else if (existsSubjectTable === false && existsIamPermissionTable === true) {
        console.log("iam tables are imcomplete. iam_subject table don't exist");
        resolve(false);
      }else if (existsIamPermissionTable === false && existsSubjectTable === true) {
        console.log("iam tables are imcomplete. iam_permission table don't exist");
        resolve(false);
      }else {
        console.log("iam tables don't exist. Creating...");
        dbSession.createTable('iam_subject', async (table)=>{
          table.increments('id').primary();
          table.string('identifier', 25).unique().notNullable();
          table.string('secret', 255).notNullable();
          table.string('role', 50).notNullable();
        }).then(async function(){
          dbSession.createTable('iam_permission', async (table)=>{
            table.increments('id').primary();
            table.string('role', 25).notNullable();
            table.string('resource', 50).notNullable();
            table.string('permission', 150).notNullable();
          }).then(async function(){
            var iamPermissionTable = await dbSession.schema.hasTable('iam_permission');
            var userTable = await dbSession.schema.hasTable('iam_subject');
            if(iamPermissionTable === false || userTable === false){
              reject(new Error("tables did not exist and and could not be created"));
            }
            resolve(true)
          })
        });
      }
    });
  }
}

module.exports = DatabaseHelperDataService;
