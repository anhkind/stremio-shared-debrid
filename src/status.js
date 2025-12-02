const Gist = require('./gist');

class Status {
  constructor(authToken, gistId, fileName = 'shared-debrid.json') {
    this.gist     = new Gist(authToken, gistId);
    this.fileName = fileName;
    this.data     = undefined;
  }

  async get() {
    try {
      const json = await this.gist.getContent(this.fileName);
      if (!json) {
        this.data = {};
        return {};
      }

      try {
        this.data = JSON.parse(json);
        return this.data;
      } catch (parseError) {
        throw new Error(`Failed to parse JSON content from ${this.fileName}: ${parseError.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  async update() {
    if (!this.data) throw new Error(`No data available to update. Call get() first.`);

    try {
      const json = JSON.stringify(this.data, null, 2);
      return await this.gist.updateContent(this.fileName, json);
    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }
}

module.exports = Status;
