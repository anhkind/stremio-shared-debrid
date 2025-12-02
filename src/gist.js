const { Octokit } = require('@octokit/core');

class Gist {
  constructor(token, id) {
    this.id = id;
    this.octokit = new Octokit({
      auth: token
    });
  }

  async request(route, data = {}) {
    try {
      const response = await this.octokit.request(
        route,
        {
          gist_id: this.id,
          headers: { 'X-GitHub-Api-Version': '2022-11-28' },
          ...data,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to request: ${error.message}`);
    }
  }

  async get() {
    return this.request('GET /gists/{gist_id}');
  }

  async getContent(fileName) {
    const gist = await this.get();
    return gist.files && gist.files[fileName] ? gist.files[fileName].content : '';
  }

  async update(files, description) {
    const data = {
      files: {}
    };

    if (description !== undefined) {
      data.description = description;
    }

    for (const [filename, content] of Object.entries(files)) {
      data.files[filename] = typeof content === 'string'
        ? { content }
        : { content: content?.content || String(content) };
    }

    return this.request('PATCH /gists/{gist_id}', data);
  }
}

module.exports = Gist;
