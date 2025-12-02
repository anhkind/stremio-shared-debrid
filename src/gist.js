const https = require('https');
const { URL } = require('url');

class Gist {
  constructor(token, id) {
    this.token = token;
    this.id = id;
    this.baseUrl = 'https://api.github.com';
  }

  async request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;

      const options = {
        method: method,
        headers: {
          'Authorization': `token ${this.token}`,
          'User-Agent': 'Node.js Gist Client',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      let data = null;
      if (body) {
        data = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(data);
      }

      const req = https.request(url, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonData = JSON.parse(responseData);
              resolve(jsonData);
            } catch (error) {
              reject(new Error(`Error parsing JSON response: ${error.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(data);
      }
      req.end();
    });
  }

  async get() {
    return await this.request('GET', `/gists/${this.id}`);
  }

  async update(files, description) {
    const body = {
      files: {}
    };

    if (description !== undefined) {
      body.description = description;
    }

    for (const [filename, content] of Object.entries(files)) {
      if (typeof content === 'string') {
        body.files[filename] = { content };
      } else if (content && content.content) {
        body.files[filename] = { content: content.content };
      } else {
        body.files[filename] = { content: String(content) };
      }
    }

    return await this.request('PATCH', `/gists/${this.id}`, body);
  }
}

module.exports = Gist;