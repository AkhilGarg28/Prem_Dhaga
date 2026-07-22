import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  simulatePaymentSuccess,
  razorpayWebhook,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderCourier,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { checkoutLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public webhook and verification routes
router.post('/', checkoutLimiter, createOrder);  // checkout rate-limited
router.post('/verify-payment', verifyPayment);
router.post('/simulate-success', simulatePaymentSuccess);
router.post('/webhook', razorpayWebhook);

// Customer order routes
router.get('/my-orders', authenticateJWT, getMyOrders);
router.get('/detail/:id', getOrderById);
router.post('/:id/cancel', authenticateJWT, cancelOrder);

// Admin order routes
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), getAllOrders);
router.put('/:id/courier', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), updateOrderCourier);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), updateOrderStatus);

export default router;
