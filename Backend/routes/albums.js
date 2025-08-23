const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runSingle, run } = require('../database/connection');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all public albums
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = 'WHERE a.is_public = 1';
    let queryParams = [];

    if (search) {
      whereClause += ' AND (a.title LIKE ? OR a.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Get albums with user info and photo count
    const albums = await runQuery(
      `SELECT 
        a.id, a.title, a.description, a.is_public, a.created_at, a.updated_at,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture,
        COUNT(DISTINCT p.id) as photo_count,
        a.cover_photo_id
      FROM albums a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN photos p ON a.id = p.album_id AND p.is_public = 1
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      `SELECT COUNT(*) as total FROM albums a ${whereClause}`,
      queryParams
    );

    const total = totalResult.total;

    res.json({
      albums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ error: 'Failed to get albums' });
  }
});

// Get album by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    
    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid album ID' });
    }

    // Get album details
    const album = await runSingle(
      `SELECT 
        a.*, u.username, u.first_name, u.last_name, u.profile_picture
      FROM albums a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [albumId]
    );

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check if album is public or belongs to current user
    if (!album.is_public && (!req.user || req.user.id !== album.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get photos in album
    const photos = await runQuery(
      `SELECT 
        p.id, p.title, p.description, p.file_path, p.file_size, p.file_type,
        p.dimensions, p.views_count, p.created_at, p.updated_at,
        c.name as category_name,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT cm.id) as comments_count
      FROM photos p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN likes l ON p.id = l.photo_id
      LEFT JOIN comments cm ON p.id = cm.photo_id
      WHERE p.album_id = ? AND (p.is_public = 1 OR ? = 1)
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [albumId, req.user && req.user.id === album.user_id ? 1 : 0]
    );

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
      album: {
        ...album,
        photos
      }
    });

  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Failed to get album' });
  }
});

// Create new album
router.post('/', authenticateToken, [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, is_public = true } = req.body;

    // Insert album
    const result = await run(
      'INSERT INTO albums (title, description, user_id, is_public) VALUES (?, ?, ?, ?)',
      [title, description, req.user.id, is_public]
    );

    // Get the created album
    const newAlbum = await runSingle(
      `SELECT 
        a.*, u.username, u.first_name, u.last_name
      FROM albums a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Album created successfully',
      album: newAlbum
    });

  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
});

// Update album
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('is_public').optional().isBoolean().withMessage('is_public must be a boolean'),
  body('cover_photo_id').optional().isInt().withMessage('Cover photo ID must be a valid integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const albumId = parseInt(req.params.id);
    const { title, description, is_public, cover_photo_id } = req.body;

    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid album ID' });
    }

    // Check if album exists and belongs to user
    const album = await runSingle(
      'SELECT * FROM albums WHERE id = ? AND user_id = ?',
      [albumId, req.user.id]
    );

    if (!album) {
      return res.status(404).json({ error: 'Album not found or access denied' });
    }

    // Validate cover photo if provided
    if (cover_photo_id) {
      const photoExists = await runSingle(
        'SELECT id FROM photos WHERE id = ? AND user_id = ?',
        [cover_photo_id, req.user.id]
      );
      if (!photoExists) {
        return res.status(400).json({ error: 'Invalid cover photo ID or access denied' });
      }
    }

    // Update album
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
    if (is_public !== undefined) {
      updateFields.push('is_public = ?');
      updateValues.push(is_public);
    }
    if (cover_photo_id !== undefined) {
      updateFields.push('cover_photo_id = ?');
      updateValues.push(cover_photo_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(albumId);

    await run(
      `UPDATE albums SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated album
    const updatedAlbum = await runSingle(
      `SELECT 
        a.*, u.username, u.first_name, u.last_name
      FROM albums a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [albumId]
    );

    res.json({
      message: 'Album updated successfully',
      album: updatedAlbum
    });

  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({ error: 'Failed to update album' });
  }
});

// Delete album
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    
    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid album ID' });
    }

    // Check if album exists and belongs to user
    const album = await runSingle(
      'SELECT * FROM albums WHERE id = ? AND user_id = ?',
      [albumId, req.user.id]
    );

    if (!album) {
      return res.status(404).json({ error: 'Album not found or access denied' });
    }

    // Delete album (cascade will handle related records)
    await run('DELETE FROM albums WHERE id = ?', [albumId]);

    res.json({ message: 'Album deleted successfully' });

  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ error: 'Failed to delete album' });
  }
});

// Get user's albums
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

    let whereClause = 'WHERE a.user_id = ?';
    let queryParams = [userId];

    if (!includePrivate) {
      whereClause += ' AND a.is_public = 1';
    }

    // Get albums
    const albums = await runQuery(
      `SELECT 
        a.id, a.title, a.description, a.is_public, a.created_at, a.updated_at,
        COUNT(DISTINCT p.id) as photo_count,
        a.cover_photo_id
      FROM albums a
      LEFT JOIN photos p ON a.id = p.album_id AND (p.is_public = 1 OR ? = 1)
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?`,
      [includePrivate ? 1 : 0, ...queryParams, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      `SELECT COUNT(*) as total FROM albums a ${whereClause}`,
      queryParams
    );

    const total = totalResult.total;

    res.json({
      albums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user albums error:', error);
    res.status(500).json({ error: 'Failed to get user albums' });
  }
});

module.exports = router;
