const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Fotofolio Backend...');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (available immediately)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fotofolio Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    routes: [
      '/health',
      '/test',
      '/api/auth/*',
      '/api/users/*',
      '/api/photos/*',
      '/api/albums/*',
      '/api/categories/*',
      '/api/comments/*',
      '/api/likes/*'
    ]
  });
});

// Load routes dynamically to avoid startup issues
let routesLoaded = false;

const loadRoutes = async () => {
  try {
    console.log('Loading API routes...');
    
    // Load routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/photos', require('./routes/photos'));
    app.use('/api/albums', require('./routes/albums'));
    app.use('/api/categories', require('./routes/categories'));
    app.use('/api/comments', require('./routes/comments'));
    app.use('/api/likes', require('./routes/likes'));
    
    routesLoaded = true;
    console.log('✅ All API routes loaded successfully');
    
  } catch (error) {
    console.error('❌ Error loading routes:', error.message);
    console.log('Server will start with basic routes only');
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    routesLoaded
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: ['/health', '/test'],
    apiRoutes: routesLoaded ? 'Available' : 'Loading...'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test route: http://localhost:${PORT}/test`);
  
  // Load routes after server starts
  loadRoutes();
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error('Port is already in use. Try a different port or kill the process using this port.');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
