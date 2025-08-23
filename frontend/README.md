# Fotofolio Frontend

A modern, responsive photography portfolio frontend built with vanilla HTML, CSS, and JavaScript. This frontend provides a complete user interface for the Fotofolio photography platform, featuring user authentication, photo management, social interactions, and a beautiful responsive design.

## 🚀 Features

### Core Functionality
- **User Authentication**: Login, registration, profile management
- **Photo Management**: View, like, comment, and share photos
- **User Profiles**: View user profiles, follow/unfollow users
- **Categories**: Browse photos by categories
- **Search**: Search for photos and users
- **Responsive Design**: Mobile-first approach with modern UI/UX

### Interactive Features
- **Likes System**: Like/unlike photos with real-time updates
- **Comments System**: Add, edit, delete, and reply to comments
- **Follow System**: Follow/unfollow other users
- **Photo Modals**: Detailed view with full information
- **Infinite Scroll**: Load more photos as you scroll
- **Real-time Updates**: Live updates for likes, comments, and follows

### UI/UX Features
- **Modern Design**: Clean, professional photography portfolio aesthetic
- **Responsive Layout**: Works perfectly on all device sizes
- **Loading States**: Smooth loading animations and spinners
- **Toast Notifications**: User feedback for all actions
- **Modal System**: Clean modal dialogs for forms and details
- **Smooth Animations**: CSS transitions and micro-interactions

## 🏗️ Project Structure

```
frontend/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Main stylesheet
│   └── responsive.css     # Responsive design rules
├── js/
│   ├── config.js          # Configuration and constants
│   ├── api.js             # API service layer
│   ├── auth.js            # Authentication service
│   ├── ui.js              # UI utilities and helpers
│   ├── photos.js          # Photo management service
│   ├── categories.js      # Category management service
│   ├── users.js           # User management service
│   ├── comments.js        # Comments service
│   ├── likes.js           # Likes service
│   └── app.js             # Main application controller
└── README.md              # This file
```

## 🛠️ Technical Stack

- **HTML5**: Semantic markup and modern HTML features
- **CSS3**: Custom properties, Flexbox, Grid, animations
- **Vanilla JavaScript**: ES6+ features, modules, async/await
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Backend server running (see Backend README)
- Database initialized with dummy data

### Installation
1. Ensure the backend is running on `http://localhost:3000`
2. Open `frontend/index.html` in your web browser
3. The application will automatically connect to the backend

### Development Setup
1. Clone the repository
2. Navigate to the `frontend` folder
3. Open `index.html` in your preferred code editor
4. Make changes and refresh the browser to see updates

## 📱 Usage

### For Users
1. **Browse Photos**: View featured photos on the homepage
2. **Explore Categories**: Click on category cards to filter photos
3. **Search**: Use the search bar to find specific photos or users
4. **Authentication**: Register/login to access full features
5. **Interact**: Like, comment, and follow other users
6. **Upload**: Add your own photos (coming soon)

### For Developers
1. **Modular Architecture**: Each service is self-contained
2. **Event-Driven**: Uses event delegation for performance
3. **API Integration**: Clean separation between UI and data
4. **Error Handling**: Comprehensive error handling throughout
5. **Performance**: Lazy loading, debouncing, and optimization

## 🔧 Configuration

### API Configuration
Edit `js/config.js` to modify:
- API base URL
- Endpoints
- Pagination settings
- Search settings
- UI configuration

### Styling
Modify `css/style.css` to customize:
- Color scheme
- Typography
- Spacing
- Component styles

### Responsive Breakpoints
Edit `css/responsive.css` to adjust:
- Mobile breakpoints
- Tablet breakpoints
- Desktop breakpoints
- Print styles

## 🎨 Customization

### Colors
The application uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
}
```

### Typography
Customize fonts in `css/style.css`:
```css
:root {
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-secondary: 'Georgia', serif;
  --font-size-base: 16px;
  --line-height-base: 1.6;
}
```

### Spacing
Adjust spacing using CSS custom properties:
```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
}
```

## 🔌 API Integration

The frontend integrates with the backend through the `ApiService` class:

```javascript
// Example API calls
const photos = await ApiService.get('/photos');
const user = await ApiService.post('/auth/login', credentials);
const photo = await ApiService.uploadFile('/photos', formData);
```

### Authentication
- JWT tokens stored in localStorage
- Automatic token refresh
- Protected route handling
- User session management

### Error Handling
- Network error handling
- User-friendly error messages
- Retry mechanisms for failed requests
- Graceful degradation

## 📱 Responsive Design

### Breakpoints
- **XS**: 0px - 575px (Mobile)
- **SM**: 576px - 767px (Large Mobile)
- **MD**: 768px - 991px (Tablet)
- **LG**: 992px - 1199px (Desktop)
- **XL**: 1200px - 1399px (Large Desktop)
- **XXL**: 1400px+ (Extra Large)

### Mobile-First Approach
- Base styles for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized for mobile performance

## 🎯 Performance Features

### Optimization Techniques
- **Lazy Loading**: Images load as they enter viewport
- **Debouncing**: Search input optimization
- **Throttling**: Scroll event optimization
- **Event Delegation**: Efficient event handling
- **CSS Grid/Flexbox**: Modern layout performance

### Loading States
- Skeleton loaders for content
- Loading spinners for actions
- Progressive image loading
- Smooth transitions

## 🧪 Testing

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Testing Checklist
- [ ] Responsive design on all breakpoints
- [ ] Authentication flow
- [ ] Photo interactions (like, comment)
- [ ] Search functionality
- [ ] Navigation and routing
- [ ] Error handling
- [ ] Performance on mobile devices

## 🐛 Troubleshooting

### Common Issues
1. **Backend Connection**: Ensure backend is running on port 3000
2. **CORS Issues**: Check backend CORS configuration
3. **Authentication**: Clear localStorage if login issues persist
4. **Images Not Loading**: Check uploads folder permissions

### Debug Mode
Enable debug logging in the browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

### Development Guidelines
1. Follow the existing code structure
2. Use ES6+ features
3. Maintain responsive design principles
4. Add proper error handling
5. Test on multiple devices
6. Update documentation

### Code Style
- Use meaningful variable names
- Add JSDoc comments for functions
- Follow consistent indentation
- Use semantic HTML elements
- Implement progressive enhancement

## 📄 License

This project is part of the Fotofolio photography platform. See the main project README for license information.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section
2. Review the backend documentation
3. Check browser console for errors
4. Verify backend server status

## 🔮 Future Enhancements

### Planned Features
- **Photo Upload**: Drag and drop file uploads
- **Advanced Filters**: Date, location, camera settings
- **Collections**: User-created photo collections
- **Sharing**: Social media integration
- **Offline Support**: Service worker implementation
- **Dark Mode**: Theme switching capability

### Technical Improvements
- **PWA Support**: Progressive Web App features
- **Performance**: Advanced caching strategies
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support

---

**Fotofolio Frontend** - A modern, responsive photography portfolio platform built with vanilla web technologies.
