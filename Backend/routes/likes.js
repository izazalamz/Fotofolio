const express = require('express');
const { runQuery, runSingle, run } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Like a photo
router.post('/photo/:photoId', authenticateToken, async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    const userId = req.user.id;

    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Check if photo exists and is public
    const photo = await runSingle(
      'SELECT id, is_public, user_id FROM photos WHERE id = ?',
      [photoId]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if photo is public or belongs to current user
    if (!photo.is_public && userId !== photo.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if already liked
    const existingLike = await runSingle(
      'SELECT id FROM likes WHERE user_id = ? AND photo_id = ?',
      [userId, photoId]
    );

    if (existingLike) {
      return res.status(400).json({ error: 'Photo already liked' });
    }

    // Add like
    await run(
      'INSERT INTO likes (user_id, photo_id) VALUES (?, ?)',
      [userId, photoId]
    );

    res.json({ message: 'Photo liked successfully' });

  } catch (error) {
    console.error('Like photo error:', error);
    res.status(500).json({ error: 'Failed to like photo' });
  }
});

// Unlike a photo
router.delete('/photo/:photoId', authenticateToken, async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    const userId = req.user.id;

    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Remove like
    const result = await run(
      'DELETE FROM likes WHERE user_id = ? AND photo_id = ?',
      [userId, photoId]
    );

    if (result.changes === 0) {
      return res.status(400).json({ error: 'Photo not liked' });
    }

    res.json({ message: 'Photo unliked successfully' });

  } catch (error) {
    console.error('Unlike photo error:', error);
    res.status(500).json({ error: 'Failed to unlike photo' });
  }
});

// Get likes for a photo
router.get('/photo/:photoId', async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Check if photo exists and is public
    const photo = await runSingle(
      'SELECT id, is_public, user_id FROM photos WHERE id = ?',
      [photoId]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if photo is public
    if (!photo.is_public) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get likes with user info
    const likes = await runQuery(
      `SELECT 
        l.id, l.created_at,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.photo_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?`,
      [photoId, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      'SELECT COUNT(*) as total FROM likes WHERE photo_id = ?',
      [photoId]
    );

    const total = totalResult.total;

    res.json({
      likes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Failed to get likes' });
  }
});

// Check if user liked a photo
router.get('/photo/:photoId/check', authenticateToken, async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    const userId = req.user.id;

    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Check if photo exists
    const photo = await runSingle(
      'SELECT id FROM photos WHERE id = ?',
      [photoId]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if user liked the photo
    const like = await runSingle(
      'SELECT id FROM likes WHERE user_id = ? AND photo_id = ?',
      [userId, photoId]
    );

    res.json({ isLiked: !!like });

  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

// Get user's liked photos
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get user's liked photos
    const likedPhotos = await runQuery(
      `SELECT 
        p.id, p.title, p.description, p.file_path, p.file_size, p.file_type,
        p.dimensions, p.views_count, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture,
        c.name as category_name, a.title as album_title,
        l.created_at as liked_at,
        COUNT(DISTINCT l2.id) as likes_count,
        COUNT(DISTINCT cm.id) as comments_count
      FROM likes l
      JOIN photos p ON l.photo_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN albums a ON p.album_id = a.id
      LEFT JOIN likes l2 ON p.id = l2.photo_id
      LEFT JOIN comments cm ON p.id = cm.photo_id
      WHERE l.user_id = ? AND p.is_public = 1
      GROUP BY p.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      `SELECT COUNT(*) as total 
       FROM likes l
       JOIN photos p ON l.photo_id = p.id
       WHERE l.user_id = ? AND p.is_public = 1`,
      [userId]
    );

    const total = totalResult.total;

    res.json({
      likedPhotos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user liked photos error:', error);
    res.status(500).json({ error: 'Failed to get user liked photos' });
  }
});

// Get like count for a photo
router.get('/photo/:photoId/count', async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }

    // Check if photo exists
    const photo = await runSingle(
      'SELECT id FROM photos WHERE id = ?',
      [photoId]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Get like count
    const likeCount = await runSingle(
      'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
      [photoId]
    );

    res.json({ likeCount: likeCount.count });

  } catch (error) {
    console.error('Get like count error:', error);
    res.status(500).json({ error: 'Failed to get like count' });
  }
});

module.exports = router;
