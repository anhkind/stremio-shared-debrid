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

    it('should initialize with username and current date when accessedAt is null', () => {
      const username = 'test-user';
      statusData = new StatusData(username, null);

      expect(statusData.username).toBe(username);
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

    it('should throw error when username is not provided', () => {
      expect(() => new StatusData()).toThrow('username can not be empty');
    });

    it('should throw error when username is null', () => {
      expect(() => new StatusData(null)).toThrow('username can not be empty');
    });

    it('should throw error when username is undefined', () => {
      expect(() => new StatusData(undefined)).toThrow('username can not be empty');
    });

    it('should throw error when username is empty string', () => {
      expect(() => new StatusData('')).toThrow('username can not be empty');
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
  });

  describe('refresh method', () => {
    beforeEach(() => {
      statusData = new StatusData('test-user', '2023-01-01T00:00:00Z');
    });

    it('should update accessedAt to current date', () => {
      const beforeRefresh = new Date();
      statusData.refresh();
      const afterRefresh = new Date();

      expect(statusData.accessedAt).toBeInstanceOf(Date);
      expect(statusData.accessedAt.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(statusData.accessedAt.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());
    });

    it('should keep username unchanged when refreshing', () => {
      const originalUsername = statusData.username;
      statusData.refresh();

      expect(statusData.username).toBe(originalUsername);
    });

    it('should work multiple times in succession', () => {
      const firstRefresh = new Date();
      statusData.refresh();

      // Wait a small amount to ensure different timestamps
      setTimeout(() => {
        const secondRefresh = new Date();
        statusData.refresh();

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

    it('should work correctly after refresh is called', () => {
      const beforeRefresh = new Date();
      statusData.refresh();
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
      statusData.refresh();
      const afterRefresh = new Date();

      // Verify refresh worked
      expect(statusData.username).toBe('lifecycle-user');
      expect(statusData.accessedAt.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(statusData.accessedAt.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());

      // Convert to object again
      objectData = statusData.toObject();
      expect(objectData.username).toBe('lifecycle-user');
      expect(typeof objectData.accessedAt).toBe('string');

      // Verify the refreshed timestamp
      const refreshedDate = new Date(objectData.accessedAt);
      expect(refreshedDate.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(refreshedDate.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());
    });
  });
});