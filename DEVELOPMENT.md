# 🚀 Fotofolio Development Guide

This guide explains how to develop the Fotofolio photography portfolio platform using the root package.json configuration.

## 📋 Prerequisites

- **Node.js 14+** and npm
- **Git** for version control
- **Modern web browser** for frontend testing

## 🏗️ Project Structure

```
Fotofolio/
├── package.json              # Root package.json with development scripts
├── Backend/                  # Node.js + Express + SQLite Backend
│   ├── package.json         # Backend dependencies
│   ├── server.js            # Main server file
│   └── ...                  # Other backend files
├── frontend/                 # Vanilla HTML/CSS/JavaScript Frontend
│   ├── index.html           # Main application
│   ├── start.html           # Startup guide
│   └── ...                  # Frontend files
└── DEVELOPMENT.md            # This file
```

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd Fotofolio

# Install all dependencies (root + backend)
npm run install:all

# Initialize database with dummy data
npm run setup
```

### 2. Start Development
```bash
# Start both backend and frontend development servers
npm run dev
```

This will:
- Start the backend server on `http://localhost:3000`
- Start the frontend development server on `http://localhost:8080`
- Open the startup guide in your browser automatically

## 📜 Available Scripts

### Development Scripts
```bash
npm run dev                    # Start both backend and frontend
npm run backend:dev           # Start only backend development server
npm run frontend:dev          # Start only frontend development server
```

### Backend Scripts
```bash
npm run backend:start         # Start backend production server
npm run backend:init-db       # Initialize/reset database
npm run backend:test-data     # Verify dummy data
npm run backend:test-server   # Test basic server functionality
npm run backend:troubleshoot  # Run diagnostics
```

### Utility Scripts
```bash
npm run install:all           # Install root + backend dependencies
npm run setup                 # Full setup (install + init database)
npm run start                 # Start production backend
npm run test                  # Run backend tests
npm run clean                 # Clean all dependencies and data
npm run reset                 # Clean and reset everything
```

## 🔧 Development Workflow

### 1. Daily Development
```bash
# Start development servers
npm run dev

# Backend will be available at: http://localhost:3000
# Frontend will be available at: http://localhost:8080
# API endpoints: http://localhost:3000/api/*
```

### 2. Backend Development
- Backend runs with `nodemon` for auto-restart on file changes
- Database changes require running `npm run backend:init-db`
- Check `Backend/README.md` for detailed backend documentation

### 3. Frontend Development
- Frontend uses `live-server` for auto-reload on file changes
- No build step required - just edit HTML/CSS/JS files
- Check `frontend/README.md` for detailed frontend documentation

### 4. Database Development
```bash
# Reset database with fresh data
npm run backend:init-db

# Verify data integrity
npm run backend:test-data
```

## 🌐 Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | `http://localhost:3000` | Express server with API endpoints |
| **Frontend App** | `http://localhost:8080` | Main application |
| **Startup Guide** | `http://localhost:8080/start.html` | Status checker and quick start |
| **API Health** | `http://localhost:3000/health` | Backend health check |
| **API Docs** | `http://localhost:3000/api/*` | All API endpoints |

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the ports
lsof -i :3000  # Backend port
lsof -i :8080  # Frontend port

# Kill processes if needed
kill -9 <PID>
```

#### 2. Database Issues
```bash
# Reset database completely
npm run reset

# Or just reinitialize
npm run backend:init-db
```

#### 3. Dependencies Issues
```bash
# Clean and reinstall everything
npm run clean
npm run install:all
```

#### 4. Backend Won't Start
```bash
# Run diagnostics
npm run backend:troubleshoot

# Check Node.js version
node --version  # Should be 14+
```

### Debug Mode

#### Backend Debug
```bash
# Set environment variable
NODE_ENV=development npm run backend:dev

# Or edit Backend/config.env
NODE_ENV=development
```

#### Frontend Debug
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## 📱 Testing

### Backend Testing
```bash
# Test server startup
npm run backend:test-server

# Verify database data
npm run backend:test-data

# Run API tests
cd Backend && node test-api.js
```

### Frontend Testing
- Open `http://localhost:8080/start.html` for status check
- Test responsive design on different screen sizes
- Verify all interactive features work
- Check browser console for errors

### Full Stack Testing
```bash
# Start development servers
npm run dev

# Test authentication flow
# Test photo interactions
# Test search functionality
# Test responsive design
```

## 🚀 Production Deployment

### Backend Deployment
```bash
# Install production dependencies
cd Backend && npm install --production

# Start production server
npm run start
```

### Frontend Deployment
- Frontend is static files - deploy to any web server
- CDN, Netlify, Vercel, or traditional hosting
- No build process required

## 🔄 Continuous Development

### File Watching
- **Backend**: `nodemon` watches for file changes and restarts server
- **Frontend**: `live-server` watches for file changes and reloads browser

### Hot Reload
- Backend changes trigger server restart
- Frontend changes trigger browser reload
- Database changes require manual reinitialization

### Development Tips
1. **Keep both servers running** with `npm run dev`
2. **Use the startup guide** (`start.html`) to check system status
3. **Monitor console output** for both backend and frontend
4. **Test frequently** as you make changes
5. **Use browser dev tools** for frontend debugging

## 📚 Additional Resources

- **Backend Documentation**: `Backend/README.md`
- **Frontend Documentation**: `frontend/README.md`
- **Main Project README**: `README.md`
- **API Endpoints**: Check `Backend/routes/` files
- **Database Schema**: Check `Backend/database/init.js`

## 🤝 Contributing

### Development Guidelines
1. Use the provided scripts for common tasks
2. Keep both development servers running during development
3. Test changes on both backend and frontend
4. Follow existing code patterns and structure
5. Update documentation for new features

### Code Style
- Backend: Follow Node.js/Express best practices
- Frontend: Use vanilla JavaScript, modern CSS, semantic HTML
- Database: Follow SQLite best practices
- Documentation: Keep READMEs and guides updated

---

**Happy Coding! 🎉**

The Fotofolio platform is designed to be developer-friendly with comprehensive tooling and clear development workflows.
