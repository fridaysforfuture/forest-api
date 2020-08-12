# forest-api

This is the API component for Forest. Forest is divided into a frontend, an API (this repository) and a renderer.
The API works with JWT to authenticate users.

## Requirements:
- A mongo instance running on localhost
- The signing key/secret for the JWT in key.rs


## Installation:
```
npm i
echo $key >key.rs
npm start
```
