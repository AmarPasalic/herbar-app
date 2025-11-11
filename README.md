# Herbar Backend API Guide

Comprehensive API contract and integration notes for the Herbar frontend.

## Base URLs
- Local: http://localhost:3001
- Production: https://<your-vercel-app>.vercel.app

Set API_URL in your frontend (e.g., NEXT_PUBLIC_API_URL or VITE_API_URL) and prefix all requests.

## Authentication
- JWT Bearer tokens.
- Signup/Login return { token, user }.
- Add header: Authorization: Bearer <token> for protected routes.

## Data Models
User:
{
  "id": "string",
  "email": "string",
  "fullName": "string",
  "department": "string",
  "school": "string"
}

Plant:
{
  "id": "string",
  "name": "string",
  "description": "string",
  "photoUrl": "string|null",
  "ownerId": "string",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}

## Endpoints

### POST /api/auth/signup
Body (JSON):
{
  "email": "user@example.com",
  "password": "secret",
  "fullName": "Ime Prezime",
  "department": "Informatika",
  "school": "Gimnazija"
}

Success 201:
{ "token": "...", "user": User }

Errors: 400 (missing), 409 (duplicate), 500.

### POST /api/auth/login
Body (JSON):
{ "email": "user@example.com", "password": "secret" }

Success 200:
{ "token": "...", "user": { "id": "...", "email": "..." } }

Errors: 400, 401, 500.

### POST /api/plants
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Fields: name (required), description (optional), photo (file optional)

Success 201:
{ "plant": Plant }

Errors: 400, 401, 500.

### GET /api/plants
Headers: Authorization: Bearer <token>

Success 200:
{ "plants": [Plant, ...] }

Errors: 401, 500.

### GET /api/health
Success 200:
{ "ok": true, "mongo": "connected" }

Note: In production, this may be blocked by Vercel Deployment Protection (401) if enabled.

## Fetch Examples
Login:
const res = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await res.json();

Add plant:
const fd = new FormData();
fd.append('name', name);
if (description) fd.append('description', description);
if (file) fd.append('photo', file);
await fetch(`${API_URL}/api/plants`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: fd
});

List plants:
const res = await fetch(`${API_URL}/api/plants`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { plants } = await res.json();

## Images
- Local (no Cloudinary): photoUrl like /uploads/<filename>; render with `${API_URL}${photoUrl}`.
- Production with Cloudinary: absolute HTTPS URL (persistent).
- Production without Cloudinary: not persistent (avoid relying on it).

## Rate Limits (defaults)
- Auth: ~100 requests / 15 min / IP
- Plant create: ~25 requests / hour / IP

## CORS
- Dev: open.
- Prod: set CORS_ORIGIN to allowed origins (comma-separated).

## Environment Variables (Backend)
Required: JWT_SECRET, MONGODB_URI
Optional: CORS_ORIGIN, CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET), RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, RATE_LIMIT_PLANT_CREATE_MAX, MONGO_CONNECT_ATTEMPTS

## Frontend Checklist
1. Set API_URL
2. Implement signup/login; store token safely
3. Attach bearer token header
4. If photoUrl doesn’t start with http, prefix with API_URL
5. Handle 401 by redirecting to login

## Error Format
All errors return JSON: { "error": "message" }

## Quick Start (Backend Dev)
1) cp .env.example .env
2) npm install
3) docker compose up -d   # or run local mongod
4) npm run dev

Server runs at http://localhost:3001

## Deployment (Vercel)
1. Push repo
2. Import in Vercel
3. Set env vars
4. Deploy (API under /api)
5. Configure Cloudinary for durable images

## Future Enhancements
- Update/Delete plants
- Pagination & filtering
- Stronger validation (email/password)
- Public plant sharing endpoint
