const https = require('https');

class Gist {
  constructor(token, id) {
    this.token = token;
    this.id    = id;
  }

  async request(method, path, body = null) {
    const data = body ? JSON.stringify(body) : null;

    const options = {
      method,
      headers: {
        'Authorization':        `Bearer ${this.token}`,
        'Accept':               'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data && {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        })
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(`https://api.github.com${path}`, options, (res) => {
        let responseData = '';

        res.on('data', chunk => responseData += chunk);

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch (error) {
              reject(new Error(`Error parsing JSON response: ${error.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', reject);

      if (data) req.write(data);
      req.end();
    });
  }

  async get() {
    return this.request('GET', `/gists/${this.id}`);
  }

  async update(files, description) {
    const body = { files: {} };

    if (description !== undefined) body.description = description;

    for (const [filename, content] of Object.entries(files)) {
      body.files[filename] = typeof content === 'string'
        ? { content }
        : { content: content?.content || String(content) };
    }

    return this.request('PATCH', `/gists/${this.id}`, body);
  }
}

module.exports = Gist;
