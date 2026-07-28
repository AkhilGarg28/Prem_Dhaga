import { Schema, model } from 'mongoose';

const collectionSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    coverImage: { type: String },
    bannerImage: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Collection = model('Collection', collectionSchema);
