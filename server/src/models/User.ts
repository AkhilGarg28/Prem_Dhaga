import { Schema, model } from 'mongoose';

const addressSchema = new Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, default: 'India' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  size: { type: Number, required: true },
  swatchHex: { type: String, required: true },
  swatchName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    profilePhoto: { type: String },
    role: {
      type: String,
      enum: [
        'super_admin',
        'admin',
        'manager',
        'product_manager',
        'inventory_manager',
        'orders_manager',
        'customer_support',
        'content_editor',
        'content_manager',
        'marketing_manager',
        'finance_manager',
        'customer',
      ],
      default: 'customer',
    },
    savedAddresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cart: [cartItemSchema],
    preferredPaymentMethod: { type: String, default: 'Razorpay' },
    language: { type: String, default: 'English' },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email is already unique — auto-indexed by MongoDB
userSchema.index({ role: 1 });                                    // admin user role filtering
userSchema.index({ phone: 1 }, { sparse: true });                 // phone OTP lookup (sparse: allows nulls)
userSchema.index({ wishlist: 1 });                                 // find users who wishlisted a product
userSchema.index({ createdAt: -1 });                               // admin customer list (newest first)

export const User = model('User', userSchema);
