// NOTE: Deprecated: replaced by MongoDB (Mongoose). Keeping for reference.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const dbFile = path.join(dataDir, 'db.json');

function ensureDb() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(dbFile)) {
        const initial = { users: [], plants: [] };
        fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
    }
}

ensureDb();

function readDb() {
    const raw = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(raw);
}

function writeDb(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

export const db = {
    get users() {
        return readDb().users;
    },
    get plants() {
        return readDb().plants;
    },
    addUser(user) {
        const state = readDb();
        state.users.push(user);
        writeDb(state);
        return user;
    },
    findUserByEmail(email) {
        return readDb().users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    addPlant(plant) {
        const state = readDb();
        state.plants.push(plant);
        writeDb(state);
        return plant;
    },
    listPlantsByUser(userId) {
        return readDb().plants.filter(p => p.ownerId === userId);
    }
};
