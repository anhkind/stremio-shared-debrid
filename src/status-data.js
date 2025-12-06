const DEFAULT_SESSION_MINUTES = 180;

class StatusData {
  constructor(username = 'Grandma', accessedAt = undefined, sessionMinutes = undefined) {
    this.username       = username;
    this.accessedAt     = accessedAt instanceof Date ? accessedAt : new Date(accessedAt ?? '1970-01-01');
    this.sessionMinutes = typeof sessionMinutes == 'number' ? Math.max(0, Math.round(sessionMinutes)) : DEFAULT_SESSION_MINUTES;
  }

  canAccess(username) {
    if (username === this.username) return true;
    const expiryEpoch = this.accessedAt.getTime() + this.sessionMinutes * 60 * 1000;
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
