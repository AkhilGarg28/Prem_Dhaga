import { Schema, model, Types } from 'mongoose';

const swatchSchema = new Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }, // e.g. #FAF6EF
  textureUrl: { type: String }, // optional Cloudinary image url for fabric texture mapping
});

const sizePriceSchema = new Schema({
  size: { type: Number, required: true }, // 0 to 8
  price: { type: Number, required: true }, // exact price for this size
});

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    images: [{ type: String }], // array of image URLs
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
    sizes: [sizePriceSchema], // price mapping for each size 0-8
    swatches: [swatchSchema], // colors/fabric variants for R3F swatches
    stock: { type: Number, default: 10 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = model('Product', productSchema);
