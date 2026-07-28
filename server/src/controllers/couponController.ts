import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';

// Retrieve all active coupons
export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json(coupons);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Create a new coupon (Admin)
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isFirstOrderOnly,
      isAutoApply,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ error: 'Code, discount type, and value are required.' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) return res.status(400).json({ error: 'Coupon code already exists.' });

    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isFirstOrderOnly: Boolean(isFirstOrderOnly),
      isAutoApply: Boolean(isAutoApply),
    });

    await coupon.save();
    return res.status(201).json(coupon);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update an existing coupon (Admin)
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isFirstOrderOnly,
      isAutoApply,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found.' });

    if (code && code.toUpperCase().trim() !== coupon.code) {
      const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
      if (existing) return res.status(400).json({ error: 'Another coupon with this code already exists.' });
      coupon.code = code.toUpperCase().trim();
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount);
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : undefined;
    if (isFirstOrderOnly !== undefined) coupon.isFirstOrderOnly = Boolean(isFirstOrderOnly);
    if (isAutoApply !== undefined) coupon.isAutoApply = Boolean(isAutoApply);
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();
    return res.status(200).json(coupon);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Validate and apply a coupon
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon code is invalid or inactive.' });

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ error: 'Coupon code has expired.' });
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon code has reached its maximum usage limit.' });
    }

    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required to apply this coupon.` });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'flat') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    }

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Toggle coupon active state
export const toggleCouponState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found.' });

    return res.status(200).json(coupon);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Coupon deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
