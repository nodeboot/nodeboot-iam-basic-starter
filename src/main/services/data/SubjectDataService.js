@Service
function SubjectDataService() {

  @Autowire(name = "dbSession")
  this.dbSession;

  this.findSubjectByIdentifier = (identifier) => {
    return new Promise(async (resolve, reject) => {
      try {
        var user = await this.dbSession
          .select('*')
          .from('subject')
          .where('identifier', identifier);
        resolve(user);
      } catch (err) {
        console.log(err);
        reject(new Error("Failed to find user by name"));
      }
    });
  }
}

module.exports = SubjectDataService;
