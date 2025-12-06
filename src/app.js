const express = require('express');
const cors = require('cors');
const path = require('path');
const manifest = require('./manifest');
const Status = require("./status");

const app = express();
app.use(cors());  // Enable CORS
app.use(express.static('public'));  // Serve static files from public directory

const respond = (res, data) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(data)
}

// Root redirect to configure
app.get('/', (req, res) => {
  res.redirect('/configure');
});

// Configuration route
app.get('/configure', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'configure', 'index.html'));
});

// Manifest route
app.get('/:authToken/:gistId/:username{/:sessionMinutes}/manifest.json', (req, res) => {
  respond(res, manifest);
});

// Stream route
app.get('/:authToken/:gistId/:username{/:sessionMinutes}/stream/:type/:id.json', async (req, res) => {
  const { authToken, gistId, username, sessionMinutes } = req.params;

  try {
    const status = new Status(authToken, gistId);
    const statusData = await status.get();
    if (statusData.canAccess(username)) {
      await status.update(username, sessionMinutes);
      respond(res, { streams: [] });
    } else {
      respond(res, { streams: [{
        name:        'Shared Debrid',
        description: `DANGER! ${statusData.username} is watching! Waiting time: ${statusData.getWaitingMinutes()} mins`,
        ytId :       'abm8QCh7pBg' // BTS - Danger
      }] });
    }
  } catch (error) {
    console.error('Error fetching streams:', error.message);
    res.status(500).json({
      error:    'Failed to fetch streams',
      message:  error.message
    });
  }
});

module.exports = app;
