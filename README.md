Fronted req,res 
Here’s the minimal API contract your frontend needs to call and what it gets back.

Base URL

Local dev: http://localhost:3001 (or the port you run on)
Auth

Send Authorization: Bearer <token> for protected routes.
Signup

Request:
POST /api/auth/signup
Headers: Content-Type: application/json
Body: { "email": string, "password": string }
Success (201):
{ "token": string, "user": { "id": string, "email": string } }
Errors: 400 (missing fields), 409 (email in use), 500 { "error": string }
Login

Request:
POST /api/auth/login
Headers: Content-Type: application/json
Body: { "email": string, "password": string }
Success (200):
{ "token": string, "user": { "id": string, "email": string } }
Errors: 400, 401, 500 { "error": string }
Add plant

Request:
POST /api/plants
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Fields:
name: string (required)
description: string (optional)
photo: File (optional)
Success (201):
{ "plant": { "id": string, "name": string, "description": string, "photoUrl": string|null, "ownerId": string, "createdAt": string, "updatedAt": string } }
Errors: 400 (missing name), 401 (no/invalid token), 500 { "error": string }
List plants

Request:
GET /api/plants
Headers: Authorization: Bearer <token>
Success (200):
{ "plants": Array<Plant> } with the same plant shape as above
Errors: 401, 500 { "error": string }
Notes

If a plant has a photo, photoUrl is a path like /uploads/<filename> (serve it by hitting that URL on the same base).
Store the JWT token client-side (e.g., localStorage) and attach it on protected calls.
Example (fetch)

Signup/Login:
const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password}) })
const { token, user } = await res.json()
Add plant:
const fd = new FormData(); fd.append('name', name); if (description) fd.append('description', description); if (file) fd.append('photo', file)
await fetch('/api/plants', { method:'POST', headers:{ Authorization: Bearer ${token} }, body: fd })
List:
await fetch('/api/plants', { headers:{ Authorization: Bearer ${token} } })











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
