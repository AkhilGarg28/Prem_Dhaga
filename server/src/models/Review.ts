import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    images: [{ type: String }], // customer photo gallery URLs
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // default to approved for ease of testing, but filterable
    },
    adminReply: { type: String },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// productId is already indexed via field definition above
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // one review per user per product
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });    // approved reviews for a product
reviewSchema.index({ status: 1, createdAt: -1 });                   // admin moderation queue
reviewSchema.index({ isFeatured: 1, status: 1 });                   // featured reviews on homepage

export const Review = model('Review', reviewSchema);
