const express = require('express');
const { register, verifyOTP, login, sendLoginOTP, verifyLoginOTP } = require('../controllers/authController');
const { validateRegistration, validateOTPVerification, validateLogin } = require('../middleware/validationMiddleware');

const router = express.Router();

// 1. Register Route (Step 1)
router.post('/register', validateRegistration, register);

// 2. Verify OTP Route (Step 2)
router.post('/verify-otp', validateOTPVerification, verifyOTP);

// 3. Login Route
router.post('/login', validateLogin, login);

// 4. Send Login OTP (Forgot Password)
router.post('/send-login-otp', sendLoginOTP);

// 5. Verify Login OTP (Login via OTP)
router.post('/verify-login-otp', validateOTPVerification, verifyLoginOTP);

module.exports = router;
