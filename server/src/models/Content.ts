import { Schema, model } from 'mongoose';

const contentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Content = model('Content', contentSchema);
