const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runSingle, run } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await runQuery(
      `SELECT 
        c.id, c.name, c.description, c.created_at,
        COUNT(DISTINCT p.id) as photo_count
      FROM categories c
      LEFT JOIN photos p ON c.id = p.category_id AND p.is_public = 1
      GROUP BY c.id
      ORDER BY c.name ASC`
    );

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await runSingle(
      `SELECT 
        c.id, c.name, c.description, c.created_at,
        COUNT(DISTINCT p.id) as photo_count
      FROM categories c
      LEFT JOIN photos p ON c.id = p.category_id AND p.is_public = 1
      WHERE c.id = ?
      GROUP BY c.id`,
      [categoryId]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

// Create new category (admin only)
router.post('/', authenticateToken, [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin (you can implement your own admin check)
    // For now, we'll allow any authenticated user to create categories
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await runSingle(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    // Insert category
    const result = await run(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    // Get the created category
    const newCategory = await runSingle(
      'SELECT * FROM categories WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, [
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be less than 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = parseInt(req.params.id);
    const { name, description } = req.body;

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists
    const category = await runSingle(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await runSingle(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, categoryId]
      );

      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    // Update category
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(categoryId);

    await run(
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated category
    const updatedCategory = await runSingle(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists
    const category = await runSingle(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has photos
    const photoCount = await runSingle(
      'SELECT COUNT(*) as count FROM photos WHERE category_id = ?',
      [categoryId]
    );

    if (photoCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has photos. Please reassign or delete photos first.' 
      });
    }

    // Delete category
    await run('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get photos by category
router.get('/:id/photos', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists
    const category = await runSingle(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get photos in category
    const photos = await runQuery(
      `SELECT 
        p.id, p.title, p.description, p.file_path, p.file_size, p.file_type,
        p.dimensions, p.views_count, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture,
        a.title as album_title,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT cm.id) as comments_count
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN albums a ON p.album_id = a.id
      LEFT JOIN likes l ON p.id = l.photo_id
      LEFT JOIN comments cm ON p.id = cm.photo_id
      WHERE p.category_id = ? AND p.is_public = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );

    // Get total count
    const totalResult = await runSingle(
      'SELECT COUNT(*) as total FROM photos WHERE category_id = ? AND is_public = 1',
      [categoryId]
    );

    const total = totalResult.total;

    res.json({
      category,
      photos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get category photos error:', error);
    res.status(500).json({ error: 'Failed to get category photos' });
  }
});

module.exports = router;
