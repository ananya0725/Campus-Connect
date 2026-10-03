import Review from '../models/Review.js';
import Event from '../models/Event.js';

// ==========================
// ADD REVIEW
// ==========================
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const existingReview = await Review.findOne({
      user: req.user.id,
      event: req.params.id
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this event.'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      event: req.params.id,
      rating,
      comment
    });

    // Update average rating
    const agg = await Review.aggregate([
      { $match: { event: review.event } },
      { $group: { _id: '$event', avg: { $avg: '$rating' } } }
    ]);

    const avg = agg[0]?.avg || 0;

    await Event.findByIdAndUpdate(review.event, {
      averageRating: avg
    });

    res.status(201).json({ review });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'You have already reviewed this event.'
      });
    }

    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// LIST REVIEWS
// ==========================
export const listReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ event: req.params.id })
      .populate('user', 'name');

    res.json({ reviews });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// ✅ DELETE REVIEW (FINAL FIX)
// ==========================
export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};