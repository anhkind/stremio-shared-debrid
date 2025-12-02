const Gist = require('./gist');

class Status {
  constructor(authToken, gistId, fileName = 'shared-debrid.json') {
    this.gist     = new Gist(authToken, gistId);
    this.fileName = fileName;
  }

  async get() {
    try {
      const json = await this.gist.getContent(this.fileName);
      if (!json) return {};

      try {
        return JSON.parse(json);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON content from ${this.fileName}: ${parseError.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  async update(data) {
    if (typeof data !== 'object') throw new Error(`Gist data should be an object`);

    try {
      const json = JSON.stringify(data, null, 2);
      return await this.gist.updateContent(this.fileName, json);
    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }
}

module.exports = Status;
