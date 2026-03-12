class ExponeaProject {
  constructor(projectToken = '', authorizationToken = '', baseUrl = undefined) {
    this.projectToken = projectToken;
    this.authorizationToken = authorizationToken;
    this.baseUrl = baseUrl;
  }
}

module.exports = {
  __esModule: true,
  default: ExponeaProject,
};
