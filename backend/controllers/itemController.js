const { pool } = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { name, description, price, condition_rating, category_id, listing_type } = req.body;
    const seller_id = req.user.id;

    // Validation
    if (!name || !description || !price || !condition_rating || !category_id || !listing_type) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    let images = [];

    // Handle Image Upload to Cloudinary if images are provided
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: 'campusmart/items',
        });
        return uploadResponse.secure_url;
      });
      images = await Promise.all(uploadPromises);
    }

    // Insert into DB
    const result = await pool.query(
      `INSERT INTO items 
        (seller_id, category_id, name, description, price, condition_rating, listing_type, images) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [seller_id, category_id, name, description, price, condition_rating, listing_type, images]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Server error creating item' });
  }
};

// @desc    Get user's items
// @route   GET /api/items/my-items
// @access  Private
const getMyItems = async (req, res) => {
  try {
    const seller_id = req.user.id;
    const result = await pool.query(
      `SELECT i.*, c.name as category_name 
       FROM items i 
       JOIN categories c ON i.category_id = c.id 
       WHERE i.seller_id = $1 
       ORDER BY i.created_at DESC`,
      [seller_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching my items:', error);
    res.status(500).json({ error: 'Server error fetching items' });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, condition_rating, category_id, is_active, listing_type } = req.body;
    const seller_id = req.user.id;

    // Check if item belongs to user
    const itemCheck = await pool.query('SELECT * FROM items WHERE id = $1 AND seller_id = $2', [id, seller_id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    let queryParams = [name, description, price, condition_rating, category_id, listing_type || 'sell', id, seller_id];
    let updateQuery = `
      UPDATE items 
      SET name = $1, description = $2, price = $3, condition_rating = $4, category_id = $5, listing_type = $6`;

    let paramIndex = 9; // Since we already have 8 params (id and seller_id are 7, 8)

    if (is_active !== undefined) {
      updateQuery += `, is_active = $${paramIndex}`;
      queryParams.push(is_active);
      paramIndex++;
    }

    // Handle Image Upload to Cloudinary if new images are provided
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: 'campusmart/items',
        });
        return uploadResponse.secure_url;
      });
      const imageUrls = await Promise.all(uploadPromises);
      
      updateQuery += `, images = $${paramIndex}`;
      queryParams.push(imageUrls);
      paramIndex++;
    }

    updateQuery += ` WHERE id = $7 AND seller_id = $8 RETURNING *`;

    const result = await pool.query(updateQuery, queryParams);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Server error updating item' });
  }
};

// @desc    Get all active items (for marketplace feed)
// @route   GET /api/items
// @access  Private
const getAllItems = async (req, res) => {
  try {
    const { search, listing_type } = req.query;
    let query = `
      SELECT i.*, c.name as category_name, u.full_name as seller_name, u.profile_photo_url as seller_image 
      FROM items i 
      JOIN categories c ON i.category_id = c.id 
      JOIN users u ON i.seller_id = u.id 
      WHERE i.is_active = true
    `;
    let queryParams = [];

    if (search) {
      query += ` AND (i.name ILIKE $1 OR i.description ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }

    if (listing_type && listing_type !== 'all') {
      const paramIndex = queryParams.length + 1;
      query += ` AND i.listing_type = $${paramIndex}`;
      queryParams.push(listing_type);
    }

    query += ` ORDER BY i.created_at DESC`;

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all items:', error);
    res.status(500).json({ error: 'Server error fetching items' });
  }
};

module.exports = {
  createItem,
  getMyItems,
  updateItem,
  getAllItems
};
