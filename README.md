# insidemaps-takehome
A fullstack React + Node app that resizes image files.

---

## Local development guide

### Package Installation
- Install packages with `npm install`
- Install front-end with `cd client && npm install`

### Env file configuration
Create a .env file at the root directory with the following structure
```
ACCESS_KEY_ID=XXXXXX
SECRET_ACCESS_KEY=XXXXXXXX
REGION=XXXXXXXXXXX
BUCKET=XXXXXXXXX
SQS_SUCCESS_URL=XXXXXXXXXX
SQS_FAIL_URL=XXXXXX
```

### Running scripts
- Run server with `npm run server`
- Run worker with `npm run worker`
- Run client with `npm run client`

---

## Front-end libs
- React
- Tailwind

## Back-end libs
- Express
- Nodemon
- AWS SDK
- Sharp
- UUID
- Multer
