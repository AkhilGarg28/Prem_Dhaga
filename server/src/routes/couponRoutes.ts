import { Router } from 'express';
import {
  getAllCoupons,
  createCoupon,
  validateCoupon,
  toggleCouponState,
  deleteCoupon,
} from '../controllers/couponController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

// Validate coupons during checkout
router.post('/validate', validateCoupon);

// Admin controls
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), getAllCoupons);
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), createCoupon);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), toggleCouponState);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), deleteCoupon);

export default router;
