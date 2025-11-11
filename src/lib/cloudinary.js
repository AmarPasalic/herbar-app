import { v2 as cloudinary } from 'cloudinary';

const hasUrl = !!process.env.CLOUDINARY_URL;
const hasParts = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

export const cloudinaryEnabled = hasUrl || hasParts;

if (cloudinaryEnabled) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

export { cloudinary };
