const DEFAULT_SESSION_MINUTES = 180;

class StatusData {
  constructor({username, endedAt, accessedAt, sessionMinutes}) {
    this.username       = username ?? 'Grandma';
    this.sessionMinutes = typeof sessionMinutes == 'number' ? Math.max(0, Math.round(sessionMinutes)) : DEFAULT_SESSION_MINUTES;
    this.accessedAt     = this._parseDate(accessedAt);

    if (accessedAt) {
      const accessTimestamp = this._parseDate(accessedAt);
      this.endedAt = new Date(accessTimestamp.getTime() + DEFAULT_SESSION_MINUTES * 60 * 1000);
    } else {
      this.endedAt = this._parseDate(endedAt);
    }
  }

  canAccess(username, timestamp = new Date()) {
    if (username === this.username) return true;
    return this.endedAt < timestamp;
  }

  accessFor(sessionMinutes, startedAt = new Date()) {
    sessionMinutes = typeof sessionMinutes == 'number' ? Math.max(0, Math.round(sessionMinutes)) : DEFAULT_SESSION_MINUTES;
    this.endedAt   = new Date(startedAt.getTime() + sessionMinutes * 60 * 1000);
  }

  accessNow() {
    this.accessedAt = new Date();
  }

  toObject() {
    return {
      username: this.username,
      endedAt:  this.endedAt.toISOString(),
      accessedAt: this.accessedAt?.toISOString(),
    }
  }

  _parseDate(timestamp, defaultValue = '1970-01-01') {
    const date = new Date(timestamp);
    return isNaN(date.valueOf()) ? new Date(defaultValue) : date;
  }
}

module.exports = StatusData;
