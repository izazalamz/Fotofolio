const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, role, name, phone } = req.body;
  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const insertUser = db.prepare(
    `INSERT INTO User (email, password_hash, role, name) VALUES (?,?,?,?)`
  );
  const getUser = db.prepare(`SELECT * FROM User WHERE user_id = ?`);

  const insertClient = db.prepare(
    `INSERT INTO Client (user_id, phone) VALUES (?, ?)`
  );
  const insertPhotographer = db.prepare(
    `INSERT INTO Photographer (user_id, phone) VALUES (?, ?)`
  );

  const tx = db.transaction(() => {
    const info = insertUser.run(email, hashed, role, name);
    const user = getUser.get(info.lastInsertRowid);
    if (role === 'client') insertClient.run(user.user_id, phone || null);
    if (role === 'photographer') insertPhotographer.run(user.user_id, phone || null);
    return user;
  });

  try {
    const user = tx();
    return res.json({ ok: true, user_id: user.user_id });
  } catch (e) {
    if (e && String(e).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare(`SELECT * FROM User WHERE email = ?`).get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '7d' }
  );
  res.json({ token, role: user.role, name: user.name });
});

module.exports = router;



