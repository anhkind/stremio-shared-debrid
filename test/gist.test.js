const Gist = require('../src/gist');

// Mock the https module
jest.mock('https', () => ({
  request: jest.fn()
}));

const https = require('https');

describe('Gist Class', () => {
  const mockToken = 'test-token';
  const mockId = 'test-gist-id';
  let gist;

  beforeEach(() => {
    jest.clearAllMocks();
    gist = new Gist(mockToken, mockId);
  });

  describe('constructor', () => {
    it('should initialize with token and id', () => {
      expect(gist.token).toBe(mockToken);
      expect(gist.id).toBe(mockId);
    });
  });

  describe('request method', () => {
    it('should make a GET request without body', async () => {
      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback('{"id": "test-gist-id"}');
          }
          if (event === 'end') {
            callback();
          }
        })
      };

      const mockReq = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockReq;
      });

      const result = await gist.request('GET', '/gists/test-id');

      expect(https.request).toHaveBeenCalledWith(
        'https://api.github.com/gists/test-id',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          })
        }),
        expect.any(Function)
      );

      expect(result).toEqual({ id: 'test-gist-id' });
    });

    it('should make a PATCH request with body', async () => {
      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback('{"id": "test-gist-id", "updated": true}');
          }
          if (event === 'end') {
            callback();
          }
        })
      };

      const mockReq = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockReq;
      });

      const body = { description: 'Updated gist' };
      const result = await gist.request('PATCH', '/gists/test-id', body);

      expect(https.request).toHaveBeenCalledWith(
        'https://api.github.com/gists/test-id',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          })
        }),
        expect.any(Function)
      );

      expect(mockReq.write).toHaveBeenCalledWith(JSON.stringify(body));
      expect(result).toEqual({ id: 'test-gist-id', updated: true });
    });

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        statusCode: 404,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback('Not Found');
          }
          if (event === 'end') {
            callback();
          }
        })
      };

      const mockReq = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockReq;
      });

      await expect(gist.request('GET', '/gists/not-found')).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should handle network errors', async () => {
      const mockReq = {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Network error'));
          }
        }),
        write: jest.fn(),
        end: jest.fn()
      };

      https.request.mockReturnValue(mockReq);

      await expect(gist.request('GET', '/gists/test-id')).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback('invalid json');
          }
          if (event === 'end') {
            callback();
          }
        })
      };

      const mockReq = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockReq;
      });

      await expect(gist.request('GET', '/gists/test-id')).rejects.toThrow('Error parsing JSON response');
    });
  });

  describe('get method', () => {
    it('should call request with GET method and correct path', async () => {
      const mockResponse = {
        id: mockId,
        files: { 'test.txt': { content: 'test content' } }
      };

      jest.spyOn(gist, 'request').mockResolvedValue(mockResponse);

      const result = await gist.get();

      expect(gist.request).toHaveBeenCalledWith('GET', `/gists/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update method', () => {
    it('should call request with PATCH method and correct body for string content', async () => {
      const mockResponse = {
        id: mockId,
        updated: true
      };

      jest.spyOn(gist, 'request').mockResolvedValue(mockResponse);

      const files = { 'test.txt': 'updated content' };
      const description = 'Updated description';

      await gist.update(files, description);

      expect(gist.request).toHaveBeenCalledWith('PATCH', `/gists/${mockId}`, {
        description: 'Updated description',
        files: {
          'test.txt': { content: 'updated content' }
        }
      });
    });

    it('should call request with PATCH method and correct body for object content', async () => {
      const mockResponse = {
        id: mockId,
        updated: true
      };

      jest.spyOn(gist, 'request').mockResolvedValue(mockResponse);

      const files = { 'test.txt': { content: 'updated content' } };

      await gist.update(files);

      expect(gist.request).toHaveBeenCalledWith('PATCH', `/gists/${mockId}`, {
        files: {
          'test.txt': { content: 'updated content' }
        }
      });
    });

    it('should call request with PATCH method without description when not provided', async () => {
      const mockResponse = {
        id: mockId,
        updated: true
      };

      jest.spyOn(gist, 'request').mockResolvedValue(mockResponse);

      const files = { 'test.txt': 'updated content' };

      await gist.update(files);

      expect(gist.request).toHaveBeenCalledWith('PATCH', `/gists/${mockId}`, {
        files: {
          'test.txt': { content: 'updated content' }
        }
      });
    });

    it('should handle different content types by converting to string', async () => {
      const mockResponse = {
        id: mockId,
        updated: true
      };

      jest.spyOn(gist, 'request').mockResolvedValue(mockResponse);

      const files = {
        'number.txt': 123,
        'boolean.txt': true,
        'object.txt': { nested: 'value' }
      };

      await gist.update(files);

      expect(gist.request).toHaveBeenCalledWith('PATCH', `/gists/${mockId}`, {
        files: {
          'number.txt': { content: '123' },
          'boolean.txt': { content: 'true' },
          'object.txt': { content: '[object Object]' }
        }
      });
    });
  });
});
