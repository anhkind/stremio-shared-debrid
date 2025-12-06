## Stremio Shared Debrid - shared debrid notifier for Stremio streams
Debrid services like `real-debrid` only allow 1 stream connection from 1 IP at a time, any violation might result in permanent ban. 
This addon helps solve this situation by adding a warning on top of the stream list if the debrid account might be used by someone else:
```
Shared Debrid
DANGER! {other username} is watching! Waiting time: X mins
```     

### Disclaimer
_This addon is provided as-is, without any warranties or guarantees of any kind. It does not collect, store, or transmit any personal data. Use this addon entirely at your own risk._

### Configure
![Configure](https://raw.githubusercontent.com/anhkind/stremio-shared-debrid/master/images/configure.png "Configure")

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

#### _Why Gist?_
We need a place to store the estimated ended time of the last user for the shares debrid. With Gist,
we have it free and the Github Rest API is simple to use.

We will have this data under `shared-debrid.json` file of the gist like this:
```json
{
  "username": "YourName",
  "endedAt": "2025-11-11T02:46:06.410Z"
}
```

#### _How do we know if the other user is actually using debrid service?_

We don't know! We only keep their estimated ended time whenever they're about to open a debrid stream.
If the estimated ended time has not been reached yet, we will see this warning displayed in the stream selection screen:

```
Shared Debrid
DANGER! {other username} is watching! Waiting time: X mins
```     

#### _Does the addon block/lock the streams when the warning is shown?_
**NO, the addon does NOT block/lock anything** as its just tries to give warning when the debrid service _might_ be used by others. 
If we're confident that the debrid service is NOT being used, we can just ignore the warning and select streams like normal.  

#### _Why is the "DANGER!" warning above not displayed on top but somewhere in the middle of the stream list?_
From our testing, it seems that the addon that was installed first will be displayed closer to the top of the stream list. 
- _Manually_, to make warning displayed on top, just try to uninstall the debrid addons (Torrentio?), install this addon, 
then install the debrid addons again, OR
- Use any Addon manager to change the order of the installed addons.

### Self-host 
This repo is ready for deploy to any hosting service but for simplicity, let's pick Vercel.

- Fork this Github repo
- Signup/Login on Vercel and connect to Github
- Select the forked repo and deploy
