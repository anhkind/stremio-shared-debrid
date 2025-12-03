class StatusData {
  constructor(username = 'Grandma', accessedAt = undefined) {
    this.username   = username;
    this.accessedAt = accessedAt instanceof Date ? accessedAt : new Date(accessedAt ?? '1970-01-01');
  }

  canAccess(username, sessionMinutes = 180) {
    if (username === this.username) return true;
    const expiryEpoch = this.accessedAt.getTime() + sessionMinutes * 60 * 1000;
    const nowEpoch    = new Date().getTime();
    return expiryEpoch < nowEpoch;
  }

  accessNow() {
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
