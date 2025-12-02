class StatusData {
  constructor(username, accessedAt = undefined) {
    if (!username) throw new Error('username can not be empty');
    this.username   = username;
    this.accessedAt = new Date(accessedAt ?? '1970-01-01');
  }

  refresh() {
    this.accessedAt = new Date();
  }

  toObject() {
    return {
      username:   this.username,
      accessedAt: this.accessedAt.toISOString(),
    }
  }
}

module.exports = StatusData;
