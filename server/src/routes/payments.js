const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/payments/:bookingId/pay
router.post('/:bookingId/pay', authRequired(['client', 'admin']), (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount = 0 } = req.body;

    // Get the booking
    const booking = db.prepare(`
      SELECT b.*, c.client_id, c.user_id as client_user_id
      FROM Booking b
      JOIN Client c ON b.client_id = c.client_id
      WHERE b.booking_id = ?
    `).get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if client owns this booking (unless admin)
    if (req.user.role === 'client' && req.user.user_id !== booking.client_user_id) {
      return res.status(403).json({ error: 'Forbidden: You can only pay for your own bookings' });
    }

    // Check if already paid
    const existingPayment = db.prepare('SELECT * FROM Payment WHERE booking_id = ?').get(bookingId);
    if (existingPayment && existingPayment.status === 'PAID') {
      return res.status(400).json({ error: 'Booking is already paid' });
    }

    // Begin transaction
    const transaction = db.transaction(() => {
      // Insert or update payment record
      if (existingPayment) {
        db.prepare(`
          UPDATE Payment 
          SET status = 'PAID', payment_date = datetime('now'), amount = ?
          WHERE booking_id = ?
        `).run(amount, bookingId);
      } else {
        db.prepare(`
          INSERT INTO Payment (booking_id, amount, payment_date, status)
          VALUES (?, ?, datetime('now'), 'PAID')
        `).run(bookingId, amount);
      }

      // Update booking status to COMPLETED if it was LOCKED
      if (booking.status === 'LOCKED') {
        db.prepare('UPDATE Booking SET status = ? WHERE booking_id = ?').run('COMPLETED', bookingId);
      }
    });

    // Execute transaction
    transaction();

    // Get updated payment info
    const payment = db.prepare('SELECT * FROM Payment WHERE booking_id = ?').get(bookingId);
    
    res.json({
      booking_id: parseInt(bookingId),
      payment_status: 'PAID',
      amount: payment.amount,
      payment_date: payment.payment_date
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// GET /api/payments/:bookingId
router.get('/:bookingId', authRequired(['client', 'admin', 'photographer']), (req, res) => {
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

    // Check permissions: client, admin, or the photographer of that booking
    if (req.user.role === 'client' && req.user.user_id !== booking.client_user_id) {
      return res.status(403).json({ error: 'Forbidden: You can only view payments for your own bookings' });
    }
    
    if (req.user.role === 'photographer' && req.user.user_id !== booking.photographer_user_id) {
      return res.status(403).json({ error: 'Forbidden: You can only view payments for your own bookings' });
    }

    // Get payment info
    const payment = db.prepare('SELECT * FROM Payment WHERE booking_id = ?').get(bookingId);
    
    if (!payment) {
      return res.json({
        booking_id: parseInt(bookingId),
        amount: 0,
        status: 'UNPAID',
        payment_date: null
      });
    }

    res.json({
      booking_id: parseInt(bookingId),
      amount: payment.amount,
      status: payment.status,
      payment_date: payment.payment_date
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment information' });
  }
});

module.exports = router;
