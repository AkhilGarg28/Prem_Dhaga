import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  swatchName: { type: String, required: true },
  swatchHex: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for guests
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cod_pending', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'pending_admin_review',
        'approved',
        'processing',
        'shipped',
        'dispatched',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'pending',
        'paid',
      ],
      default: 'pending_admin_review',
    },
    shipmentStatus: {
      type: String,
      enum: ['not_created', 'created', 'ready_for_dispatch', 'dispatched', 'delivered', 'cancelled'],
      default: 'not_created',
    },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    dispatchedAt: { type: Date },
    shiprocketOrderId: { type: String },
    shipmentId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    activityLog: [
      {
        action: { type: String },
        performedBy: { type: String },
        details: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    trackingTimeline: [
      {
        status: { type: String },
        title: { type: String },
        description: { type: String },
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    pickupDetails: {
      atelierName: { type: String, default: 'Prem Dhaga Main Atelier' },
      contactPhone: { type: String, default: '+91 9876543210' },
      address: { type: String, default: 'Raman Reti Road, Near ISKCON Temple' },
      city: { type: String, default: 'Vrindavan' },
      state: { type: String, default: 'Uttar Pradesh' },
      zip: { type: String, default: '281121' },
      country: { type: String, default: 'India' },
    },
    courierPartner: { type: String, default: 'Delhivery / Shiprocket' },
    awbTrackingNumber: { type: String },
    shippingLabelUrl: { type: String },
    shippingDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
  },
  { timestamps: true }
);

export const Order = model('Order', orderSchema);
