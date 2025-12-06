const DEFAULT_TIMESTAMP       = '1970-01-01';
const DEFAULT_SESSION_MINUTES = 180;

class StatusData {
  constructor({username, endedAt, accessedAt}) {
    this.username = username ?? 'Grandma';

    // still checking `accessedAt` for backward compatible
    if (accessedAt) {
      this.endedAt = new Date(this._parseDate(accessedAt).getTime() + DEFAULT_SESSION_MINUTES * 60 * 1000);
    } else {
      this.endedAt = this._parseDate(endedAt);
    }
  }

  canAccess(username, timestamp = new Date()) {
    if (username === this.username) return true;
    return this.endedAt < timestamp;
  }

  accessFor(sessionMinutes, startedAt = new Date()) {
    sessionMinutes = this._parseNumeric(sessionMinutes);
    this.endedAt   = new Date(startedAt.getTime() + sessionMinutes * 60 * 1000);
  }

  toObject() {
    return {
      username: this.username,
      endedAt:  this.endedAt.toISOString(),
    }
  }

  _parseDate(value, defaultValue = DEFAULT_TIMESTAMP) {
    const date = new Date(value);
    return isNaN(date.valueOf()) ? new Date(defaultValue) : date;
  }

  _parseNumeric(value, defaultValue = DEFAULT_SESSION_MINUTES) {
    if (typeof value === 'number') return Math.max(0, value);
    if (typeof value === 'string') {
      value = value.trim();
      if (value && !isNaN(Number(value))) return Number(value);
    }
    return defaultValue;
  }
}

module.exports = StatusData;
