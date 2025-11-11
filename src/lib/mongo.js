import mongoose from 'mongoose';

let cached = {
    isConnected: false,
    connecting: null,
};

export async function connectToMongo(uri) {
    if (cached.isConnected) return mongoose.connection;
    if (cached.connecting) return cached.connecting;

    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/herbar';
    if (!uri && !process.env.MONGODB_URI) {
        console.warn('MONGODB_URI not set. Using default mongodb://127.0.0.1:27017/herbar');
    }

    mongoose.set('strictQuery', true);

    const maxAttempts = parseInt(process.env.MONGO_CONNECT_ATTEMPTS || '3', 10);
    const baseDelay = 300; // ms

    async function attempt(n) {
        try {
            await mongoose.connect(mongoUri, {
                autoIndex: true,
                serverSelectionTimeoutMS: 8000,
            });
            cached.isConnected = true;
            return mongoose.connection;
        } catch (err) {
            if (n >= maxAttempts) throw err;
            const delay = baseDelay * Math.pow(2, n - 1);
            await new Promise(r => setTimeout(r, delay));
            return attempt(n + 1);
        }
    }

    cached.connecting = attempt(1).finally(() => {
        cached.connecting = null;
    });
    return cached.connecting;
}
