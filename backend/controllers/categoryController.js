const { pool } = require('../config/db');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    
    // Seed default categories if empty
    if (result.rows.length === 0) {
      const defaultCategories = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Others'];
      const insertedCategories = [];
      
      for (const name of defaultCategories) {
        const insertResult = await pool.query(
          'INSERT INTO categories (name, description, icon_url) VALUES ($1, $2, $3) RETURNING *',
          [name, `All ${name.toLowerCase()}`, null]
        );
        insertedCategories.push(insertResult.rows[0]);
      }
      return res.status(200).json(insertedCategories);
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
};

module.exports = {
  getCategories
};
