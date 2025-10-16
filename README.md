# Herbar Backend

Node.js/Express backend for the Herbar app with MongoDB storage.

Endpoints:
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/plants (with photo)
- GET /api/plants

## Quick start

1) Env + install
```sh
cp .env.example .env
npm install
```

2) Start MongoDB (choose one)
- Local Mongo (brew): ensure mongod is running on mongodb://127.0.0.1:27017
- Docker:
```sh
docker compose up -d
```

3) Run the server
```sh
npm run dev
```
Dev server: http://localhost:3001 (set PORT in .env or script)

## API

- POST /api/auth/signup
  - body: { email, password }
  - returns: { token, user }

- POST /api/auth/login
  - body: { email, password }
  - returns: { token, user }

- POST /api/plants
  - headers: Authorization: Bearer <token>
  - content-type: multipart/form-data
  - fields: name (required), description (optional), photo (file, optional)
  - returns: { plant }

- GET /api/plants
  - headers: Authorization: Bearer <token>
  - returns: { plants: [...] }

Uploads are served at /uploads/<filename>.

## Config
- JWT_SECRET: required for auth tokens
- MONGODB_URI: e.g. mongodb://127.0.0.1:27017/herbar

## Notes
- Data is now stored in MongoDB (Mongoose models: User, Plant). The JSON file store is deprecated.
- For production: harden validation, add rate limiting, and configure persistent storage for Mongo.