import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Coupon } from '../models/Coupon';

dotenv.config();

async function seedCoupons() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prem_dhaga';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri}`);

    const initialCoupons = [
      {
        code: 'RADHE108',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 500,
        maxDiscountAmount: 500,
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'FIRST10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 200,
        maxDiscountAmount: 300,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: 'FLAT300',
        discountType: 'flat',
        discountValue: 300,
        minOrderAmount: 1000,
        usageLimit: 500,
        isActive: true,
      },
    ];

    for (const c of initialCoupons) {
      await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
      console.log(`✅ Coupon [${c.code}] seeded/updated successfully.`);
    }

    console.log('🎉 All default coupons seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding coupons:', error);
    process.exit(1);
  }
}

seedCoupons();
