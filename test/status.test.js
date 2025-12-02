const Status = require('../src/status');
const Gist = require('../src/gist');
const StatusData = require('../src/status-data');

// Mock the Gist class
jest.mock('../src/gist');

// Mock the StatusData class
jest.mock('../src/status-data');

// Mock the @octokit/core module
jest.mock('@octokit/core', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: jest.fn()
  }))
}));

describe('Status Class', () => {
  const mockToken = 'test-token';
  const mockId = 'test-gist-id';
  const mockFileName = 'shared-debrid.json';
  let status;
  let mockStatusData;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock StatusData instance
    mockStatusData = {
      username: 'grandma',
      accessedAt: new Date('1970-01-01'),
      accessNow: jest.fn().mockReturnThis(),
      toObject: jest.fn().mockReturnValue({
        username: 'grandma',
        accessedAt: new Date('1970-01-01').toISOString()
      })
    };

    StatusData.mockImplementation(() => mockStatusData);

    // Make sure toObject is properly mocked
    mockStatusData.toObject = jest.fn().mockReturnValue({
      username: 'grandma',
      accessedAt: new Date('1970-01-01').toISOString()
    });

    status = new Status(mockToken, mockId, mockFileName);
  });

  describe('Constructor', () => {
    it('should initialize with Gist instance, fileName, and StatusData instance', () => {
      expect(status.gist).toBeDefined();
      expect(status.fileName).toBe(mockFileName);
      expect(status.data).toBe(mockStatusData);
      expect(Gist).toHaveBeenCalledWith(mockToken, mockId);
      expect(StatusData).toHaveBeenCalled();
    });

    it('should use default fileName when not provided', () => {
      const statusWithoutFileName = new Status(mockToken, mockId);
      expect(statusWithoutFileName.fileName).toBe('shared-debrid.json');
    });

    it('should use custom fileName when provided', () => {
      const customFileName = 'custom-config.json';
      const statusWithCustomFileName = new Status(mockToken, mockId, customFileName);
      expect(statusWithCustomFileName.fileName).toBe(customFileName);
    });
  });

  describe('get method', () => {
    it('should return StatusData instance when file contains valid JSON', async () => {
      const mockJsonData = { username: 'test-user', accessedAt: '2023-01-01T00:00:00Z' };
      const mockContent = JSON.stringify(mockJsonData);

      // Mock StatusData constructor to return new instance with the parsed data
      const mockNewStatusData = {
        username: 'test-user',
        accessedAt: new Date('2023-01-01T00:00:00Z'),
        accessNow: jest.fn().mockReturnThis(),
        toObject: jest.fn().mockReturnValue(mockJsonData)
      };

      StatusData.mockImplementation((username, accessedAt) => {
        if (username === 'test-user') {
          return mockNewStatusData;
        }
        return mockStatusData;
      });

      status.gist.getContent = jest.fn().mockResolvedValue(mockContent);

      const result = await status.get();

      expect(status.gist.getContent).toHaveBeenCalledWith(mockFileName);
      expect(result).toBe(mockNewStatusData);
      expect(StatusData).toHaveBeenCalledWith('test-user', '2023-01-01T00:00:00Z');
    });

    it('should return default StatusData when file content is empty', async () => {
      status.gist.getContent = jest.fn().mockResolvedValue('');

      const result = await status.get();

      expect(status.gist.getContent).toHaveBeenCalledWith(mockFileName);
      expect(result).toBe(mockStatusData);
      expect(status.data).toBe(mockStatusData);
    });

    it('should return default StatusData when file does not exist', async () => {
      status.gist.getContent = jest.fn().mockResolvedValue(null);

      const result = await status.get();

      expect(status.gist.getContent).toHaveBeenCalledWith(mockFileName);
      expect(result).toBe(mockStatusData);
    });

    it('should throw error when JSON parsing fails', async () => {
      const invalidJson = '{"status": "active", invalid}';
      status.gist.getContent = jest.fn().mockResolvedValue(invalidJson);

      await expect(status.get())
        .rejects.toThrow('Failed to get status:');
    });

    it('should throw error when Gist getContent fails', async () => {
      const errorMessage = 'Gist not found';
      status.gist.getContent = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(status.get())
        .rejects.toThrow('Failed to get status: Gist not found');
    });
  });

  describe('update method', () => {
    it('should update gist with StatusData serialized as JSON', async () => {
      const mockDataObject = { username: 'grandma', accessedAt: '1970-01-01T00:00:00.000Z' };
      const expectedString = JSON.stringify(mockDataObject, null, 2);

      status.gist.updateContent = jest.fn().mockResolvedValue({ updated: true });

      const result = await status.update();

      expect(status.data.accessNow).toHaveBeenCalled();
      expect(status.gist.updateContent).toHaveBeenCalledWith(mockFileName, expectedString);
      expect(result).toEqual({ updated: true });
    });

    it('should update username when provided', async () => {
      const newUsername = 'new-user';
      const mockDataObject = { username: newUsername, accessedAt: '1970-01-01T00:00:00.000Z' };
      const expectedString = JSON.stringify(mockDataObject, null, 2);

      status.gist.updateContent = jest.fn().mockResolvedValue({ updated: true });

      const result = await status.update(newUsername);

      expect(status.data.username).toBe(newUsername);
      expect(status.data.accessNow).toHaveBeenCalled();
      expect(status.gist.updateContent).toHaveBeenCalledWith(mockFileName, expectedString);
      expect(result).toEqual({ updated: true });
    });

    it('should throw error when Gist updateContent fails', async () => {
      const errorMessage = 'Update failed';

      status.gist.updateContent = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(status.update())
        .rejects.toThrow('Failed to update status: Update failed');

      expect(status.data.accessNow).toHaveBeenCalled();
    });

    it('should not change username when not provided', async () => {
      const mockDataObject = { username: 'grandma', accessedAt: '1970-01-01T00:00:00.000Z' };
      const expectedString = JSON.stringify(mockDataObject, null, 2);

      status.gist.updateContent = jest.fn().mockResolvedValue({ updated: true });

      const result = await status.update();

      expect(status.data.username).toBe('grandma'); // Should remain unchanged
      expect(status.data.accessNow).toHaveBeenCalled();
      expect(status.gist.updateContent).toHaveBeenCalledWith(mockFileName, expectedString);
      expect(result).toEqual({ updated: true });
    });
  });
});
