const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const db = require('./db');
const { ensurePortfolioSchema } = require('./models/portfolio');
const { ensureReviewSchema } = require('./models/reviews');
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const applicationsRoutes = require('./routes/applications');
const selectRoutes = require('./routes/select');
const portfolioRoutes = require('./routes/portfolio');
const paymentsRoutes = require('./routes/payments');
const reviewsRoutes = require('./routes/reviews');

const app = express();

// Initialize schemas
ensurePortfolioSchema(db);
ensureReviewSchema(db);

app.use(cors());
app.use(express.json());

// Static hosting for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Mount routes at different paths to avoid conflicts
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/applications', applicationsRoutes);  // Changed from /api/bookings
app.use('/api/select', selectRoutes);             // Changed from /api/bookings
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Server listening on :${port}`));
}

module.exports = app;
