const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/png' || 
      file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// POST /api/portfolio/upload
router.post('/upload', authRequired(['photographer', 'admin']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { caption } = req.body;
    let photographer_id;

    if (req.user.role === 'photographer') {
      // Get photographer_id from user_id
      const photographer = db.prepare('SELECT photographer_id FROM Photographer WHERE user_id = ?').get(req.user.user_id);
      if (!photographer) {
        return res.status(404).json({ error: 'Photographer profile not found' });
      }
      photographer_id = photographer.photographer_id;
    } else if (req.user.role === 'admin') {
      // Admin can specify photographer_id
      if (!req.body.photographer_id) {
        return res.status(400).json({ error: 'photographer_id required for admin uploads' });
      }
      const photographer = db.prepare('SELECT photographer_id FROM Photographer WHERE photographer_id = ?').get(req.body.photographer_id);
      if (!photographer) {
        return res.status(404).json({ error: 'Photographer not found' });
      }
      photographer_id = req.body.photographer_id;
    }

    // Check 10-image limit
    const imageCount = db.prepare('SELECT COUNT(*) as count FROM PhotographerPortfolioImage WHERE photographer_id = ?').get(photographer_id);
    if (imageCount.count >= 10) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Maximum 10 images allowed per photographer' });
    }

    // Sanitize caption
    const sanitizedCaption = caption ? caption.trim().substring(0, 300) : null;

    // Save to database
    const file_path = `/uploads/${req.file.filename}`;
    const stmt = db.prepare(`
      INSERT INTO PhotographerPortfolioImage (photographer_id, file_path, caption)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(photographer_id, file_path, sanitizedCaption);
    
    res.json({
      id: result.lastInsertRowid,
      photographer_id,
      file_path,
      caption: sanitizedCaption,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/portfolio/:photographerId
router.get('/:photographerId', (req, res) => {
  try {
    const { photographerId } = req.params;
    
    const images = db.prepare(`
      SELECT id, photographer_id, file_path, caption, created_at
      FROM PhotographerPortfolioImage 
      WHERE photographer_id = ?
      ORDER BY created_at DESC
    `).all(photographerId);

    res.json(images);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to retrieve portfolio' });
  }
});

// DELETE /api/portfolio/:id
router.delete('/:id', authRequired(['photographer', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the image record
    const image = db.prepare('SELECT * FROM PhotographerPortfolioImage WHERE id = ?').get(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check permissions
    if (req.user.role === 'photographer') {
      const photographer = db.prepare('SELECT photographer_id FROM Photographer WHERE user_id = ?').get(req.user.user_id);
      if (!photographer || photographer.photographer_id !== image.photographer_id) {
        return res.status(403).json({ error: 'Forbidden: You can only delete your own images' });
      }
    }
    // Admin can delete any image

    // Delete file from disk
    const filePath = path.join(__dirname, '..', '..', image.file_path.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM PhotographerPortfolioImage WHERE id = ?').run(id);
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
