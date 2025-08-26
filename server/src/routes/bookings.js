const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings (client/admin)
router.post('/', authRequired(['client', 'admin']), (req, res) => {
  const { event_date, location, event_type, notes } = req.body;
  if (!event_date) return res.status(400).json({ error: 'event_date required' });

  const getClientByUser = db.prepare(`SELECT client_id FROM Client WHERE user_id = ?`);
  const client = getClientByUser.get(req.user.user_id);
  if (!client && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Client profile not found' });
  }

  const insertBooking = db.prepare(
    `INSERT INTO Booking (client_id, event_date, location, event_type, notes) VALUES (?,?,?,?,?)`
  );
  const insertPayment = db.prepare(
    `INSERT INTO Payment (booking_id, amount, status) VALUES (?,?, 'UNPAID')`
  );

  const tx = db.transaction(() => {
    const clientId = req.user.role === 'admin' && !client ? null : client.client_id;
    const result = insertBooking.run(clientId, event_date, location || null, event_type || null, notes || null);
    insertPayment.run(result.lastInsertRowid, 0);
    return result.lastInsertRowid;
  });

  try {
    const bookingId = tx();
    const booking = db.prepare(`SELECT * FROM Booking WHERE booking_id = ?`).get(bookingId);
    res.status(201).json(booking);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings (public) with filters + pagination
router.get('/', (req, res) => {
  const { status = 'OPEN', q, location, event_type, page = 1, pageSize = 10 } = req.query;
  const limit = Math.max(1, Math.min(100, Number(pageSize)));
  const offset = (Math.max(1, Number(page)) - 1) * limit;

  const conditions = [];
  const params = [];
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (location) {
    conditions.push('location LIKE ?');
    params.push(`%${location}%`);
  }
  if (event_type) {
    conditions.push('event_type LIKE ?');
    params.push(`%${event_type}%`);
  }
  if (q) {
    conditions.push('(notes LIKE ? OR event_type LIKE ? OR location LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM Booking ${where} ORDER BY datetime(event_date) ASC LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) as cnt FROM Booking ${where}`;

  try {
    const total = db.prepare(countSql).get(...params).cnt;
    const rows = db.prepare(sql).all(...params, limit, offset);
    res.json({ total, page: Number(page), pageSize: limit, rows });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list bookings' });
  }
});

// GET /api/bookings/:id
router.get('/:id', (req, res) => {
  const b = db.prepare(`SELECT * FROM Booking WHERE booking_id = ?`).get(req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  res.json(b);
});

module.exports = router;



