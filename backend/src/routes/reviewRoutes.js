import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import {
  addReview,
  listReviews,
  deleteReview
} from '../controllers/reviewController.js';

const router = Router();

router.get('/:id', listReviews);

router.post('/:id', authenticate, authorizeRoles('customer', 'organizer', 'admin'), addReview);

// ✅ DELETE review
router.delete('/:id', authenticate, authorizeRoles('customer', 'admin'), deleteReview);

export default router;