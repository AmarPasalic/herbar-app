import dotenv from 'dotenv';
dotenv.config();

// Removed serverless-http; Vercel's @vercel/node expects a (req, res) handler
import { app } from './app.js';
import { connectToMongo } from './lib/mongo.js';

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev-secret-change-me';
    console.warn('JWT_SECRET not set. Using a dev default. Set JWT_SECRET in .env for security.');
}

const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;

async function start() {
    try {
        await connectToMongo();
        app.listen(PORT, () => {
            console.log(`Herbar API listening on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Export Express-compatible handler for Vercel
export default async function handler(req, res) {
    try {
        await connectToMongo();
    } catch (e) {
        // If DB connect fails, still respond with a 500 instead of hanging
        console.error('Mongo connection error in handler:', e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'db_connect_failed' }));
        return;
    }
    // Delegate to Express app
    return app(req, res);
}

// Start HTTP server only outside Vercel/serverless and tests
if (!IS_VERCEL && process.env.NODE_ENV !== 'test') {
    start();
}
