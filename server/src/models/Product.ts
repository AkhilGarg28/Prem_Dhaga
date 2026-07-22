import { Schema, model } from 'mongoose';

const swatchSchema = new Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }, // e.g. #FAF6EF
  textureUrl: { type: String }, // optional Cloudinary image url for fabric texture mapping
});

const sizePriceSchema = new Schema({
  size: { type: Number, required: true }, // 0 to 8
  price: { type: Number, required: true }, // exact price for this size
});

const inventoryHistorySchema = new Schema({
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, unique: true, sparse: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    images: [{ type: String }], // array of image URLs
    images360: [{ type: String }], // array of URLs for 360 viewer
    videoUrl: { type: String },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
    sizes: [sizePriceSchema], // price mapping for each size 0-8
    swatches: [swatchSchema], // colors/fabric variants for R3F swatches
    stock: { type: Number, default: 10 },
    weight: { type: Number, default: 200 }, // grams
    barcode: { type: String },
    subCategory: { type: String },
    gstRate: { type: Number, default: 12 }, // GST percentage (5%, 12%, 18%)
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    fabric: { type: String },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },
    inventoryHistory: [inventoryHistorySchema],
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// slug is already unique — MongoDB auto-creates a unique index
// Additional compound indexes for catalog query patterns
productSchema.index({ collectionId: 1, status: 1 });              // browse by collection
productSchema.index({ status: 1, isFeatured: 1 });                 // featured products query
productSchema.index({ status: 1, isTrending: 1 });                 // trending products query
productSchema.index({ status: 1, isBestSeller: 1 });               // best-sellers query
productSchema.index({ tags: 1, status: 1 });                       // tag-filtered searches
productSchema.index({ basePrice: 1, status: 1 });                  // price sort/filter
productSchema.index({ createdAt: -1, status: 1 });                 // newest products

export const Product = model('Product', productSchema);
