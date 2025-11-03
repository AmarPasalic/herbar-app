import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();

router.post('/signup', async (req, res, next) => {
    const { email, password, fullName, department, school } = req.body || {};
    if (!email || !password || !fullName || !department || !school) {
        return res.status(400).json({ error: 'fullName, department, school, email and password are required' });
    }
    try {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ error: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 10);
        const userDoc = await User.create({ email, passwordHash, fullName, department, school });

        const token = jwt.sign({ sub: userDoc._id.toString(), email: userDoc.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: userDoc._id.toString(), email: userDoc.email, fullName: userDoc.fullName, department: userDoc.department, school: userDoc.school } });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
        const userDoc = await User.findOne({ email: email.toLowerCase() });
        if (!userDoc) return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, userDoc.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ sub: userDoc._id.toString(), email: userDoc.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: userDoc._id.toString(), email: userDoc.email } });
    } catch (err) {
        next(err);
    }
});

export default router;
