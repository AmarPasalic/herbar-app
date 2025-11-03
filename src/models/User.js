import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        fullName: { type: String, required: false, trim: true },
        department: { type: String, required: false, trim: true },
        school: { type: String, required: false, trim: true },
    },
    { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
