import serverless from 'serverless-http';
import { app } from '../src/app.js';
import { connectToMongo } from '../src/lib/mongo.js';

const handler = serverless(app);

export default async function vercelHandler(req, res) {
    await connectToMongo();
    return handler(req, res);
}
