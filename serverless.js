const app = require('./src/app');

module.exports = (req, res) => {
  // Remove /api prefix if it exists for local testing
  if (req.url.startsWith('/api')) {
    req.url = req.url.substring(4);
  }

  // Handle the configure route specially
  if (req.url === '/configure') {
    // This will be handled by static files
    return res.status(404).json({ error: 'Route not found' });
  }

  // Call the Express app
  app(req, res);
};
