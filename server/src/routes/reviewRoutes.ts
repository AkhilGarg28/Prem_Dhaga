import { Router } from 'express';
import {
  getReviewsByProduct,
  submitReview,
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  toggleReviewFeatured,
} from '../controllers/reviewController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public review routes
router.get('/product/:productId', getReviewsByProduct);
router.post('/', authenticateJWT, submitReview);

// Admin moderation routes
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager', 'customer_support', 'super_admin'), getAllReviews);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager', 'customer_support', 'super_admin'), updateReviewStatus);
router.put('/:id/reply', authenticateJWT, authorizeRoles('admin', 'manager', 'customer_support', 'super_admin'), replyToReview);
router.put('/:id/featured', authenticateJWT, authorizeRoles('admin', 'manager', 'customer_support', 'super_admin'), toggleReviewFeatured);

export default router;
