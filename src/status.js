const Gist = require('./gist');

class Status {
  constructor(authToken, gistId, username, fileName = 'shared-debrid.json') {
    this.gist     = new Gist(authToken, gistId);
    this.fileName = fileName;
    this.data     = {
      accessedAt: new Date('1970-01-01').toISOString(),
      username:   username,
    };
  }

  async get() {
    try {
      const json = await this.gist.getContent(this.fileName);
      if (json) this.data = JSON.parse(json);
    } catch (error) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
    return this.data;
  }

  async update() {
    try {
      const json = JSON.stringify(this.data, null, 2);
      return await this.gist.updateContent(this.fileName, json);
    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }
}

module.exports = Status;
