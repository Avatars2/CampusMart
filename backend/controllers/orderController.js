const { pool } = require('../config/db');

// @desc    Process checkout and create orders
// @route   POST /api/orders/checkout
// @access  Private
const checkout = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, payment_method, delivery_address } = req.body;
    const buyer_id = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    await client.query('BEGIN');

    const createdOrders = [];

    for (const item of items) {
      // Validate item exists and is active
      const itemCheck = await client.query('SELECT * FROM items WHERE id = $1 AND is_active = true', [item.id]);
      
      if (itemCheck.rows.length === 0) {
        throw new Error(`Item ${item.name || 'Unknown'} is no longer available`);
      }

      const dbItem = itemCheck.rows[0];

      // Check if trying to buy own item
      if (dbItem.seller_id === buyer_id) {
        throw new Error(`You cannot buy your own item: ${dbItem.name}`);
      }

      // Create order
      const result = await client.query(
        `INSERT INTO orders 
          (buyer_id, seller_id, item_id, quantity, total_price, payment_method, delivery_address, status) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [buyer_id, dbItem.seller_id, dbItem.id, 1, dbItem.price, payment_method || 'Cash', delivery_address || 'Campus Pickup', 'pending']
      );

      // Mark item as inactive if it's a sale (optional, but good for MVP)
      if (dbItem.listing_type !== 'rent') {
        await client.query('UPDATE items SET is_active = false, marked_sold_at = CURRENT_TIMESTAMP WHERE id = $1', [dbItem.id]);
      }

      createdOrders.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Checkout successful', orders: createdOrders });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', error);
    res.status(400).json({ error: error.message || 'Error during checkout' });
  } finally {
    client.release();
  }
};

module.exports = {
  checkout
};
