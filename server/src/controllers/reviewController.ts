import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { AuthenticatedRequest } from '../middleware/auth';

// Retrieve approved reviews for a specific product
export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, status: 'approved' }).sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Customer submits a review
export const submitReview = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const { productId, name, rating, comment, images } = req.body;

    if (!productId || !name || !rating) {
      return res.status(400).json({ error: 'Product ID, name, and rating (1-5) are required.' });
    }

    const review = new Review({
      productId,
      userId: authReq.user.id,
      name,
      rating: Number(rating),
      comment: comment || '',
      images: images || [],
      status: 'approved', // Auto-approved for offline testing, but fully toggleable by admin
    });

    await review.save();
    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- ADMIN REVIEW OPERATIONS ---
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().populate('productId', 'name').sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    return res.status(200).json(review);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const replyToReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    const review = await Review.findByIdAndUpdate(id, { adminReply }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    return res.status(200).json(review);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const toggleReviewFeatured = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    review.isFeatured = !review.isFeatured;
    await review.save();

    return res.status(200).json(review);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
