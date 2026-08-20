const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, full_name, email, phone, student_id, department, year_semester, profile_photo_url, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, department, year_semester } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           department = COALESCE($3, department),
           year_semester = COALESCE($4, year_semester)
       WHERE id = $5
       RETURNING id, full_name, email, phone, student_id, department, year_semester, profile_photo_url`,
      [full_name, phone, department, year_semester, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const userId = req.user.id;
    const { cloudinary } = require('../config/cloudinary');

    // Upload the buffer to Cloudinary manually
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'campus_mart_profiles',
          transformation: [{ width: 500, height: 500, crop: 'limit' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const photoUrl = uploadResult.secure_url;

    const result = await pool.query(
      `UPDATE users SET profile_photo_url = $1 WHERE id = $2 RETURNING profile_photo_url`,
      [photoUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ 
      message: 'Profile photo uploaded successfully',
      photoUrl: result.rows[0].profile_photo_url 
    });
  } catch (error) {
    console.error('Upload Photo Error:', error);
    res.status(500).json({ error: 'Failed to upload photo: ' + error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
  changePassword
};
