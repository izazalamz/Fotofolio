const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting test server...');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV);

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Test server is running on port ${PORT}`);
  console.log(`🌐 Try accessing: http://localhost:${PORT}/test`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error('Port is already in use. Try a different port or kill the process using this port.');
  }
});
