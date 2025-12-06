const Gist = require('./gist');
const StatusData = require("./status-data");

class Status {
  constructor(authToken, gistId, fileName = 'shared-debrid.json') {
    this.gist     = new Gist(authToken, gistId);
    this.fileName = fileName;
    this.data     = new StatusData({});
  }

  async get() {
    try {
      const json = await this.gist.getContent(this.fileName);
      const accessData = json ? JSON.parse(json) : undefined;
      if (accessData) this.data = new StatusData(accessData);
    } catch (error) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
    return this.data;
  }

  async update(username = undefined, sessionMinutes = undefined) {
    if (username) this.data.username = username;
    this.data.accessFor(sessionMinutes);
    try {
      const json = JSON.stringify(this.data, null, 2);
      return await this.gist.updateContent(this.fileName, json);
    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }
}

module.exports = Status;
