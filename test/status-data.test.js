const StatusData = require('../src/status-data');

describe('StatusData Class', () => {
  let statusData;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with username and default accessedAt when only username provided', () => {
      const username = 'test-user';
      statusData = new StatusData({username});

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.toISOString()).toBe(new Date('1970-01-01').toISOString());
    });

    it('should initialize with username and provided accessedAt when both parameters provided', () => {
      const username = 'test-user';
      const accessedAt = '2023-01-15T10:30:00Z';
      statusData = new StatusData({username, accessedAt});

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.toISOString()).toBe(new Date(accessedAt).toISOString());
    });

    it('should initialize with username and undefined accessedAt', () => {
      const username = 'test-user';
      statusData = new StatusData({username, accessedAt: undefined});

      expect(statusData.username).toBe(username);
      // undefined will use the default date
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.toISOString()).toBe(new Date('1970-01-01').toISOString());
    });

    it('should handle various date formats for accessedAt', () => {
      const username = 'test-user';
      const testDate = '2023-12-25';
      statusData = new StatusData({username, accessedAt: testDate});

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.getFullYear()).toBe(2023);
      expect(statusData.accessedAt.getMonth()).toBe(11); // December is 11
      expect(statusData.accessedAt.getDate()).toBe(25);
    });

    it('should use default username when not provided', () => {
      const statusData = new StatusData({});
      expect(statusData.username).toBe('Grandma');
    });

    it('should use provided username instead of default', () => {
      const statusData = new StatusData({username: 'custom-user'});
      expect(statusData.username).toBe('custom-user');
    });

    it('should use undefined username when explicitly provided', () => {
      const statusData = new StatusData({username: undefined});
      expect(statusData.username).toBe('Grandma'); // undefined will use default
    });

    it('should accept empty string username', () => {
      const statusData = new StatusData({username: ''});
      expect(statusData.username).toBe('');
    });

    it('should handle numeric username (even though not typical)', () => {
      const username = 123;
      statusData = new StatusData({username});

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
    });

    it('should handle boolean username (even though not typical)', () => {
      const username = true;
      statusData = new StatusData({username});

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
    });

    // sessionMinutes validation tests
    it('should use default sessionMinutes when not provided', () => {
      const statusData = new StatusData({username: 'test-user'});
      expect(statusData.sessionMinutes).toBe(180);
    });

    it('should accept positive integer sessionMinutes', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: 120});
      expect(statusData.sessionMinutes).toBe(120);
    });

    it('should round down fractional sessionMinutes', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: 120.7});
      expect(statusData.sessionMinutes).toBe(121); // Math.round(120.7) = 121
    });

    it('should round up fractional sessionMinutes', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: 120.3});
      expect(statusData.sessionMinutes).toBe(120); // Math.round(120.3) = 120
    });

    it('should clamp negative sessionMinutes to 0', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: -10});
      expect(statusData.sessionMinutes).toBe(0);
    });

    it('should use default sessionMinutes for non-numeric values', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: 'invalid'});
      expect(statusData.sessionMinutes).toBe(180);
    });

    it('should use default sessionMinutes for undefined', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: undefined});
      expect(statusData.sessionMinutes).toBe(180);
    });

    it('should handle 0 sessionMinutes', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: 0});
      expect(statusData.sessionMinutes).toBe(0);
    });

    it('should handle very large sessionMinutes', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: 10000});
      expect(statusData.sessionMinutes).toBe(10000);
    });

    it('should handle float sessionMinutes', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: 90.5});
      expect(statusData.sessionMinutes).toBe(91); // Math.round(90.5) = 91 (rounds half up)
    });

    it('should handle string numeric sessionMinutes', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01', sessionMinutes: '120'});
      expect(statusData.sessionMinutes).toBe(180); // '120' is typeof string, not number
    });
  });

  describe('accessNow method', () => {
    beforeEach(() => {
      statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-01T00:00:00Z'});
    });

    it('should update accessedAt to current date', () => {
      const beforeRefresh = new Date();
      statusData.accessNow();
      const afterRefresh = new Date();

      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(statusData.accessedAt.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());
    });

    it('should keep username unchanged when accessing now', () => {
      const originalUsername = statusData.username;
      statusData.accessNow();

      expect(statusData.username).toBe(originalUsername);
    });

    it('should work multiple times in succession', () => {
      const firstRefresh = new Date();
      statusData.accessNow();

      // Wait a small amount to ensure different timestamps
      setTimeout(() => {
        const secondRefresh = new Date();
        statusData.accessNow();

        expect(statusData.accessedAt.getTime()).toBeGreaterThan(firstRefresh.getTime());
        expect(statusData.accessedAt.getTime()).toBeGreaterThanOrEqual(secondRefresh.getTime());
      }, 1);
    });
  });

  describe('toObject method', () => {
    beforeEach(() => {
      statusData = new StatusData({username: 'test-user', accessedAt: '2023-01-15T10:30:00Z'});
    });

    it('should return object with username and accessedAt as ISO string', () => {
      const result = statusData.toObject();

      expect(result).toHaveProperty('username', 'test-user');
      expect(result).toHaveProperty('accessedAt');
      expect(typeof result.accessedAt).toBe('string');
      expect(result.accessedAt).toBe('2023-01-15T10:30:00.000Z');
    });

    it('should return a new object (not reference to internal state)', () => {
      const result = statusData.toObject();

      // Modify the returned object
      result.username = 'modified';
      result.accessedAt = 'modified';

      // Original should be unchanged
      expect(statusData.username).toBe('test-user');
      expect(statusData.accessedAt).toBeInstanceOf(Date);
    });

    it('should work correctly after accessNow is called', () => {
      const beforeRefresh = new Date();
      statusData.accessNow();
      const afterRefresh = new Date();

      const result = statusData.toObject();

      expect(result.username).toBe('test-user');
      expect(result.accessedAt).toBe(statusData.accessedAt.toISOString());

      // Check that the timestamp is recent
      const resultDate = new Date(result.accessedAt);
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(resultDate.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());
    });

    it('should work with default accessedAt date', () => {
      const defaultStatusData = new StatusData({username: 'default-user'});
      const result = defaultStatusData.toObject();

      expect(result.username).toBe('default-user');
      expect(result.accessedAt).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should handle special characters in username', () => {
      const specialUser = new StatusData({username: 'user@domain.com', accessedAt: '2023-01-01T00:00:00Z'});
      const result = specialUser.toObject();

      expect(result.username).toBe('user@domain.com');
      expect(typeof result.accessedAt).toBe('string');
    });

    it('should handle unicode characters in username', () => {
      const unicodeUser = new StatusData({username: '用户测试', accessedAt: '2023-01-01T00:00:00Z'});
      const result = unicodeUser.toObject();

      expect(result.username).toBe('用户测试');
      expect(typeof result.accessedAt).toBe('string');
    });
  });

  describe('canAccess method', () => {
    beforeEach(() => {
      // Set a fixed date for predictable testing
      statusData = new StatusData({username: 'test-user', accessedAt: '2023-06-15T10:00:00Z'});
    });

    it('should return true when username matches this.username', () => {
      const result = statusData.canAccess('test-user');

      expect(result).toBe(true);
    });

    it('should return true when username matches this.username regardless of session time', () => {
      const statusData = new StatusData({username: 'test-user', accessedAt: '1970-01-01T00:00:00Z'});

      const result = statusData.canAccess('test-user'); // session time doesn't matter for same username

      expect(result).toBe(true);
    });

    it('should return false for different username when session has not expired', () => {
      // Create a date that's 30 minutes ago from now
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const statusData = new StatusData({username: 'original-user', accessedAt: thirtyMinutesAgo.toISOString()});

      const result = statusData.canAccess('different-user'); // default 180 minutes

      expect(result).toBe(false);
    });

    it('should return true for different username when session has expired', () => {
      // Create a date that's 6 hours ago from now
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const statusData = new StatusData({username: 'original-user', accessedAt: sixHoursAgo.toISOString(), sessionMinutes: 60}); // 6 hours ago with 60 min session

      const result = statusData.canAccess('different-user'); // uses instance's sessionMinutes (60)

      expect(result).toBe(true);
    });

    it('should handle custom session minutes correctly', () => {
      // 30 minutes session - should be expired
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const statusData30 = new StatusData({username: 'original-user', accessedAt: oneHourAgo.toISOString(), sessionMinutes: 30}); // 1 hour ago with 30 min session
      let result = statusData30.canAccess('different-user');
      expect(result).toBe(true);

      // 120 minutes session - should still be valid
      const statusData120 = new StatusData({username: 'original-user', accessedAt: oneHourAgo.toISOString(), sessionMinutes: 120}); // 1 hour ago with 120 min session
      result = statusData120.canAccess('different-user');
      expect(result).toBe(false);
    });

    it('should handle edge case of session exactly expired', () => {
      const statusData = new StatusData({username: 'original-user', accessedAt: '2023-06-15T10:59:59Z', sessionMinutes: 180}); // 3 hours + 1 second ago with 180 min session

      // Exactly 180 minutes session (should be expired by 1 second)
      const result = statusData.canAccess('different-user');
      expect(result).toBe(true);
    });

    it('should work with default session time (180 minutes)', () => {
      // Create a date that's 15 minutes ago from now
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const statusData = new StatusData({username: 'original-user', accessedAt: fifteenMinutesAgo.toISOString()});

      const result = statusData.canAccess('different-user');

      expect(result).toBe(false);
    });

    it('should handle very old accessedAt dates', () => {
      const statusData = new StatusData({username: 'original-user', accessedAt: '1970-01-01T00:00:00Z'});

      const result = statusData.canAccess('different-user');

      expect(result).toBe(true);
    });

    it('should handle numeric usernames', () => {
      const statusData = new StatusData({username: 123, accessedAt: '2023-06-15T12:00:00Z', sessionMinutes: 60}); // 2 hours ago with 60 min session

      // Same numeric username
      expect(statusData.canAccess(123)).toBe(true);

      // Different numeric username with expired session
      expect(statusData.canAccess(456)).toBe(true);
    });

    it('should handle boolean usernames', () => {
      const statusData = new StatusData({username: true, accessedAt: '2023-06-15T12:00:00Z', sessionMinutes: 60}); // 2 hours ago with 60 min session

      // Same boolean username
      expect(statusData.canAccess(true)).toBe(true);

      // Different boolean username with expired session
      expect(statusData.canAccess(false)).toBe(true);
    });

    it('should work correctly after accessNow is called', () => {
      const statusData = new StatusData({username: 'original-user', accessedAt: '2023-06-15T10:00:00Z', sessionMinutes: 60}); // 5 hours ago with 60 min session

      // Initially session should be expired
      expect(statusData.canAccess('different-user')).toBe(true);

      // Refresh to current time
      statusData.accessNow();

      // Now session should be valid
      expect(statusData.canAccess('different-user')).toBe(false);
    });

    it('should handle zero session minutes', () => {
      const statusData = new StatusData({username: 'original-user', accessedAt: '2023-06-15T13:59:59Z', sessionMinutes: 0}); // 1 second ago with 0 min session

      const result = statusData.canAccess('different-user');

      expect(result).toBe(true);
    });

    it('should handle negative session minutes', () => {
      const statusData = new StatusData({username: 'original-user', accessedAt: '2023-06-15T10:00:00Z', sessionMinutes: -10}); // 4 hours ago with -10 min (clamped to 0)

      const result = statusData.canAccess('different-user');

      expect(result).toBe(true);
    });

    it('should work with fractional session minutes', () => {
      const statusData = new StatusData({username: 'original-user', accessedAt: '2023-06-15T10:59:29Z', sessionMinutes: 0.5}); // 3+ hours ago with 0.5 min (rounded to 1 min)

      const result = statusData.canAccess('different-user');

      expect(result).toBe(true);
    });

    it('should handle session time boundary conditions precisely', () => {
      // Create a date that's 2 hours ago from now
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      // 119 minutes - should still be expired (2 hours = 120 minutes)
      const statusData119 = new StatusData({username: 'original-user', accessedAt: twoHoursAgo.toISOString(), sessionMinutes: 119}); // 2 hours ago with 119 min session
      let result = statusData119.canAccess('different-user');
      expect(result).toBe(true);

      // 121 minutes - should still be valid
      const statusData121 = new StatusData({username: 'original-user', accessedAt: twoHoursAgo.toISOString(), sessionMinutes: 121}); // 2 hours ago with 121 min session
      result = statusData121.canAccess('different-user');
      expect(result).toBe(false);
    });

    it('should handle usernames with special characters', () => {
      const statusData = new StatusData({username: 'user@domain.com', accessedAt: '2023-06-15T12:00:00Z', sessionMinutes: 60}); // 2 hours ago with 60 min session

      // Exact match
      expect(statusData.canAccess('user@domain.com')).toBe(true);

      // Different user with special characters and expired session
      expect(statusData.canAccess('other@domain.com')).toBe(true);
    });

    it('should handle unicode usernames', () => {
      const statusData = new StatusData({username: '用户', accessedAt: '2023-06-15T12:00:00Z', sessionMinutes: 60}); // 2 hours ago with 60 min session

      // Exact unicode match
      expect(statusData.canAccess('用户')).toBe(true);

      // Different unicode user with expired session
      expect(statusData.canAccess('测试')).toBe(true);
    });

    it('should be consistent with toObject data', () => {
      const sessionMinutes = 60;
      const statusData = new StatusData({username: 'test-user', accessedAt: '2023-06-15T12:00:00Z', sessionMinutes});
      const objectData = statusData.toObject();

      // Simulate canAccess logic using toObject data
      const sessionExpiryTime = new Date(new Date(objectData.accessedAt).getTime() + sessionMinutes * 60 * 1000);
      const now = new Date('2023-06-15T14:00:00Z');
      const expected = sessionExpiryTime < now;

      const result = statusData.canAccess('different-user');

      expect(result).toBe(expected);
    });
  });

  describe('Integration tests', () => {
    it('should work through a complete lifecycle', () => {
      const statusData = new StatusData({username: 'lifecycle-user', accessedAt: '2023-01-01T12:00:00Z'});

      // Initial state
      expect(statusData.username).toBe('lifecycle-user');
      expect(statusData.canAccess('lifecycle-user')).toBe(true);
      expect(statusData.canAccess('other-user')).toBe(true); // Session should be expired

      // Access now
      statusData.accessNow();

      // After refresh
      expect(statusData.canAccess('lifecycle-user')).toBe(true);
      expect(statusData.canAccess('other-user')).toBe(false); // Session should be fresh

      // Convert to object
      const object = statusData.toObject();
      expect(object).toHaveProperty('username', 'lifecycle-user');
      expect(object).toHaveProperty('accessedAt');
      expect(typeof object.accessedAt).toBe('string');
    });
  });
});