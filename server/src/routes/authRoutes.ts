import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  syncCart,
} from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Auth — strict rate limiting to prevent credential-stuffing & brute-force
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);

router.get('/addresses', authenticateJWT, getAddresses);
router.post('/addresses', authenticateJWT, addAddress);
router.put('/addresses/:id', authenticateJWT, updateAddress);
router.delete('/addresses/:id', authenticateJWT, deleteAddress);

router.get('/wishlist', authenticateJWT, getWishlist);
router.post('/wishlist', authenticateJWT, addToWishlist);
router.delete('/wishlist/:productId', authenticateJWT, removeFromWishlist);

router.get('/cart', authenticateJWT, getCart);
router.post('/cart', authenticateJWT, syncCart);

export default router;
