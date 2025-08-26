const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings/:id/select (client/admin)
router.post('/:id/select', authRequired(['client', 'admin']), (req, res) => {
  const bookingId = Number(req.params.id);
  const { application_id } = req.body;
  if (!application_id) return res.status(400).json({ error: 'application_id required' });

  const tx = db.transaction(() => {
    // 1. Check if booking exists and is selectable
    const booking = db.prepare(`SELECT status FROM Booking WHERE booking_id = ?`).get(bookingId);
    if (!booking || !['OPEN', 'IN_REVIEW'].includes(booking.status)) {
      throw new Error('Booking not selectable');
    }

    // 2. Verify application exists, belongs to this booking, and is PENDING
    const appRow = db.prepare(`
      SELECT booking_id, photographer_id, status
      FROM Booking_Application
      WHERE application_id = ?
    `).get(application_id);
    
    if (!appRow) throw new Error('Application not found');
    if (appRow.booking_id !== bookingId) throw new Error('Application does not belong to this booking');
    if (appRow.status !== 'PENDING') throw new Error('Application is not pending');

    // 3. Update booking: set photographer_id and status to LOCKED
    db.prepare(`UPDATE Booking SET photographer_id = ?, status = 'LOCKED' WHERE booking_id = ?`)
      .run(appRow.photographer_id, bookingId);

    // 4. Set chosen application to ACCEPTED
    db.prepare(`UPDATE Booking_Application SET status = 'ACCEPTED' WHERE application_id = ?`)
      .run(application_id);

    // 5. Set other PENDING applications on the same booking to REJECTED
    db.prepare(`
      UPDATE Booking_Application
      SET status = 'REJECTED'
      WHERE booking_id = ? AND application_id != ? AND status = 'PENDING'
    `).run(bookingId, application_id);

    return { photographer_id: appRow.photographer_id };
  });

  try {
    const { photographer_id } = tx();
    res.json({ 
      booking_id: bookingId, 
      status: 'LOCKED', 
      photographer_id, 
      selected_application_id: application_id 
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
