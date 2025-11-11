import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import plantRoutes from './routes/plant.routes.js';
import { errorHandler } from './middleware/error.js';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

const allowOrigin = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!allowOrigin || allowOrigin.length === 0) return callback(null, true); // allow all by default
        if (!origin) return callback(null, true); // non-browser or same-origin
        if (allowOrigin.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const maxReq = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const authLimiter = rateLimit({ windowMs, max: maxReq, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/plants', plantRoutes);

// Health
app.get('/api/health', async (_req, res) => {
    try {
        // Lazy import to avoid cycle
        const { default: mongoose } = await import('mongoose');
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        const state = states[mongoose.connection.readyState] || 'unknown';
        res.json({ ok: true, mongo: state });
    } catch (e) {
        res.status(500).json({ ok: false, error: 'health_check_failed' });
    }
});

// Error handling
app.use(errorHandler);
