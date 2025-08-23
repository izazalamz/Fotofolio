const express = require('express');
const { runQuery, runSingle, run } = require('../database/connection');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/izaz', (req, res) => {res.send("ALIF OP")})

// Get all users (public profiles)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = '';
    let queryParams = [];

    if (search) {
      whereClause = 'WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
      queryParams = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    // Get users with photo count
    const users = await runQuery(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.bio, u.profile_picture, u.created_at,
        COUNT(DISTINCT p.id) as photo_count,
        COUNT(DISTINCT f.following_id) as followers_count,
        COUNT(DISTINCT f2.follower_id) as following_count
      FROM users u
      LEFT JOIN photos p ON u.id = p.user_id AND p.is_public = 1
      LEFT JOIN followers f ON u.id = f.following_id
      LEFT JOIN followers f2 ON u.id = f2.follower_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );

    const total = totalResult.total;

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get user profile
    const user = await runSingle(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.bio, u.profile_picture, u.created_at,
        COUNT(DISTINCT p.id) as photo_count,
        COUNT(DISTINCT f.following_id) as followers_count,
        COUNT(DISTINCT f2.follower_id) as following_count
      FROM users u
      LEFT JOIN photos p ON u.id = p.user_id AND p.is_public = 1
      LEFT JOIN followers f ON u.id = f.following_id
      LEFT JOIN followers f2 ON u.id = f2.follower_id
      WHERE u.id = ?
      GROUP BY u.id`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      const followStatus = await runSingle(
        'SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?',
        [req.user.id, userId]
      );
      isFollowing = !!followStatus;
    }

    // Get recent public photos
    const recentPhotos = await runQuery(
      `SELECT 
        p.id, p.title, p.description, p.file_path, p.created_at,
        c.name as category_name
      FROM photos p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = ? AND p.is_public = 1
      ORDER BY p.created_at DESC
      LIMIT 6`,
      [userId]
    );

    res.json({
      user: { ...user, isFollowing },
      recentPhotos
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Follow user
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (isNaN(followingId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userExists = await runSingle('SELECT id FROM users WHERE id = ?', [followingId]);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const alreadyFollowing = await runSingle(
      'SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (alreadyFollowing) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add follow relationship
    await run(
      'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );

    res.json({ message: 'Successfully followed user' });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (isNaN(followingId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Remove follow relationship
    const result = await run(
      'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (result.changes === 0) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get followers
    const followers = await runQuery(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.profile_picture, u.created_at,
        f.created_at as followed_at
      FROM followers f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      'SELECT COUNT(*) as total FROM followers WHERE following_id = ?',
      [userId]
    );

    const total = totalResult.total;

    res.json({
      followers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get user's following
router.get('/:id/following', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get following
    const following = await runQuery(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.profile_picture, u.created_at,
        f.created_at as followed_at
      FROM followers f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      'SELECT COUNT(*) as total FROM followers WHERE follower_id = ?',
      [userId]
    );

    const total = totalResult.total;

    res.json({
      following,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

module.exports = router;
