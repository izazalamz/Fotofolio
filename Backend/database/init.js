const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'fotofolio.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    profile_picture VARCHAR(255),
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Albums table
  db.run(`CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT 1,
    cover_photo_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (cover_photo_id) REFERENCES photos (id) ON DELETE SET NULL
  )`);

  // Photos table
  db.run(`CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    dimensions VARCHAR(50),
    user_id INTEGER NOT NULL,
    album_id INTEGER,
    category_id INTEGER,
    is_public BOOLEAN DEFAULT 1,
    views_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
  )`);

  // Comments table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    photo_id INTEGER NOT NULL,
    parent_comment_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
  )`);

  // Likes table
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    photo_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, photo_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE
  )`);

  // Tags table
  db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Photo tags junction table
  db.run(`CREATE TABLE IF NOT EXISTS photo_tags (
    photo_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (photo_id, tag_id),
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
  )`);

  // Followers table
  db.run(`CREATE TABLE IF NOT EXISTS followers (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
  )`);

  console.log('Tables created successfully');

  // Insert default categories
  const defaultCategories = [
    'Nature',
    'Portrait',
    'Landscape',
    'Street',
    'Architecture',
    'Abstract',
    'Black & White',
    'Macro',
    'Travel',
    'Documentary'
  ];

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  defaultCategories.forEach(category => {
    insertCategory.run(category);
  });
  insertCategory.finalize();

  // Insert dummy users
  const dummyUsers = [
    {
      username: 'admin',
      email: 'admin@fotofolio.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      bio: 'System administrator and photography enthusiast',
      is_verified: 1
    },
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Professional landscape photographer with 10+ years of experience',
      is_verified: 1
    },
    {
      username: 'sarah_wilson',
      email: 'sarah@example.com',
      password: 'password123',
      first_name: 'Sarah',
      last_name: 'Wilson',
      bio: 'Street photography lover capturing urban life moments',
      is_verified: 1
    },
    {
      username: 'mike_chen',
      email: 'mike@example.com',
      password: 'password123',
      first_name: 'Mike',
      last_name: 'Chen',
      bio: 'Portrait photographer specializing in creative portraits',
      is_verified: 0
    },
    {
      username: 'emma_brown',
      email: 'emma@example.com',
      password: 'password123',
      first_name: 'Emma',
      last_name: 'Brown',
      bio: 'Nature and wildlife photographer exploring the great outdoors',
      is_verified: 1
    },
    {
      username: 'alex_garcia',
      email: 'alex@example.com',
      password: 'password123',
      first_name: 'Alex',
      last_name: 'Garcia',
      bio: 'Architecture photographer with a passion for modern design',
      is_verified: 0
    },
    {
      username: 'lisa_jones',
      email: 'lisa@example.com',
      password: 'password123',
      first_name: 'Lisa',
      last_name: 'Jones',
      bio: 'Travel photographer documenting cultures around the world',
      is_verified: 1
    },
    {
      username: 'david_kim',
      email: 'david@example.com',
      password: 'password123',
      first_name: 'David',
      last_name: 'Kim',
      bio: 'Abstract and experimental photography artist',
      is_verified: 1
    }
  ];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password_hash, first_name, last_name, bio, is_verified) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  dummyUsers.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    insertUser.run(
      user.username,
      user.email,
      hashedPassword,
      user.first_name,
      user.last_name,
      user.bio,
      user.is_verified
    );
  });
  insertUser.finalize();

  // Insert dummy albums
  const dummyAlbums = [
    {
      title: 'Mountain Landscapes',
      description: 'Breathtaking mountain views from my travels',
      user_id: 2,
      is_public: 1
    },
    {
      title: 'Urban Street Life',
      description: 'Capturing the essence of city life',
      user_id: 3,
      is_public: 1
    },
    {
      title: 'Creative Portraits',
      description: 'Artistic portrait photography',
      user_id: 4,
      is_public: 1
    },
    {
      title: 'Wildlife Encounters',
      description: 'Amazing wildlife moments in nature',
      user_id: 5,
      is_public: 1
    },
    {
      title: 'Modern Architecture',
      description: 'Contemporary architectural marvels',
      user_id: 6,
      is_public: 1
    },
    {
      title: 'World Travels',
      description: 'Photographs from around the globe',
      user_id: 7,
      is_public: 1
    },
    {
      title: 'Abstract Visions',
      description: 'Experimental and abstract photography',
      user_id: 8,
      is_public: 1
    },
    {
      title: 'City Skylines',
      description: 'Urban landscapes and city views',
      user_id: 2,
      is_public: 1
    },
    {
      title: 'Nature Close-ups',
      description: 'Macro photography of natural elements',
      user_id: 5,
      is_public: 0
    },
    {
      title: 'Street Portraits',
      description: 'Candid portraits of people in urban settings',
      user_id: 3,
      is_public: 1
    }
  ];

  const insertAlbum = db.prepare(`
    INSERT OR IGNORE INTO albums (title, description, user_id, is_public) 
    VALUES (?, ?, ?, ?)
  `);

  dummyAlbums.forEach(album => {
    insertAlbum.run(album.title, album.description, album.user_id, album.is_public);
  });
  insertAlbum.finalize();

  // Insert dummy photos
  const dummyPhotos = [
    {
      title: 'Sunset Over Mountains',
      description: 'Golden hour light painting the mountain peaks',
      file_path: '/uploads/sunset_mountains.jpg',
      file_size: 2048000,
      file_type: 'image/jpeg',
      dimensions: '4000x3000',
      user_id: 2,
      album_id: 1,
      category_id: 3,
      views_count: 156
    },
    {
      title: 'City Street Scene',
      description: 'Busy urban street with people walking',
      file_path: '/uploads/city_street.jpg',
      file_size: 1536000,
      file_type: 'image/jpeg',
      dimensions: '3000x2000',
      user_id: 3,
      album_id: 2,
      category_id: 4,
      views_count: 89
    },
    {
      title: 'Portrait of Emma',
      description: 'Creative portrait with dramatic lighting',
      file_path: '/uploads/portrait_emma.jpg',
      file_size: 2560000,
      file_type: 'image/jpeg',
      dimensions: '3500x4500',
      user_id: 4,
      album_id: 3,
      category_id: 2,
      views_count: 234
    },
    {
      title: 'Eagle in Flight',
      description: 'Majestic eagle soaring through the sky',
      file_path: '/uploads/eagle_flight.jpg',
      file_size: 3072000,
      file_type: 'image/jpeg',
      dimensions: '5000x3000',
      user_id: 5,
      album_id: 4,
      category_id: 1,
      views_count: 445
    },
    {
      title: 'Glass Skyscraper',
      description: 'Modern glass building reflecting the sky',
      file_path: '/uploads/glass_building.jpg',
      file_size: 1792000,
      file_type: 'image/jpeg',
      dimensions: '4000x6000',
      user_id: 6,
      album_id: 5,
      category_id: 5,
      views_count: 178
    },
    {
      title: 'Tokyo Streets',
      description: 'Vibrant street scene in Tokyo, Japan',
      file_path: '/uploads/tokyo_streets.jpg',
      file_size: 2048000,
      file_type: 'image/jpeg',
      dimensions: '4000x3000',
      user_id: 7,
      album_id: 6,
      category_id: 9,
      views_count: 312
    },
    {
      title: 'Abstract Light Patterns',
      description: 'Experimental light painting and patterns',
      file_path: '/uploads/light_patterns.jpg',
      file_size: 1536000,
      file_type: 'image/jpeg',
      dimensions: '3000x3000',
      user_id: 8,
      album_id: 7,
      category_id: 6,
      views_count: 167
    },
    {
      title: 'Mountain Lake',
      description: 'Serene mountain lake with perfect reflections',
      file_path: '/uploads/mountain_lake.jpg',
      file_size: 2560000,
      file_type: 'image/jpeg',
      dimensions: '4000x3000',
      user_id: 2,
      album_id: 1,
      category_id: 3,
      views_count: 298
    },
    {
      title: 'Urban Portrait',
      description: 'Street portrait with urban background',
      file_path: '/uploads/urban_portrait.jpg',
      file_size: 1792000,
      file_type: 'image/jpeg',
      dimensions: '3000x4000',
      user_id: 3,
      album_id: 10,
      category_id: 2,
      views_count: 134
    },
    {
      title: 'Flower Macro',
      description: 'Close-up of flower petals with water droplets',
      file_path: '/uploads/flower_macro.jpg',
      file_size: 1024000,
      file_type: 'image/jpeg',
      dimensions: '2000x2000',
      user_id: 5,
      album_id: 9,
      category_id: 8,
      views_count: 223
    },
    {
      title: 'Black & White Portrait',
      description: 'Classic black and white portrait photography',
      file_path: '/uploads/bw_portrait.jpg',
      file_size: 1536000,
      file_type: 'image/jpeg',
      dimensions: '3000x4000',
      user_id: 4,
      album_id: 3,
      category_id: 7,
      views_count: 189
    },
    {
      title: 'City Night',
      description: 'Urban night scene with city lights',
      file_path: '/uploads/city_night.jpg',
      file_size: 2048000,
      file_type: 'image/jpeg',
      dimensions: '4000x3000',
      user_id: 6,
      album_id: 5,
      category_id: 4,
      views_count: 267
    },
    {
      title: 'Desert Landscape',
      description: 'Vast desert landscape with sand dunes',
      file_path: '/uploads/desert_landscape.jpg',
      file_size: 2560000,
      file_type: 'image/jpeg',
      dimensions: '5000x3000',
      user_id: 7,
      album_id: 6,
      category_id: 3,
      views_count: 156
    },
    {
      title: 'Abstract Shapes',
      description: 'Geometric shapes and abstract composition',
      file_path: '/uploads/abstract_shapes.jpg',
      file_size: 1280000,
      file_type: 'image/jpeg',
      dimensions: '2500x2500',
      user_id: 8,
      album_id: 7,
      category_id: 6,
      views_count: 98
    },
    {
      title: 'Forest Path',
      description: 'Peaceful forest trail in autumn',
      file_path: '/uploads/forest_path.jpg',
      file_size: 1792000,
      file_type: 'image/jpeg',
      dimensions: '4000x3000',
      user_id: 5,
      album_id: 4,
      category_id: 1,
      views_count: 345
    }
  ];

  const insertPhoto = db.prepare(`
    INSERT OR IGNORE INTO photos (title, description, file_path, file_size, file_type, dimensions, user_id, album_id, category_id, views_count) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  dummyPhotos.forEach(photo => {
    insertPhoto.run(
      photo.title,
      photo.description,
      photo.file_path,
      photo.file_size,
      photo.file_type,
      photo.dimensions,
      photo.user_id,
      photo.album_id,
      photo.category_id,
      photo.views_count
    );
  });
  insertPhoto.finalize();

  // Insert dummy tags
  const dummyTags = [
    'nature', 'portrait', 'landscape', 'street', 'architecture', 'abstract', 'blackandwhite', 'macro', 'travel', 'documentary',
    'sunset', 'mountains', 'urban', 'city', 'creative', 'wildlife', 'modern', 'experimental', 'reflection', 'autumn'
  ];

  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
  dummyTags.forEach(tag => {
    insertTag.run(tag);
  });
  insertTag.finalize();

  // Insert dummy photo tags
  const dummyPhotoTags = [
    { photo_id: 1, tag_id: 1 }, { photo_id: 1, tag_id: 3 }, { photo_id: 1, tag_id: 11 }, { photo_id: 1, tag_id: 12 },
    { photo_id: 2, tag_id: 4 }, { photo_id: 2, tag_id: 13 }, { photo_id: 2, tag_id: 14 },
    { photo_id: 3, tag_id: 2 }, { photo_id: 3, tag_id: 15 },
    { photo_id: 4, tag_id: 1 }, { photo_id: 4, tag_id: 16 },
    { photo_id: 5, tag_id: 5 }, { photo_id: 5, tag_id: 17 }, { photo_id: 5, tag_id: 19 },
    { photo_id: 6, tag_id: 9 }, { photo_id: 6, tag_id: 13 }, { photo_id: 6, tag_id: 14 },
    { photo_id: 7, tag_id: 6 }, { photo_id: 7, tag_id: 18 },
    { photo_id: 8, tag_id: 1 }, { photo_id: 8, tag_id: 3 }, { photo_id: 8, tag_id: 19 },
    { photo_id: 9, tag_id: 2 }, { photo_id: 9, tag_id: 4 }, { photo_id: 9, tag_id: 13 },
    { photo_id: 10, tag_id: 1 }, { photo_id: 10, tag_id: 8 },
    { photo_id: 11, tag_id: 2 }, { photo_id: 11, tag_id: 7 },
    { photo_id: 12, tag_id: 4 }, { photo_id: 12, tag_id: 13 }, { photo_id: 12, tag_id: 14 },
    { photo_id: 13, tag_id: 3 }, { photo_id: 13, tag_id: 9 },
    { photo_id: 14, tag_id: 6 }, { photo_id: 14, tag_id: 18 },
    { photo_id: 15, tag_id: 1 }, { photo_id: 15, tag_id: 20 }
  ];

  const insertPhotoTag = db.prepare('INSERT OR IGNORE INTO photo_tags (photo_id, tag_id) VALUES (?, ?)');
  dummyPhotoTags.forEach(photoTag => {
    insertPhotoTag.run(photoTag.photo_id, photoTag.tag_id);
  });
  insertPhotoTag.finalize();

  // Insert dummy comments
  const dummyComments = [
    {
      content: 'Absolutely stunning sunset! The colors are incredible.',
      user_id: 3,
      photo_id: 1
    },
    {
      content: 'Love the composition and lighting in this shot.',
      user_id: 5,
      photo_id: 1
    },
    {
      content: 'Great street photography! Really captures the urban vibe.',
      user_id: 2,
      photo_id: 2
    },
    {
      content: 'Beautiful portrait! The lighting is perfect.',
      user_id: 7,
      photo_id: 3
    },
    {
      content: 'Amazing wildlife shot! What lens did you use?',
      user_id: 4,
      photo_id: 4
    },
    {
      content: 'Incredible architecture! Love the modern design.',
      user_id: 8,
      photo_id: 5
    },
    {
      content: 'Tokyo looks amazing! Great travel photography.',
      user_id: 6,
      photo_id: 6
    },
    {
      content: 'Very creative abstract work! Love the patterns.',
      user_id: 2,
      photo_id: 7
    },
    {
      content: 'Perfect reflection in the lake! Beautiful shot.',
      user_id: 3,
      photo_id: 8
    },
    {
      content: 'Great street portrait! Love the urban background.',
      user_id: 5,
      photo_id: 9
    },
    {
      content: 'Beautiful macro shot! The water droplets add so much.',
      user_id: 4,
      photo_id: 10
    },
    {
      content: 'Classic black and white! Timeless beauty.',
      user_id: 6,
      photo_id: 11
    },
    {
      content: 'Night city photography at its best!',
      user_id: 7,
      photo_id: 12
    },
    {
      content: 'Desert landscapes are so peaceful. Great capture!',
      user_id: 8,
      photo_id: 13
    },
    {
      content: 'Love the geometric shapes! Very abstract.',
      user_id: 2,
      photo_id: 14
    },
    {
      content: 'Autumn forest paths are magical! Beautiful colors.',
      user_id: 3,
      photo_id: 15
    }
  ];

  const insertComment = db.prepare(`
    INSERT OR IGNORE INTO comments (content, user_id, photo_id) 
    VALUES (?, ?, ?)
  `);

  dummyComments.forEach(comment => {
    insertComment.run(comment.content, comment.user_id, comment.photo_id);
  });
  insertComment.finalize();

  // Insert dummy likes
  const dummyLikes = [
    { user_id: 3, photo_id: 1 }, { user_id: 4, photo_id: 1 }, { user_id: 5, photo_id: 1 }, { user_id: 6, photo_id: 1 },
    { user_id: 2, photo_id: 2 }, { user_id: 4, photo_id: 2 }, { user_id: 7, photo_id: 2 },
    { user_id: 2, photo_id: 3 }, { user_id: 3, photo_id: 3 }, { user_id: 5, photo_id: 3 }, { user_id: 6, photo_id: 3 },
    { user_id: 2, photo_id: 4 }, { user_id: 3, photo_id: 4 }, { user_id: 4, photo_id: 4 }, { user_id: 6, photo_id: 4 }, { user_id: 7, photo_id: 4 },
    { user_id: 2, photo_id: 5 }, { user_id: 3, photo_id: 5 }, { user_id: 5, photo_id: 5 }, { user_id: 8, photo_id: 5 },
    { user_id: 2, photo_id: 6 }, { user_id: 4, photo_id: 6 }, { user_id: 5, photo_id: 6 }, { user_id: 6, photo_id: 6 },
    { user_id: 2, photo_id: 7 }, { user_id: 3, photo_id: 7 }, { user_id: 4, photo_id: 7 }, { user_id: 5, photo_id: 7 },
    { user_id: 3, photo_id: 8 }, { user_id: 4, photo_id: 8 }, { user_id: 6, photo_id: 8 }, { user_id: 7, photo_id: 8 },
    { user_id: 2, photo_id: 9 }, { user_id: 4, photo_id: 9 }, { user_id: 5, photo_id: 9 }, { user_id: 6, photo_id: 9 },
    { user_id: 2, photo_id: 10 }, { user_id: 3, photo_id: 10 }, { user_id: 4, photo_id: 10 }, { user_id: 7, photo_id: 10 },
    { user_id: 3, photo_id: 11 }, { user_id: 5, photo_id: 11 }, { user_id: 6, photo_id: 11 }, { user_id: 8, photo_id: 11 },
    { user_id: 2, photo_id: 12 }, { user_id: 4, photo_id: 12 }, { user_id: 5, photo_id: 12 }, { user_id: 7, photo_id: 12 },
    { user_id: 2, photo_id: 13 }, { user_id: 3, photo_id: 13 }, { user_id: 6, photo_id: 13 }, { user_id: 8, photo_id: 13 },
    { user_id: 3, photo_id: 14 }, { user_id: 4, photo_id: 14 }, { user_id: 5, photo_id: 14 }, { user_id: 6, photo_id: 14 },
    { user_id: 2, photo_id: 15 }, { user_id: 4, photo_id: 15 }, { user_id: 5, photo_id: 15 }, { user_id: 7, photo_id: 15 }
  ];

  const insertLike = db.prepare('INSERT OR IGNORE INTO likes (user_id, photo_id) VALUES (?, ?)');
  dummyLikes.forEach(like => {
    insertLike.run(like.user_id, like.photo_id);
  });
  insertLike.finalize();

  // Insert dummy followers
  const dummyFollowers = [
    { follower_id: 2, following_id: 3 }, { follower_id: 2, following_id: 5 }, { follower_id: 2, following_id: 7 },
    { follower_id: 3, following_id: 2 }, { follower_id: 3, following_id: 4 }, { follower_id: 3, following_id: 6 },
    { follower_id: 4, following_id: 2 }, { follower_id: 4, following_id: 3 }, { follower_id: 4, following_id: 5 },
    { follower_id: 5, following_id: 2 }, { follower_id: 5, following_id: 3 }, { follower_id: 5, following_id: 7 },
    { follower_id: 6, following_id: 2 }, { follower_id: 6, following_id: 4 }, { follower_id: 6, following_id: 8 },
    { follower_id: 7, following_id: 2 }, { follower_id: 7, following_id: 5 }, { follower_id: 7, following_id: 6 },
    { follower_id: 8, following_id: 2 }, { follower_id: 8, following_id: 4 }, { follower_id: 8, following_id: 7 }
  ];

  const insertFollower = db.prepare('INSERT OR IGNORE INTO followers (follower_id, following_id) VALUES (?, ?)');
  dummyFollowers.forEach(follower => {
    insertFollower.run(follower.follower_id, follower.following_id);
  });
  insertFollower.finalize();

  // Update album cover photos
  db.run('UPDATE albums SET cover_photo_id = 1 WHERE id = 1');
  db.run('UPDATE albums SET cover_photo_id = 2 WHERE id = 2');
  db.run('UPDATE albums SET cover_photo_id = 3 WHERE id = 3');
  db.run('UPDATE albums SET cover_photo_id = 4 WHERE id = 4');
  db.run('UPDATE albums SET cover_photo_id = 5 WHERE id = 5');
  db.run('UPDATE albums SET cover_photo_id = 6 WHERE id = 6');
  db.run('UPDATE albums SET cover_photo_id = 7 WHERE id = 7');
  db.run('UPDATE albums SET cover_photo_id = 8 WHERE id = 8');
  db.run('UPDATE albums SET cover_photo_id = 9 WHERE id = 9');
  db.run('UPDATE albums SET cover_photo_id = 10 WHERE id = 10');

  console.log('Default data inserted successfully');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database initialized successfully!');
    console.log('Default admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('');
    console.log('Dummy data summary:');
    console.log('- 8 users (including admin)');
    console.log('- 10 categories');
    console.log('- 10 albums');
    console.log('- 15 photos');
    console.log('- 20 tags');
    console.log('- 16 comments');
    console.log('- 40 likes');
    console.log('- 18 follow relationships');
    console.log('');
    console.log('All users have password: password123 (except admin: admin123)');
  }
});
