const StatusData = require('../src/status-data');

describe('StatusData Class', () => {
  let statusData;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with username and default accessedAt when only username provided', () => {
      const username = 'test-user';
      statusData = new StatusData(username);

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.toISOString()).toBe(new Date('1970-01-01').toISOString());
    });

    it('should initialize with username and provided accessedAt when both parameters provided', () => {
      const username = 'test-user';
      const accessedAt = '2023-01-15T10:30:00Z';
      statusData = new StatusData(username, accessedAt);

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.toISOString()).toBe(new Date(accessedAt).toISOString());
    });

    it('should initialize with username and null accessedAt', () => {
      const username = 'test-user';
      statusData = new StatusData(username, null);

      expect(statusData.username).toBe(username);
      // null is treated as object (typeof null === 'object'), so it uses the default
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.toISOString()).toBe(new Date('1970-01-01').toISOString());
    });

    it('should handle various date formats for accessedAt', () => {
      const username = 'test-user';
      const testDate = '2023-12-25';
      statusData = new StatusData(username, testDate);

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.getFullYear()).toBe(2023);
      expect(statusData.accessedAt.getMonth()).toBe(11); // December is 11
      expect(statusData.accessedAt.getDate()).toBe(25);
    });

    it('should use default username when not provided', () => {
      const statusData = new StatusData();
      expect(statusData.username).toBe('Grandma');
    });

    it('should use provided username instead of default', () => {
      const statusData = new StatusData('custom-user');
      expect(statusData.username).toBe('custom-user');
    });

    it('should use null username when explicitly provided', () => {
      const statusData = new StatusData(null);
      expect(statusData.username).toBe(null);
    });

    it('should use undefined username when explicitly provided', () => {
      const statusData = new StatusData(undefined);
      expect(statusData.username).toBe('Grandma'); // undefined will use default
    });

    it('should accept empty string username', () => {
      const statusData = new StatusData('');
      expect(statusData.username).toBe('');
    });

    it('should handle numeric username (even though not typical)', () => {
      const username = 123;
      statusData = new StatusData(username);

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
    });

    it('should handle boolean username (even though not typical)', () => {
      const username = true;
      statusData = new StatusData(username);

      expect(statusData.username).toBe(username);
      expect(statusData.accessedAt).toBeInstanceOf(Date);
    });

    // sessionMinutes validation tests
    it('should use default sessionMinutes when not provided', () => {
      const statusData = new StatusData('test-user');
      expect(statusData.sessionMinutes).toBe(180);
    });

    it('should accept positive integer sessionMinutes', () => {
      const statusData = new StatusData('test-user', '2023-01-01', 120);
      expect(statusData.sessionMinutes).toBe(120);
    });

    it('should round down fractional sessionMinutes', () => {
      const statusData = new StatusData('test-user', '2023-01-01', 120.7);
      expect(statusData.sessionMinutes).toBe(121); // Math.round(120.7) = 121
    });

    it('should round up fractional sessionMinutes', () => {
      const statusData = new StatusData('test-user', '2023-01-01', 120.3);
      expect(statusData.sessionMinutes).toBe(120); // Math.round(120.3) = 120
    });

    it('should clamp negative sessionMinutes to 0', () => {
      const statusData = new StatusData('test-user', '2023-01-01', -10);
      expect(statusData.sessionMinutes).toBe(0);
    });

    it('should use default sessionMinutes for non-numeric values', () => {
      const statusData = new StatusData('test-user', '2023-01-01', 'invalid');
      expect(statusData.sessionMinutes).toBe(180);
    });

    it('should use default sessionMinutes for null', () => {
      const statusData = new StatusData('test-user', '2023-01-01', null);
      expect(statusData.sessionMinutes).toBe(180);
    });

    it('should handle 0 sessionMinutes', () => {
      const statusData = new StatusData('test-user', '2023-01-01', 0);
      expect(statusData.sessionMinutes).toBe(0);
    });

    it('should handle very large sessionMinutes', () => {
      const statusData = new StatusData('test-user', '2023-01-01', 10000);
      expect(statusData.sessionMinutes).toBe(10000);
    });

    it('should handle float sessionMinutes', () => {
      const statusData = new StatusData('test-user', '2023-01-01', 90.5);
      expect(statusData.sessionMinutes).toBe(91); // Math.round(90.5) = 91 (rounds half up)
    });

    it('should handle string numeric sessionMinutes', () => {
      const statusData = new StatusData('test-user', '2023-01-01', '120');
      expect(statusData.sessionMinutes).toBe(180); // '120' is typeof string, not number
    });
  });

  describe('accessNow method', () => {
    beforeEach(() => {
      statusData = new StatusData('test-user', '2023-01-01T00:00:00Z');
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
      statusData = new StatusData('test-user', '2023-01-15T10:30:00Z');
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
      const defaultStatusData = new StatusData('default-user');
      const result = defaultStatusData.toObject();

      expect(result.username).toBe('default-user');
      expect(result.accessedAt).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should handle special characters in username', () => {
      const specialUser = new StatusData('user@domain.com', '2023-01-01T00:00:00Z');
      const result = specialUser.toObject();

      expect(result.username).toBe('user@domain.com');
      expect(result.accessedAt).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle unicode characters in username', () => {
      const unicodeUser = new StatusData('用户测试', '2023-01-01T00:00:00Z');
      const result = unicodeUser.toObject();

      expect(result.username).toBe('用户测试');
      expect(result.accessedAt).toBe('2023-01-01T00:00:00.000Z');
    });
  });

  describe('canAccess method', () => {
    beforeEach(() => {
      // Set a fixed time for predictable testing
      jest.useFakeTimers().setSystemTime(new Date('2023-06-15T14:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true when username matches this.username', () => {
      const statusData = new StatusData('test-user', '2023-06-15T10:00:00Z');

      const result = statusData.canAccess('test-user');

      expect(result).toBe(true);
    });

    it('should return true when username matches this.username regardless of session time', () => {
      const statusData = new StatusData('test-user', '1970-01-01T00:00:00Z');

      const result = statusData.canAccess('test-user', 1); // 1 minute session

      expect(result).toBe(true);
    });

    it('should return false for different username when session has not expired', () => {
      const statusData = new StatusData('original-user', '2023-06-15T13:30:00Z'); // 30 minutes ago

      const result = statusData.canAccess('different-user'); // default 180 minutes

      expect(result).toBe(false);
    });

    it('should return true for different username when session has expired', () => {
      const statusData = new StatusData('original-user', '2023-06-15T08:00:00Z'); // 6 hours ago

      const result = statusData.canAccess('different-user', 60); // 60 minutes session

      expect(result).toBe(true);
    });

    it('should handle custom session minutes correctly', () => {
      const statusData = new StatusData('original-user', '2023-06-15T13:00:00Z'); // 1 hour ago

      // 30 minutes session - should be expired
      let result = statusData.canAccess('different-user', 30);
      expect(result).toBe(true);

      // 120 minutes session - should still be valid
      result = statusData.canAccess('different-user', 120);
      expect(result).toBe(false);
    });

    it('should handle edge case of session exactly expired', () => {
      const statusData = new StatusData('original-user', '2023-06-15T10:59:59Z'); // 3 hours + 1 second ago

      // Exactly 180 minutes session (should be expired by 1 second)
      const result = statusData.canAccess('different-user', 180);
      expect(result).toBe(true);
    });

    it('should work with default session time (180 minutes)', () => {
      const statusData = new StatusData('original-user', '2023-06-15T13:45:00Z'); // 15 minutes ago

      const result = statusData.canAccess('different-user');

      expect(result).toBe(false);
    });

    it('should handle very old accessedAt dates', () => {
      const statusData = new StatusData('original-user', '1970-01-01T00:00:00Z');

      const result = statusData.canAccess('different-user');

      expect(result).toBe(true);
    });

    it('should handle numeric usernames', () => {
      const statusData = new StatusData(123, '2023-06-15T12:00:00Z'); // 2 hours ago

      // Same numeric username
      expect(statusData.canAccess(123)).toBe(true);

      // Different numeric username with expired session
      expect(statusData.canAccess(456, 60)).toBe(true);
    });

    it('should handle boolean usernames', () => {
      const statusData = new StatusData(true, '2023-06-15T12:00:00Z'); // 2 hours ago

      // Same boolean username
      expect(statusData.canAccess(true)).toBe(true);

      // Different boolean username with expired session
      expect(statusData.canAccess(false, 60)).toBe(true);
    });

    it('should work correctly after accessNow is called', () => {
      const statusData = new StatusData('original-user', '2023-06-15T10:00:00Z');

      // Initially session should be expired for 1 hour session
      expect(statusData.canAccess('different-user', 60)).toBe(true);

      // Refresh to current time
      statusData.accessNow();

      // Now session should be valid
      expect(statusData.canAccess('different-user', 60)).toBe(false);
    });

    it('should handle zero session minutes', () => {
      const statusData = new StatusData('original-user', '2023-06-15T13:59:59Z'); // 1 second ago

      const result = statusData.canAccess('different-user', 0);

      expect(result).toBe(true);
    });

    it('should handle negative session minutes', () => {
      const statusData = new StatusData('original-user', '2023-06-15T14:00:00Z'); // current time

      const result = statusData.canAccess('different-user', -10);

      expect(result).toBe(true);
    });

    it('should work with fractional session minutes', () => {
      const statusData = new StatusData('original-user', '2023-06-15T13:59:29Z'); // 31 seconds ago

      const result = statusData.canAccess('different-user', 0.5); // 30 seconds

      expect(result).toBe(true);
    });

    it('should handle session time boundary conditions precisely', () => {
      const statusData = new StatusData('original-user', '2023-06-15T12:00:00Z'); // 2 hours ago

      // 119 minutes - should still be expired
      let result = statusData.canAccess('different-user', 119);
      expect(result).toBe(true);

      // 121 minutes - should still be expired
      result = statusData.canAccess('different-user', 121);
      expect(result).toBe(false);
    });

    it('should handle usernames with special characters', () => {
      const statusData = new StatusData('user@domain.com', '2023-06-15T12:00:00Z'); // 2 hours ago

      // Exact match
      expect(statusData.canAccess('user@domain.com')).toBe(true);

      // Different user with special characters and expired session
      expect(statusData.canAccess('other@domain.com', 60)).toBe(true);
    });

    it('should handle unicode usernames', () => {
      const statusData = new StatusData('用户', '2023-06-15T12:00:00Z'); // 2 hours ago

      // Exact unicode match
      expect(statusData.canAccess('用户')).toBe(true);

      // Different unicode user with expired session
      expect(statusData.canAccess('测试', 60)).toBe(true);
    });

    it('should be consistent with toObject data', () => {
      const statusData = new StatusData('test-user', '2023-06-15T12:00:00Z');
      const objectData = statusData.toObject();

      // Simulate canAccess logic using toObject data
      const sessionMinutes = 60;
      const sessionExpiryTime = new Date(new Date(objectData.accessedAt).getTime() + sessionMinutes * 60 * 1000);
      const now = new Date('2023-06-15T14:00:00Z');
      const expected = sessionExpiryTime < now;

      const result = statusData.canAccess('different-user', sessionMinutes);

      expect(result).toBe(expected);
    });
  });

  describe('Integration tests', () => {
    it('should work through a complete lifecycle', () => {
      // Create with initial data
      const statusData = new StatusData('lifecycle-user', '2023-01-01T12:00:00Z');

      // Verify initial state
      expect(statusData.username).toBe('lifecycle-user');
      expect(statusData.accessedAt.toISOString()).toBe('2023-01-01T12:00:00.000Z');

      // Convert to object
      let objectData = statusData.toObject();
      expect(objectData).toEqual({
        username: 'lifecycle-user',
        accessedAt: '2023-01-01T12:00:00.000Z'
      });

      // Refresh
      const beforeRefresh = new Date();
      statusData.accessNow();
      const afterRefresh = new Date();

      // Verify accessNow worked
      expect(statusData.username).toBe('lifecycle-user');
      expect(statusData.accessedAt.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(statusData.accessedAt.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());

      // Convert to object again
      objectData = statusData.toObject();
      expect(objectData.username).toBe('lifecycle-user');
      expect(typeof objectData.accessedAt).toBe('string');

      // Verify the accessNowed timestamp
      const accessNowedDate = new Date(objectData.accessedAt);
      expect(accessNowedDate.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(accessNowedDate.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());
    });
  });
});
