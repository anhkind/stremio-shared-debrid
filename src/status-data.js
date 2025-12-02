class StatusData {
  constructor(username, accessedAt = undefined) {
    if (!username) throw new Error('username can not be empty');
    this.username   = username;
    this.accessedAt = accessedAt ? new Date(accessedAt) : new Date('1970-01-01');
  }

  refresh() {
    this.accessedAt = new Date();
  }

  canAccess(username, sessionMinutes = 180) {
    if (username === this.username) return true;
    const expiryEpoch = this.accessedAt.getTime() + sessionMinutes * 60 * 1000;
    const nowEpoch    = new Date().getTime();
    return expiryEpoch < nowEpoch;
  }

  toObject() {
    return {
      username:   this.username,
      accessedAt: this.accessedAt.toISOString(),
    }
  }
}

module.exports = StatusData;
