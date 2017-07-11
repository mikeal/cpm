## Publish Instructions

[![Greenkeeper badge](https://badges.greenkeeper.io/mikeal/cpm.svg)](https://greenkeeper.io/)

Add the following variables to your Dockerfile

```
CPM_NAME=my-package-name
CPM_VERSION=0.0.1
```

Then use the publish command:

```
node cli.js --publish path/to/docker/dir
```
