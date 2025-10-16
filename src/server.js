import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectToMongo } from './lib/mongo.js';

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev-secret-change-me';
    console.warn('JWT_SECRET not set. Using a dev default. Set JWT_SECRET in .env for security.');
}

const PORT = process.env.PORT || 3000;

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

start();
