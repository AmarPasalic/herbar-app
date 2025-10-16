import mongoose from 'mongoose';

let isConnected = false;

export async function connectToMongo(uri) {
    if (isConnected) return mongoose.connection;
    let mongoUri = uri || process.env.MONGODB_URI;
    if (!mongoUri) {
        mongoUri = 'mongodb://127.0.0.1:27017/herbar';
        console.warn('MONGODB_URI not set. Using default mongodb://127.0.0.1:27017/herbar');
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
        autoIndex: true,
    });
    isConnected = true;
    return mongoose.connection;
}
