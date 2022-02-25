const ObjectHelper = require('./common/object/ObjectHelper.js');
const util = require("util")

function IamSimpleStarter() {

  this.autoConfigure = async (dbSession) => {
    console.log("Starting iam configurations ...");
    if (typeof dbSession === 'undefined' || dbSession == null) {
      return;
    }

    return new Promise(async (resolve, reject) => {
      var existsUserTable = await dbSession.schema.hasTable('user');
      var existsIamTable = await dbSession.schema.hasTable('iam');
      if ((existsUserTable === true) || (existsIamTable === true)) {
        console.log("iam tables already exist");
      } else {
        console.log("iam tables don't exist. Creating...");
        dbSession.createTable('user', async (table)=>{
          table.increments('id').primary();
          table.string('username', 25).unique().notNullable();
          table.string('password', 255).notNullable();
          table.string('role', 50).notNullable();
        }).then(async function(){
          dbSession.createTable('iam', async (table)=>{
            table.increments('id').primary();
            table.string('role', 25).notNullable();
            table.string('resource', 50).notNullable();
            table.string('permission', 150).notNullable();
          }).then(async function(){
            var iamTable = await dbSession.schema.hasTable('iam');
            var userTable = await dbSession.schema.hasTable('user');
            if(iamTable === false || userTable === false){
              reject("iam or user tables were not created");
            }
            resolve()
          })
        });
      }
    });
  }
}

module.exports = IamSimpleStarter;
