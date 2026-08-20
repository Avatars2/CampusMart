const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { createItem, getMyItems, updateItem, getAllItems } = require('../controllers/itemController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/items - Get all active items (marketplace feed)
router.get('/', verifyToken, getAllItems);

// GET /api/items/my-items - Get items belonging to the current user
router.get('/my-items', verifyToken, getMyItems);

// POST /api/items - Create a new item (with multiple images upload)
router.post('/', verifyToken, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    next();
  });
}, createItem);

// PUT /api/items/:id - Update an item
router.put('/:id', verifyToken, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    next();
  });
}, updateItem);

module.exports = router;
