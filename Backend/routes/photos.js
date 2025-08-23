const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runSingle, run } = require('../database/connection');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { uploadPhoto } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get all public photos with pagination and filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const sort = req.query.sort || 'newest'; // newest, oldest, popular

    let whereClause = 'WHERE p.is_public = 1';
    let queryParams = [];
    let orderClause = '';

    // Add category filter
    if (category) {
      whereClause += ' AND c.name = ?';
      queryParams.push(category);
    }

    // Add search filter
    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    switch (sort) {
      case 'oldest':
        orderClause = 'ORDER BY p.created_at ASC';
        break;
      case 'popular':
        orderClause = 'ORDER BY p.views_count DESC, p.created_at DESC';
        break;
      default: // newest
        orderClause = 'ORDER BY p.created_at DESC';
    }

    // Get photos with user and category info
    const photos = await runQuery(
      `SELECT 
        p.id, p.title, p.description, p.file_path, p.file_size, p.file_type, 
        p.dimensions, p.views_count, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture,
        c.name as category_name,
        a.title as album_title,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT cm.id) as comments_count
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN albums a ON p.album_id = a.id
      LEFT JOIN likes l ON p.id = l.photo_id
      LEFT JOIN comments cm ON p.id = cm.photo_id
      ${whereClause}
      GROUP BY p.id
      ${orderClause}
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      `SELECT COUNT(*) as total 
       FROM photos p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      queryParams
    );

    const total = totalResult.total;

    // Check if current user liked each photo
    if (req.user) {
      for (let photo of photos) {
        const likeStatus = await runSingle(
          'SELECT 1 FROM likes WHERE user_id = ? AND photo_id = ?',
          [req.user.id, photo.id]
        );
        photo.isLiked = !!likeStatus;
      }
    }

    res.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
});

// Get photo by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Get photo details
    const photo = await runSingle(
      `SELECT 
        p.*, u.username, u.first_name, u.last_name, u.profile_picture,
        c.name as category_name, a.title as album_title
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN albums a ON p.album_id = a.id
      WHERE p.id = ?`,
      [photoId]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if photo is public or belongs to current user
    if (!photo.is_public && (!req.user || req.user.id !== photo.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Increment view count
    await run('UPDATE photos SET views_count = views_count + 1 WHERE id = ?', [photoId]);

    // Get likes count
    const likesResult = await runSingle(
      'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
      [photoId]
    );

    // Get comments count
    const commentsResult = await runSingle(
      'SELECT COUNT(*) as count FROM comments WHERE photo_id = ?',
      [photoId]
    );

    // Check if current user liked this photo
    let isLiked = false;
    if (req.user) {
      const likeStatus = await runSingle(
        'SELECT 1 FROM likes WHERE user_id = ? AND photo_id = ?',
        [req.user.id, photoId]
      );
      isLiked = !!likeStatus;
    }

    // Get tags
    const tags = await runQuery(
      `SELECT t.name FROM photo_tags pt
       JOIN tags t ON pt.tag_id = t.id
       WHERE pt.photo_id = ?`,
      [photoId]
    );

    res.json({
      photo: {
        ...photo,
        likes_count: likesResult.count,
        comments_count: commentsResult.count,
        isLiked,
        tags: tags.map(t => t.name)
      }
    });

  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
});

// Upload new photo
router.post('/', authenticateToken, uploadPhoto, [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category_id').optional().isInt().withMessage('Category ID must be a valid integer'),
  body('album_id').optional().isInt().withMessage('Album ID must be a valid integer'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const { title, description, category_id, album_id, is_public = true, tags = [] } = req.body;

    // Validate category if provided
    if (category_id) {
      const categoryExists = await runSingle('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (!categoryExists) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

    // Validate album if provided
    if (album_id) {
      const albumExists = await runSingle(
        'SELECT id FROM albums WHERE id = ? AND user_id = ?',
        [album_id, req.user.id]
      );
      if (!albumExists) {
        return res.status(400).json({ error: 'Invalid album ID or access denied' });
      }
    }

    // Get file info
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;
    const filePath = req.file.filename;

    // Insert photo
    const result = await run(
      `INSERT INTO photos (
        title, description, file_path, file_size, file_type, 
        user_id, category_id, album_id, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, filePath, fileSize, fileType, req.user.id, category_id, album_id, is_public]
    );

    // Handle tags
    if (tags.length > 0) {
      for (let tagName of tags) {
        // Insert tag if it doesn't exist
        let tagResult = await runSingle('SELECT id FROM tags WHERE name = ?', [tagName]);
        let tagId;
        
        if (!tagResult) {
          const newTag = await run('INSERT INTO tags (name) VALUES (?)', [tagName]);
          tagId = newTag.id;
        } else {
          tagId = tagResult.id;
        }

        // Link tag to photo
        await run('INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?)', [result.id, tagId]);
      }
    }

    // Get the created photo
    const newPhoto = await runSingle(
      `SELECT 
        p.*, u.username, u.first_name, u.last_name,
        c.name as category_name
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: newPhoto
    });

  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Update photo
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category_id').optional().isInt().withMessage('Category ID must be a valid integer'),
  body('album_id').optional().isInt().withMessage('Album ID must be a valid integer'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const photoId = parseInt(req.params.id);
    const { title, description, category_id, album_id, is_public, tags } = req.body;

    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Check if photo exists and belongs to user
    const photo = await runSingle(
      'SELECT * FROM photos WHERE id = ? AND user_id = ?',
      [photoId, req.user.id]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found or access denied' });
    }

    // Validate category if provided
    if (category_id) {
      const categoryExists = await runSingle('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (!categoryExists) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

    // Validate album if provided
    if (album_id) {
      const albumExists = await runSingle(
        'SELECT id FROM albums WHERE id = ? AND user_id = ?',
        [album_id, req.user.id]
      );
      if (!albumExists) {
        return res.status(400).json({ error: 'Invalid album ID or access denied' });
      }
    }

    // Update photo
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id);
    }
    if (album_id !== undefined) {
      updateFields.push('album_id = ?');
      updateValues.push(album_id);
    }
    if (is_public !== undefined) {
      updateFields.push('is_public = ?');
      updateValues.push(is_public);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(photoId);

    await run(
      `UPDATE photos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Handle tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await run('DELETE FROM photo_tags WHERE photo_id = ?', [photoId]);

      // Add new tags
      if (tags.length > 0) {
        for (let tagName of tags) {
          let tagResult = await runSingle('SELECT id FROM tags WHERE name = ?', [tagName]);
          let tagId;
          
          if (!tagResult) {
            const newTag = await run('INSERT INTO tags (name) VALUES (?)', [tagName]);
            tagId = newTag.id;
          } else {
            tagId = tagResult.id;
          }

          await run('INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?)', [photoId, tagId]);
        }
      }
    }

    // Get updated photo
    const updatedPhoto = await runSingle(
      `SELECT 
        p.*, u.username, u.first_name, u.last_name,
        c.name as category_name
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [photoId]
    );

    res.json({
      message: 'Photo updated successfully',
      photo: updatedPhoto
    });

  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// Delete photo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Check if photo exists and belongs to user
    const photo = await runSingle(
      'SELECT file_path FROM photos WHERE id = ? AND user_id = ?',
      [photoId, req.user.id]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found or access denied' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', photo.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete photo (cascade will handle related records)
    await run('DELETE FROM photos WHERE id = ?', [photoId]);

    res.json({ message: 'Photo deleted successfully' });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Get user's photos
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const includePrivate = req.user && req.user.id === userId;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    let whereClause = 'WHERE p.user_id = ?';
    let queryParams = [userId];

    if (!includePrivate) {
      whereClause += ' AND p.is_public = 1';
    }

    // Get photos
    const photos = await runQuery(
      `SELECT 
        p.id, p.title, p.description, p.file_path, p.file_size, p.file_type,
        p.dimensions, p.views_count, p.created_at, p.updated_at, p.is_public,
        c.name as category_name, a.title as album_title,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT cm.id) as comments_count
      FROM photos p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN albums a ON p.album_id = a.id
      LEFT JOIN likes l ON p.id = l.photo_id
      LEFT JOIN comments cm ON p.id = cm.photo_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      `SELECT COUNT(*) as total FROM photos p ${whereClause}`,
      queryParams
    );

    const total = totalResult.total;

    // Check if current user liked each photo
    if (req.user) {
      for (let photo of photos) {
        const likeStatus = await runSingle(
          'SELECT 1 FROM likes WHERE user_id = ? AND photo_id = ?',
          [req.user.id, photo.id]
        );
        photo.isLiked = !!likeStatus;
      }
    }

    res.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({ error: 'Failed to get user photos' });
  }
});

module.exports = router;
