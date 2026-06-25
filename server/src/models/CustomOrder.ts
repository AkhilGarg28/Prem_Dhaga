import { Schema, model } from 'mongoose';

const customOrderSchema = new Schema(
  {
    customOrderId: { type: String, required: true, unique: true },
    clientDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    poshakDetails: {
      size: { type: Number }, // Standard size option 0-8
      customMeasurements: {
        chest: { type: Number }, // in cm/inches
        length: { type: Number },
        ghera: { type: Number },
        capSize: { type: Number },
      },
      fabric: { type: String, required: true }, // Silk, Velvet, Organza, Cotton, Wool
      primaryColor: { type: String, required: true },
      secondaryColor: { type: String },
      embroideryType: { type: String, required: true }, // Zardozi, Gota Patti, Aari, Threadwork, Pintuck
      description: { type: String }, // specific requests (e.g. "Peacock feather pattern on border")
    },
    sketches: [{ type: String }], // Cloudinary URLs of reference images or client sketches
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'quoted', 'paid', 'in_progress', 'shipped', 'delivered'],
      default: 'submitted',
    },
    quotedPrice: { type: Number, default: 0 },
    notes: { type: String }, // Admin notes
  },
  { timestamps: true }
);

export const CustomOrder = model('CustomOrder', customOrderSchema);
