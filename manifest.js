const manifest = {
  "id": "com.github.anhkind",
  "version": "1.0.0",

  "name": "AAA Stremio addon",
  "description": "Shared user notifier for Stremio",

  // set what type of resources we will return
  "resources": [
    "catalog",
    "stream"
  ],

  "types": ["movie", "series", "channel", "tv"], // your add-on will be preferred for those content types

  // set catalogs, we'll be making 2 catalogs in this case, 1 for movies and 1 for series
  "catalogs": [
    {
      type: 'movie',
      id: 'helloworldmovies'
    },
    {
      type: 'series',
      id: 'helloworldseries'
    }
  ],

  // prefix of item IDs (ie: "aaa0032138")
  "idPrefixes": [ "aaa" ]

};

module.exports = manifest;
