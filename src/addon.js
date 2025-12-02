const { addonBuilder } = require('stremio-addon-sdk')

const manifest = require('./manifest')
const builder = new addonBuilder(manifest);

// takes function(args), returns Promise
builder.defineStreamHandler(function(args) {
  return Promise.resolve({
    streams: [
      {
        name:        'Shared Account',
        description: 'DANGER! Being used',
        ytId :       'abm8QCh7pBg' // BTS - Danger
      },
      {
        name:        'Shared Account',
        description: 'Safe and ready to use',
        ytId :       'dQw4w9WgXcQ' // Rick Astley - Never Gonna Give You Up
      },
    ]
  });
})

module.exports = builder.getInterface();
