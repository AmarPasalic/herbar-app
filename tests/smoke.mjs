import request from 'supertest';
import dotenv from 'dotenv';
import { app } from '../src/app.js';
import { connectToMongo } from '../src/lib/mongo.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const email = `tester+${Date.now()}@example.com`;
const password = 'test1234';

async function run() {
    dotenv.config();
    if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'test-secret';
    }
    await connectToMongo();

    // Signup
    const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({ email, password, fullName: 'Test User', department: 'Informatika', school: 'Gimnazija' })
        .set('Content-Type', 'application/json');
    console.log('Signup status:', signupRes.status);
    if (signupRes.status !== 201 && signupRes.status !== 409) {
        console.error('Unexpected signup response:', signupRes.status, signupRes.text);
        process.exit(1);
    }

    // Login
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .set('Content-Type', 'application/json');
    console.log('Login status:', loginRes.status);
    if (loginRes.status !== 200) {
        console.error('Login failed:', loginRes.status, loginRes.text);
        process.exit(1);
    }
    const token = loginRes.body.token;

    // List plants (baseline)
    const listRes = await request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${token}`);
    console.log('List plants status:', listRes.status, 'count:', listRes.body.plants?.length ?? 'n/a');
    if (listRes.status !== 200) {
        console.error('List plants failed:', listRes.status, listRes.text);
        process.exit(1);
    }
    const beforeCount = listRes.body.plants?.length || 0;

    // Create a tiny fake image file for upload
    const tmpDir = path.join(process.cwd(), 'tests', 'tmp');
    fs.mkdirSync(tmpDir, { recursive: true });
    const imgPath = path.join(tmpDir, 'pixel.jpg');
    // Minimal JPEG header bytes (not a valid photo, but enough for upload test)
    const jpgBytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    fs.writeFileSync(imgPath, jpgBytes);

    // Add plant
    const addRes = await request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Test Plant')
        .field('description', 'Added by smoke test')
        .attach('photo', imgPath);
    console.log('Add plant status:', addRes.status);
    if (addRes.status !== 201) {
        console.error('Add plant failed:', addRes.status, addRes.text);
        process.exit(1);
    }

    // List plants after add
    const listAfterRes = await request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${token}`);
    console.log('List plants after status:', listAfterRes.status, 'count:', listAfterRes.body.plants?.length ?? 'n/a');
    if (listAfterRes.status !== 200 || (listAfterRes.body.plants?.length || 0) < beforeCount + 1) {
        console.error('List after add failed or count did not increase');
        process.exit(1);
    }

    await mongoose.connection.close();
    console.log('Smoke test OK');
}

run().catch(err => {
    console.error('Smoke test error:', err);
    process.exit(1);
});
