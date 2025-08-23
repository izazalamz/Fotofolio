const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runSingle, run } = require('../database/connection');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get comments for a photo
router.get('/photo/:photoId', optionalAuth, async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
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

    // Check if photo is public or belongs to current user
    if (!photo.is_public && (!req.user || req.user.id !== photo.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get comments with user info
    const comments = await runQuery(
      `SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.parent_comment_id,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.photo_id = ?
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?`,
      [photoId, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      'SELECT COUNT(*) as total FROM comments WHERE photo_id = ?',
      [photoId]
    );

    const total = totalResult.total;

    // Get replies for each comment
    for (let comment of comments) {
      const replies = await runQuery(
        `SELECT 
          c.id, c.content, c.created_at, c.updated_at,
          u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_comment_id = ?
        ORDER BY c.created_at ASC`,
        [comment.id]
      );
      comment.replies = replies;
    }

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Add comment to photo
router.post('/photo/:photoId', authenticateToken, [
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Comment content is required and must be less than 1000 characters'),
  body('parent_comment_id').optional().isInt().withMessage('Parent comment ID must be a valid integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const photoId = parseInt(req.params.photoId);
    const { content, parent_comment_id } = req.body;

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
    if (!photo.is_public && req.user.id !== photo.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate parent comment if provided
    if (parent_comment_id) {
      const parentComment = await runSingle(
        'SELECT id, photo_id FROM comments WHERE id = ?',
        [parent_comment_id]
      );

      if (!parentComment) {
        return res.status(400).json({ error: 'Parent comment not found' });
      }

      if (parentComment.photo_id !== photoId) {
        return res.status(400).json({ error: 'Parent comment does not belong to this photo' });
      }
    }

    // Insert comment
    const result = await run(
      'INSERT INTO comments (content, user_id, photo_id, parent_comment_id) VALUES (?, ?, ?, ?)',
      [content, req.user.id, photoId, parent_comment_id || null]
    );

    // Get the created comment
    const newComment = await runSingle(
      `SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.parent_comment_id,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Update comment
router.put('/:id', authenticateToken, [
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Comment content is required and must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const commentId = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Check if comment exists and belongs to user
    const comment = await runSingle(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, req.user.id]
    );

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    // Update comment
    await run(
      'UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content, commentId]
    );

    // Get updated comment
    const updatedComment = await runSingle(
      `SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.parent_comment_id,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [commentId]
    );

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    
    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Check if comment exists and belongs to user
    const comment = await runSingle(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, req.user.id]
    );

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    // Delete comment (cascade will handle replies)
    await run('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Get user's comments
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get user's comments
    const comments = await runQuery(
      `SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.parent_comment_id,
        p.id as photo_id, p.title as photo_title, p.file_path as photo_file_path,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture
      FROM comments c
      JOIN photos p ON c.photo_id = p.id
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ? AND p.is_public = 1
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      `SELECT COUNT(*) as total 
       FROM comments c
       JOIN photos p ON c.photo_id = p.id
       WHERE c.user_id = ? AND p.is_public = 1`,
      [userId]
    );

    const total = totalResult.total;

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ error: 'Failed to get user comments' });
  }
});

module.exports = router;
