const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings/:id/applications (photographer/admin)
router.post('/:id/applications', authRequired(['photographer', 'admin']), (req, res) => {
  const bookingId = Number(req.params.id);
  const photographerRow = db
    .prepare(`SELECT photographer_id FROM Photographer WHERE user_id = ?`)
    .get(req.user.user_id);
  if (!photographerRow && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Photographer profile not found' });
  }
  try {
    const stmt = db.prepare(
      `INSERT INTO Booking_Application (booking_id, photographer_id) VALUES (?, ?)`
    );
    const pid = req.user.role === 'admin' && !photographerRow ? null : photographerRow.photographer_id;
    stmt.run(bookingId, pid);
    res.status(201).json({ ok: true });
  } catch (e) {
    if (String(e).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Already applied' });
    }
    return res.status(500).json({ error: 'Failed to apply' });
  }
});

// GET /api/bookings/:id/applications (client owner)
router.get('/:id/applications', authRequired(['client', 'admin']), (req, res) => {
  const bookingId = Number(req.params.id);
  const booking = db
    .prepare(`SELECT * FROM Booking WHERE booking_id = ?`)
    .get(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Ensure ownership unless admin
  if (req.user.role !== 'admin') {
    const clientRow = db
      .prepare(`SELECT client_id FROM Client WHERE user_id = ?`)
      .get(req.user.user_id);
    if (!clientRow || clientRow.client_id !== booking.client_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const rows = db
    .prepare(
      `SELECT BA.application_id, BA.status, BA.application_date,
              P.photographer_id, U.name AS photographer_name,
              (SELECT COUNT(*) FROM Portfolio pf WHERE pf.photographer_id = P.photographer_id) AS portfolio_count
       FROM Booking_Application BA
       JOIN Photographer P ON P.photographer_id = BA.photographer_id
       JOIN User U ON U.user_id = P.user_id
       WHERE BA.booking_id = ?
       ORDER BY BA.application_date DESC`
    )
    .all(bookingId);
  res.json(rows);
});

module.exports = router;



