const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, uploadProfilePhoto, changePassword } = require('../controllers/userController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/users/me - Get current user profile
router.get('/me', verifyToken, getUserProfile);

// PUT /api/users/me - Update current user profile
router.put('/me', verifyToken, updateUserProfile);

// PUT /api/users/profile-photo - Upload profile photo
router.put('/profile-photo', verifyToken, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Image upload failed: ' + err.message });
    }
    next();
  });
}, uploadProfilePhoto);

// PUT /api/users/change-password - Change user password
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
