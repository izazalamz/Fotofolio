# 📸 Fotofolio - Photography Portfolio Platform

A complete, robust photography portfolio platform built with Node.js, Express, SQLite, and vanilla HTML/CSS/JavaScript. This project provides a full-stack solution for photographers to showcase their work, interact with other users, and build their online presence.

## 🚀 Project Overview

Fotofolio is a comprehensive photography platform that combines a powerful Node.js backend with a modern, responsive frontend. It features user authentication, photo management, social interactions, and a beautiful user interface that works seamlessly across all devices.

## 🏗️ Architecture

```
Fotofolio/
├── Backend/                 # Node.js + Express + SQLite Backend
│   ├── server.js           # Main server file
│   ├── database/           # Database initialization and connection
│   ├── routes/             # API route handlers
│   ├── middleware/         # Authentication and upload middleware
│   └── package.json        # Backend dependencies
├── frontend/               # Vanilla HTML/CSS/JavaScript Frontend
│   ├── index.html          # Main application
│   ├── start.html          # Startup guide and status checker
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript modules
│   └── README.md           # Frontend documentation
└── README.md               # This file
```

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT
- Profile management and avatar uploads
- Password change functionality
- Secure session management

### 📸 Photo Management
- Photo upload with metadata (title, description, tags)
- Category-based organization
- Album creation and management
- Advanced search and filtering
- Pagination and infinite scroll

### 💬 Social Features
- Like/unlike photos
- Comment system with replies
- Follow/unfollow users
- User activity feeds
- Real-time interactions

### 🎨 User Experience
- Responsive design for all devices
- Modern, clean interface
- Smooth animations and transitions
- Loading states and feedback
- Toast notifications
- Modal dialogs

### 🔧 Technical Features
- RESTful API design
- Comprehensive error handling
- Input validation and sanitization
- File upload handling
- Database relationships and constraints
- Security headers and CORS
- Request logging and monitoring

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing
- **Express-validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **Vanilla JavaScript** - ES6+ features and modules
- **Responsive Design** - Mobile-first approach
- **Progressive Enhancement** - Works without JavaScript

### Database
- **SQLite3** - Lightweight, serverless database
- **Foreign Key Constraints** - Data integrity
- **Indexes** - Query optimization
- **Comprehensive Schema** - Users, photos, albums, categories, comments, likes, tags, followers

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Modern web browser
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Fotofolio
```

### 2. Start Development (Recommended)

#### Option A: Using npm scripts
```bash
# Install all dependencies and setup database
npm run setup

# Start both backend and frontend development servers
npm run dev
```

#### Option B: Using startup scripts
```bash
# On Unix/Linux/macOS
chmod +x start-dev.sh
./start-dev.sh

# On Windows
start-dev.bat
```

This will:
- Start backend server on `http://localhost:3000`
- Start frontend server on `http://localhost:8080`
- Open startup guide automatically

### 3. Alternative: Manual Setup
```bash
cd Backend
npm install
npm run init-db      # Initialize database with dummy data
npm run dev          # Start development server

# In another terminal, open frontend
cd ../frontend
# Open start.html in your browser for status check
# Or open index.html directly for the main application
```

### 4. Test the Application
- Backend will be running on `http://localhost:3000`
- Frontend can be opened directly from the `frontend/` folder
- Use test account: `admin@fotofolio.com` / `admin123`

## 📱 Usage Guide

### For Users
1. **Browse Photos**: View featured photos on the homepage
2. **Explore Categories**: Click category cards to filter photos
3. **Search**: Use the search bar to find specific content
4. **Authentication**: Register/login to access full features
5. **Interact**: Like, comment, and follow other users
6. **Upload**: Add your own photos (coming soon)

### For Developers
1. **Backend Development**: Modify routes, add new endpoints
2. **Frontend Development**: Update UI components and styles
3. **Database Changes**: Modify schema in `Backend/database/init.js`
4. **API Testing**: Use the provided test scripts

## 🔧 Development

### Quick Development Start (Recommended)
```bash
# Start both backend and frontend development servers
npm run dev

# This runs concurrently:
# - Backend on http://localhost:3000 (with nodemon)
# - Frontend on http://localhost:8080 (with live-server)
```

### Individual Development
```bash
# Backend only
npm run backend:dev          # Start with nodemon
npm run backend:init-db      # Reset database
npm run backend:test-data    # Verify dummy data
npm run backend:test-server  # Test basic server
npm run backend:troubleshoot # Diagnose issues

# Frontend only
npm run frontend:dev         # Start with live-server
```

### Database Development
```bash
npm run backend:init-db      # Reinitialize database
# Modify Backend/database/init.js for schema changes
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Photos
- `GET /api/photos` - List photos with pagination
- `GET /api/photos/:id` - Get photo details
- `POST /api/photos` - Upload new photo
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo

### Users
- `GET /api/users` - List users with pagination
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category details
- `GET /api/categories/:id/photos` - Get category photos

### Comments
- `GET /api/comments/photo/:photoId` - Get photo comments
- `POST /api/comments/photo/:photoId` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Likes
- `POST /api/likes/photo/:photoId` - Like photo
- `DELETE /api/likes/photo/:photoId` - Unlike photo
- `GET /api/likes/photo/:photoId` - Get photo likes
- `GET /api/likes/user/:userId` - Get user's liked photos

## 🎨 Customization

### Styling
- Modify `frontend/css/style.css` for main styles
- Update `frontend/css/responsive.css` for breakpoints
- Use CSS custom properties for easy theming

### Configuration
- Edit `frontend/js/config.js` for API settings
- Modify `Backend/config.env` for environment variables
- Update database schema in `Backend/database/init.js`

### Adding Features
- Create new routes in `Backend/routes/`
- Add frontend services in `frontend/js/`
- Update database schema as needed
- Follow existing code patterns

## 🧪 Testing

### Backend Testing
```bash
npm run backend:test-data    # Verify database data
npm run backend:test-server  # Test server startup
npm run backend:troubleshoot # Run diagnostics
```

### Frontend Testing
- Test responsive design on different screen sizes
- Verify all interactive features work
- Check browser console for errors
- Test authentication flow
- Verify API integration

### API Testing
```bash
cd Backend
node test-api.js     # Run API tests
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
1. Check Node.js version (`node --version`)
2. Verify dependencies are installed (`npm install`)
3. Check port 3000 is available
4. Run `npm run troubleshoot`

#### Database Issues
1. Ensure `fotofolio.db` file exists
2. Run `npm run init-db` to reinitialize
3. Check file permissions
4. Verify SQLite3 installation

#### Frontend Issues
1. Check browser console for errors
2. Verify backend is running on port 3000
3. Check CORS configuration
4. Clear browser cache and localStorage

#### Connection Issues
1. Verify backend server status
2. Check firewall settings
3. Ensure CORS is properly configured
4. Test with `start.html` status checker

### Debug Mode
Enable debug logging:
```javascript
// Frontend
localStorage.setItem('debug', 'true');

// Backend
NODE_ENV=development npm run dev
```

## 📚 Documentation

- **Backend**: See `Backend/README.md` for detailed backend documentation
- **Frontend**: See `frontend/README.md` for frontend-specific information
- **API**: All endpoints documented in the routes files
- **Database**: Schema and relationships documented in `Backend/database/init.js`

## 🤝 Contributing

### Development Guidelines
1. Follow existing code structure and patterns
2. Use ES6+ features and modern JavaScript
3. Maintain responsive design principles
4. Add comprehensive error handling
5. Test on multiple devices and browsers
6. Update documentation for new features

### Code Style
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow consistent indentation and formatting
- Use semantic HTML elements
- Implement progressive enhancement

## 🔮 Future Enhancements

### Planned Features
- **Photo Upload**: Drag and drop file uploads
- **Advanced Filters**: Date, location, camera settings
- **Collections**: User-created photo collections
- **Sharing**: Social media integration
- **Offline Support**: Service worker implementation
- **Dark Mode**: Theme switching capability
- **Real-time Chat**: User messaging system
- **Analytics**: Photo and user statistics

### Technical Improvements
- **PWA Support**: Progressive Web App features
- **Performance**: Advanced caching strategies
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support
- **Testing**: Unit and integration tests
- **CI/CD**: Automated deployment pipeline

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

### Getting Help
1. Check the troubleshooting section
2. Review the documentation
3. Check browser console and server logs
4. Verify all prerequisites are met
5. Test with the provided startup scripts

### Reporting Issues
When reporting issues, please include:
- Operating system and Node.js version
- Browser and version (for frontend issues)
- Steps to reproduce the problem
- Error messages and logs
- Expected vs. actual behavior

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular photography platforms
- Designed for photographers and photography enthusiasts
- Community-driven development approach

---

**Fotofolio** - Empowering photographers to showcase their work and connect with the world through a beautiful, modern platform.

**Built with ❤️ using Node.js, Express, SQLite, and vanilla web technologies.**
