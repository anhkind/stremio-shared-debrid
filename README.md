## Shared Debrid Notifier for Stremio streams

### Deployment
This repo is ready for deploy to any hosting service but For simplicity, let's pick Vercel.

- Fork this Github repo
- Signup/Login on Vercel and connect to Github
- Select the forked repo and deploy

### Configure
#### Github API token
- Create new Github account and verify email, if needed
- Generate a personal access token [https://github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens), 
  - Token name: `Gist`
  - Expiration: `No expiration`
  - Repository access: `Public repositories`
  - Permissions: `Gists`

#### Gist ID
- Go to [https://gist.github.com/](https://gist.github.com/) and create a new Gist with any content.
- The URL will change to something like this `https://gist.github.com/abcxyz/123456abcdef123456abcdef`, and the Gist ID is `123456abcdef123456abcdef`

#### Username
Actually can be anything just to identify you from others.

### FAQ

#### Why Gist?
We need a place to store the access time of the latest user for the share debrid. With Gist,
we have it free and the Github Rest API is simply to use.

We will have this data under `shared-debrid.json` file of the gist like this:
```json
{
  "username": "Your Name",
  "accessedAt": "2025-11-11T02:46:06.410Z"
}
```

#### How do we know if the other user is actually using debrid service?
We don't know! We only keep their last access time whenever they're about to open a debrid stream.
- If the last access time is 3hrs ago or sooner, we assume that they have completed their streaming session,
and there will be no waring/notification. 
- If the last access time is within 3hrs window from now, we will see this warning displayed in the stream selection screen:
    ```
    Shared Debrid
    DANGER! ${other username} is accessing!
    ```     
