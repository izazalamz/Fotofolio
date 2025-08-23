# Fotofolio Backend

A Node.js Express backend API for the Fotofolio photography application with SQLite database.

## Features

- **User Management**: Registration, authentication, profiles, following system
- **Photo Management**: Upload, organize, categorize, and share photos
- **Album System**: Create and manage photo collections
- **Social Features**: Likes, comments, and user interactions
- **File Upload**: Secure image upload with validation
- **Authentication**: JWT-based authentication system
- **Database**: SQLite with proper relationships and constraints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Project Structure

```
Backend/
├── database/
│   ├── connection.js      # Database connection and utilities
│   └── init.js           # Database initialization script
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── upload.js         # File upload middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── photos.js         # Photo management routes
│   ├── albums.js         # Album management routes
│   ├── categories.js     # Category management routes
│   ├── comments.js       # Comment management routes
│   └── likes.js          # Like management routes
├── uploads/              # Photo storage directory
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
└── config.env            # Environment configuration
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy and edit the config file
   cp config.env.example config.env
   # Edit config.env with your settings
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Configuration

Create a `config.env` file with the following variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **photos**: Photo metadata and file information
- **albums**: Photo collections
- **categories**: Photo categories
- **comments**: User comments on photos
- **likes**: User likes on photos
- **tags**: Photo tags
- **followers**: User following relationships

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get user's following

### Photos
- `GET /api/photos` - Get all public photos
- `GET /api/photos/:id` - Get photo by ID
- `POST /api/photos` - Upload new photo
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo
- `GET /api/photos/user/:userId` - Get user's photos

### Albums
- `GET /api/albums` - Get all public albums
- `GET /api/albums/:id` - Get album by ID
- `POST /api/albums` - Create new album
- `PUT /api/albums/:id` - Update album
- `DELETE /api/albums/:id` - Delete album
- `GET /api/albums/user/:userId` - Get user's albums

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/photos` - Get photos by category

### Comments
- `GET /api/comments/photo/:photoId` - Get comments for photo
- `POST /api/comments/photo/:photoId` - Add comment to photo
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `GET /api/comments/user/:userId` - Get user's comments

### Likes
- `POST /api/likes/photo/:photoId` - Like a photo
- `DELETE /api/likes/photo/:photoId` - Unlike a photo
- `GET /api/likes/photo/:photoId` - Get likes for photo
- `GET /api/likes/photo/:photoId/check` - Check if user liked photo
- `GET /api/likes/user/:userId` - Get user's liked photos
- `GET /api/likes/photo/:photoId/count` - Get like count for photo

## File Upload

The application supports image uploads with the following features:

- **Supported formats**: JPEG, PNG, GIF, WebP
- **File size limit**: 10MB
- **Storage**: Local file system in `uploads/` directory
- **Security**: File type validation and sanitized filenames

## Authentication

The API uses JWT tokens for authentication:

1. **Login/Register** to receive a token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Token expiration**: 24 hours (configurable)

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input validation**: Request data validation
- **SQL injection protection**: Parameterized queries
- **File upload security**: Type and size validation

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Initialization
```bash
npm run init-db
```

### Default Admin User
After running `npm run init-db`, a default admin user is created:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@fotofolio.com

## Error Handling

The API provides consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error information (in development)"
}
```

## Pagination

Most list endpoints support pagination with query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
