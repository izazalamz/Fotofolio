const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews/:bookingId
router.post('/:bookingId', authRequired(['client', 'admin']), (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // Sanitize comment
    const sanitizedComment = comment ? comment.trim().slice(0, 1000) : null;

    // Get the booking with client and photographer info
    const booking = db.prepare(`
      SELECT b.*, c.client_id, c.user_id as client_user_id
      FROM Booking b
      JOIN Client c ON b.client_id = c.client_id
      WHERE b.booking_id = ?
    `).get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if caller is client and owns this booking (unless admin)
    if (req.user.role === 'client' && req.user.user_id !== booking.client_user_id) {
      return res.status(403).json({ error: 'Forbidden: You can only review your own bookings' });
    }

    // Check if booking has a selected photographer
    if (!booking.photographer_id) {
      return res.status(400).json({ error: 'Booking has no selected photographer' });
    }

    // Check if payment exists and is PAID
    const payment = db.prepare('SELECT * FROM Payment WHERE booking_id = ? AND status = ?').get(bookingId, 'PAID');
    if (!payment) {
      return res.status(400).json({ error: 'Payment required before reviewing' });
    }

    // Check if review already exists for this booking
    const existingReview = db.prepare('SELECT * FROM Review WHERE booking_id = ?').get(bookingId);
    if (existingReview) {
      return res.status(400).json({ error: 'Review already submitted for this booking' });
    }

    // Insert the review
    const stmt = db.prepare(`
      INSERT INTO Review (booking_id, client_id, photographer_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(bookingId, booking.client_id, booking.photographer_id, numRating, sanitizedComment);
    
    res.json({
      id: result.lastInsertRowid,
      booking_id: parseInt(bookingId),
      client_id: booking.client_id,
      photographer_id: booking.photographer_id,
      rating: numRating,
      comment: sanitizedComment,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /api/reviews/photographer/:photographerId
router.get('/photographer/:photographerId', (req, res) => {
  try {
    const { photographerId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = parseInt(req.query.offset) || 0;

    // Get reviews for the photographer
    const reviews = db.prepare(`
      SELECT review_id as id, booking_id, client_id, photographer_id, rating, comment, review_date as created_at
      FROM Review 
      WHERE photographer_id = ?
      ORDER BY review_date DESC
      LIMIT ? OFFSET ?
    `).all(photographerId, limit, offset);

    res.json(reviews);

  } catch (error) {
    console.error('Get photographer reviews error:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// GET /api/reviews/summary/:photographerId
router.get('/summary/:photographerId', (req, res) => {
  try {
    const { photographerId } = req.params;

    // Get rating summary
    const summary = db.prepare(`
      SELECT 
        photographer_id,
        AVG(rating) as avg_rating,
        COUNT(*) as reviews_count
      FROM Review 
      WHERE photographer_id = ?
    `).get(photographerId);

    res.json({
      photographer_id: parseInt(photographerId),
      avg_rating: summary ? summary.avg_rating : null,
      reviews_count: summary ? summary.reviews_count : 0
    });

  } catch (error) {
    console.error('Get review summary error:', error);
    res.status(500).json({ error: 'Failed to retrieve review summary' });
  }
});

// GET /api/reviews/booking/:bookingId
router.get('/booking/:bookingId', authRequired(['client', 'admin', 'photographer']), (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get the booking with client and photographer info
    const booking = db.prepare(`
      SELECT b.*, c.user_id as client_user_id, p.user_id as photographer_user_id
      FROM Booking b
      JOIN Client c ON b.client_id = c.client_id
      LEFT JOIN Photographer p ON b.photographer_id = p.photographer_id
      WHERE b.booking_id = ?
    `).get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check permissions
    if (req.user.role === 'client' && req.user.user_id !== booking.client_user_id) {
      return res.status(403).json({ error: 'Forbidden: You can only view reviews for your own bookings' });
    }
    
    if (req.user.role === 'photographer' && req.user.user_id !== booking.photographer_user_id) {
      return res.status(403).json({ error: 'Forbidden: You can only view reviews for your own bookings' });
    }

    // Check if review exists
    const review = db.prepare('SELECT * FROM Review WHERE booking_id = ?').get(bookingId);
    
    if (review) {
      res.json({
        exists: true,
        review: {
          id: review.review_id,
          booking_id: review.booking_id,
          client_id: review.client_id,
          photographer_id: review.photographer_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.review_date
        }
      });
    } else {
      res.json({ exists: false });
    }

  } catch (error) {
    console.error('Get booking review error:', error);
    res.status(500).json({ error: 'Failed to retrieve review information' });
  }
});

module.exports = router;
