import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { authRequired } from '../middleware/auth.js';
import { Plant } from '../models/Plant.js';
import rateLimit from 'express-rate-limit';
import { cloudinaryEnabled, cloudinary } from '../lib/cloudinary.js';
import streamifier from 'streamifier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

let upload;
if (cloudinaryEnabled) {
    // Use memory storage and upload buffer to Cloudinary in handler
    upload = multer({ storage: multer.memoryStorage() });
} else {
    const storage = multer.diskStorage({
        destination: function (_req, _file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (_req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}-${uuidv4()}${ext}`);
        }
    });
    upload = multer({ storage });
}

const router = Router();

// Create uploads folder if missing
import fs from 'fs';
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Rate limit creation (stricter)
const createLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: parseInt(process.env.RATE_LIMIT_PLANT_CREATE_MAX || '25', 10), standardHeaders: true, legacyHeaders: false });

// POST /api/plants - add a plant (multipart/form-data)
router.post('/', authRequired, createLimiter, upload.single('photo'), async (req, res, next) => {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name is required' });
    let photoFile = null;
    if (req.file) {
        if (cloudinaryEnabled) {
            try {
                photoFile = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: 'herbar' }, (err, result) => {
                        if (err) return reject(err);
                        resolve(result.secure_url);
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            } catch (errUpload) {
                console.error('Cloudinary upload failed, continuing without photo:', errUpload.message);
            }
        } else {
            photoFile = `/uploads/${req.file.filename}`;
        }
    }
    try {
        const plantDoc = await Plant.create({
            name,
            description: description || '',
            photoUrl: photoFile,
            ownerId: req.user.id,
        });
        res.status(201).json({
            plant: {
                id: plantDoc._id.toString(),
                name: plantDoc.name,
                description: plantDoc.description,
                photoUrl: plantDoc.photoUrl,
                ownerId: plantDoc.ownerId.toString(),
                createdAt: plantDoc.createdAt,
                updatedAt: plantDoc.updatedAt,
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/plants - list current user's plants
router.get('/', authRequired, async (req, res, next) => {
    try {
        const docs = await Plant.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
        const plants = docs.map(p => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            photoUrl: p.photoUrl,
            ownerId: p.ownerId.toString(),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
        res.json({ plants });
    } catch (err) {
        next(err);
    }
});

export default router;
