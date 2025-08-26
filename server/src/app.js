const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const applicationsRoutes = require('./routes/applications');
const selectRoutes = require('./routes/select');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Mount routes at different paths to avoid conflicts
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/applications', applicationsRoutes);  // Changed from /api/bookings
app.use('/api/select', selectRoutes);             // Changed from /api/bookings

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Server listening on :${port}`));
}

module.exports = app;
