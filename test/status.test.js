const Status = require('../src/status');
const Gist = require('../src/gist');

// Mock the Gist class
jest.mock('../src/gist');

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

  beforeEach(() => {
    jest.clearAllMocks();
    status = new Status(mockToken, mockId, mockFileName);
  });

  describe('Constructor', () => {
    it('should initialize with Gist instance and fileName', () => {
      expect(status.gist).toBeDefined();
      expect(status.fileName).toBe(mockFileName);
      expect(Gist).toHaveBeenCalledWith(mockToken, mockId);
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
    it('should return parsed JSON content when file exists and contains valid JSON', async () => {
      const mockJsonData = { status: 'active', timestamp: '2023-01-01' };
      const mockContent = JSON.stringify(mockJsonData);

      status.gist.getContent = jest.fn().mockResolvedValue(mockContent);

      const result = await status.get();

      expect(status.gist.getContent).toHaveBeenCalledWith(mockFileName);
      expect(result).toEqual(mockJsonData);
    });

    it('should return empty object when file content is empty', async () => {
      status.gist.getContent = jest.fn().mockResolvedValue('');

      const result = await status.get();

      expect(status.gist.getContent).toHaveBeenCalledWith(mockFileName);
      expect(result).toEqual({});
    });

    it('should use constructor fileName when no fileName parameter provided', async () => {
      const mockJsonData = { status: 'active' };
      status.gist.getContent = jest.fn().mockResolvedValue(JSON.stringify(mockJsonData));

      await status.get();

      expect(status.gist.getContent).toHaveBeenCalledWith(mockFileName);
    });

    it('should use constructor fileName when get is called with fileName parameter', async () => {
      const customFileName = 'custom-file.json';
      const mockJsonData = { status: 'active' };
      status.gist.getContent = jest.fn().mockResolvedValue(JSON.stringify(mockJsonData));

      await status.get(customFileName);

      expect(status.gist.getContent).toHaveBeenCalledWith(mockFileName);
    });

    it('should throw error when JSON parsing fails', async () => {
      const invalidJson = '{"status": "active", invalid}';
      status.gist.getContent = jest.fn().mockResolvedValue(invalidJson);

      await expect(status.get())
        .rejects.toThrow(`Failed to parse JSON content from ${mockFileName}`);
    });

    it('should throw error when Gist getContent fails', async () => {
      const errorMessage = 'Gist not found';
      status.gist.getContent = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(status.get())
        .rejects.toThrow('Failed to get status: Gist not found');
    });

    it('should handle complex JSON structures', async () => {
      const complexData = {
        services: [
          { name: 'debrid1', status: 'online', lastCheck: '2023-01-01T00:00:00Z' },
          { name: 'debrid2', status: 'offline', lastCheck: '2023-01-01T01:00:00Z' }
        ],
        config: {
          timeout: 5000,
          retries: 3
        },
        metadata: {
          version: '1.0.0',
          author: 'test'
        }
      };

      status.gist.getContent = jest.fn().mockResolvedValue(JSON.stringify(complexData));

      const result = await status.get();

      expect(result).toEqual(complexData);
    });
  });

  describe('update method', () => {
    it('should update gist with stored data after get call', async () => {
      const mockData = { status: 'active', timestamp: '2023-01-02' };
      const expectedString = JSON.stringify(mockData, null, 2);

      // Mock get to return data and store it in this.data
      status.gist.getContent = jest.fn().mockResolvedValue(JSON.stringify(mockData));
      status.gist.updateContent = jest.fn().mockResolvedValue({ updated: true });

      // First call get to populate this.data
      await status.get();

      // Then call update to use this.data
      const result = await status.update();

      expect(status.data).toEqual(mockData);
      expect(status.gist.updateContent).toHaveBeenCalledWith(mockFileName, expectedString);
      expect(result).toEqual({ updated: true });
    });

    it('should throw error when update is called before get', async () => {
      await expect(status.update()).rejects.toThrow('No data available to update. Call get() first.');
    });

    it('should throw error when Gist updateContent fails', async () => {
      const mockData = { status: 'updated' };
      const errorMessage = 'Update failed';

      status.gist.getContent = jest.fn().mockResolvedValue(JSON.stringify(mockData));
      status.gist.updateContent = jest.fn().mockRejectedValue(new Error(errorMessage));

      // First call get to populate this.data
      await status.get();

      await expect(status.update())
        .rejects.toThrow('Failed to update status: Update failed');
    });

    it('should work with empty data from get', async () => {
      status.gist.getContent = jest.fn().mockResolvedValue(''); // Empty content
      status.gist.updateContent = jest.fn().mockResolvedValue({ updated: true });

      // Call get with empty content
      await status.get();

      // Update should work with empty object
      const result = await status.update();

      expect(status.data).toEqual({});
      expect(status.gist.updateContent).toHaveBeenCalledWith(mockFileName, JSON.stringify({}, null, 2));
      expect(result).toEqual({ updated: true });
    });
  });
});