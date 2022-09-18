
function SubjectDataService(dbSession) {

  this.dbSession = dbSession;

  this.findSubjectByIdentifier = (identifier) => {
    return new Promise(async (resolve, reject) => {
      try {
        var user = await this.dbSession
          .select('*')
          .from('iam_subject')
          .where('identifier', identifier);
        resolve(user);
      } catch (err) {
        console.log(err);
        reject(new Error("Failed to find user by name"));
      }
    });
  }

  this.createSubject = (subject) => {
    return new Promise(async (resolve, reject) => {
      try {
        let id = await this.dbSession('iam_subject').insert(subject)
        resolve(id[0]);
      } catch (err) {
        console.log(err);
        reject(new Error("Sql error while iam_subject was being creating"));
      }
    });
  }
}

module.exports = SubjectDataService;
