## Shared Debrid Notifier for Stremio streams

### Deployment
This repo is ready for deploy to any hosting service but For simplicity, let's pick Vercel.

- Fork this Github repo
- Signup/Login on Vercel and connect to Github
- Select the forked repo and deploy

### Github API token
- Create new Github account and verify email, if needed
- Generate a personal access token [https://github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens), 
  - Token name: `Gist`
  - Expiration: `No expiration`
  - Repository access: `Public repositories`
  - Permissions: `Gists`

### Gist ID
- Go to [https://gist.github.com/](https://gist.github.com/) and create a new Gist with any content.
- The URL will change to something like this `https://gist.github.com/abcxyz/123456abcdef123456abcdef`, and the Gist ID is `123456abcdef123456abcdef`

### Username
Actually can be anything just to identify you from others.
