const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')

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
    ]
  });
})

serveHTTP(builder.getInterface(), { port: 7000 });
