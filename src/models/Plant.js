import mongoose from 'mongoose';

const PlantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        photoUrl: { type: String, default: null },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    },
    { timestamps: true }
);

export const Plant = mongoose.models.Plant || mongoose.model('Plant', PlantSchema);
