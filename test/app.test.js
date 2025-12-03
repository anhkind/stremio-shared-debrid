const request = require('supertest');
const app = require('../src/app');
const Status = require('../src/status');

// Mock @octokit/core to prevent actual API calls
jest.mock('@octokit/core', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: jest.fn()
  }))
}));

jest.mock('../src/status');

describe('Express Server', () => {
  describe('manifest Route', () => {
    it('should return manifest data for valid route', async () => {
      const response = await request(app)
        .get('/test-token/ls12345/testuser/manifest.json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(response.body).toHaveProperty('id', 'com.github.anhkind');
      expect(response.body).toHaveProperty('name', 'Shared Debrid Notifier');
      expect(response.body).toHaveProperty('resources', ['stream']);
      expect(response.body).toHaveProperty('types', ['movie', 'series', 'channel', 'tv']);
    });

    it('should handle different auth tokens and gist IDs', async () => {
      const response = await request(app)
        .get('/another-token/different-gist/anotheruser/manifest.json')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'com.github.anhkind');
    });

    it('should return 404 for non-manifest routes', async () => {
      await request(app)
        .get('/test-token/ls12345/testuser/wrong-route.json')
        .expect(404);
    });
  });

  describe('Stream Route', () => {
    let mockStatus;
    let mockStatusData;

    beforeEach(() => {
      mockStatusData = {
        canAccess: jest.fn(),
        username: 'anotheruser'
      };
      mockStatus = {
        get: jest.fn().mockResolvedValue(mockStatusData),
        update: jest.fn().mockResolvedValue(undefined)
      };
      Status.mockImplementation(() => mockStatus);
    });

    it('should return empty streams when user can access shared debrid', async () => {
      mockStatusData.canAccess.mockReturnValue(true);

      const response = await request(app)
        .get('/test-token/abc123/testuser/stream/movie/123.json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(Status).toHaveBeenCalledWith('test-token', 'abc123');
      expect(mockStatus.get).toHaveBeenCalled();
      expect(mockStatusData.canAccess).toHaveBeenCalledWith('testuser');
      expect(mockStatus.update).toHaveBeenCalledWith('testuser');
      expect(response.body).toEqual({ streams: [] });
    });

    it('should return warning stream when user cannot access shared debrid', async () => {
      mockStatusData.canAccess.mockReturnValue(false);

      const response = await request(app)
        .get('/valid-token/def456/anotheruser/stream/series/456.json')
        .expect(200);

      expect(Status).toHaveBeenCalledWith('valid-token', 'def456');
      expect(mockStatusData.canAccess).toHaveBeenCalledWith('anotheruser');
      expect(mockStatus.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        streams: [{
          name: 'Shared Debrid',
          description: 'DANGER! anotheruser is accessing!',
          ytId: 'abm8QCh7pBg'
        }]
      });
    });

    it('should handle different content types', async () => {
      mockStatusData.canAccess.mockReturnValue(true);

      const response = await request(app)
        .get('/token/gistid/user/stream/channel/999.json')
        .expect(200);

      expect(response.body).toEqual({ streams: [] });
    });

    it('should handle errors when status retrieval fails', async () => {
      const errorMessage = 'Status not found';
      mockStatus.get.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/invalid-token/badgist/user/stream/movie/789.json')
        .expect(500);

      expect(Status).toHaveBeenCalledWith('invalid-token', 'badgist');
      expect(response.body).toEqual({
        error: 'Failed to fetch streams',
        message: errorMessage
      });
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Bad credentials');
      mockStatus.get.mockRejectedValue(authError);

      const response = await request(app)
        .get('/bad-token/validgist/user/stream/channel/999.json')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch streams');
      expect(response.body.message).toBe('Bad credentials');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockStatus.get.mockRejectedValue(networkError);

      const response = await request(app)
        .get('/token/gistid/user/stream/tv/111.json')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch streams');
      expect(response.body.message).toBe('Network timeout');
    });

    it('should not update status when user cannot access', async () => {
      mockStatusData.canAccess.mockReturnValue(false);

      await request(app)
        .get('/token/gistid/user/stream/movie/222.json')
        .expect(200);

      expect(mockStatusData.canAccess).toHaveBeenCalled();
      expect(mockStatus.update).not.toHaveBeenCalled();
    });

    it('should handle update failures', async () => {
      mockStatusData.canAccess.mockReturnValue(true);
      mockStatus.update.mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .get('/token/gistid/user/stream/series/333.json')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch streams',
        message: 'Update failed'
      });
    });

    it('should work with different usernames', async () => {
      mockStatusData.canAccess.mockImplementation((username) => {
        return username === 'allowed_user';
      });

      const allowedResponse = await request(app)
        .get('/token/gistid/allowed_user/stream/movie/444.json')
        .expect(200);
      expect(allowedResponse.body).toEqual({ streams: [] });

      const deniedResponse = await request(app)
        .get('/token/gistid/denied_user/stream/movie/555.json')
        .expect(200);
      expect(deniedResponse.body.streams[0].name).toBe('Shared Debrid');
    });

    it('should return warning stream when statusData is null', async () => {
      mockStatus.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/token/gistid/user/stream/movie/999.json')
        .expect(200);

      expect(Status).toHaveBeenCalledWith('token', 'gistid');
      expect(mockStatus.get).toHaveBeenCalled();
      expect(mockStatus.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        streams: [{
          name: 'Shared Debrid',
          description: 'DANGER! undefined is accessing!',
          ytId: 'abm8QCh7pBg'
        }]
      });
    });
  });
});
