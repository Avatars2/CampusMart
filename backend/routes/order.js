const express = require('express');
const router = express.Router();
const { checkout } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/orders/checkout
// @desc    Process cart checkout
// @access  Private
router.post('/checkout', verifyToken, checkout);

module.exports = router;
