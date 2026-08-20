const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { sendOTP } = require('../services/emailService');

const register = async (req, res) => {
  const { full_name, email, password, phone, student_id } = req.body;

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR student_id = $2', [email, student_id]);
    
    let existingUser = null;
    let existingStudentId = null;

    for (const row of userCheck.rows) {
      if (row.email === email) existingUser = row;
      if (row.student_id === student_id) existingStudentId = row;
    }

    if (existingUser && existingUser.is_verified) {
      return res.status(400).json({ error: 'User with this email already exists and is verified.' });
    }

    if (existingStudentId && existingStudentId.is_verified) {
        return res.status(400).json({ error: 'User with this student ID already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!existingUser && !existingStudentId) {
      await pool.query(
        `INSERT INTO users 
        (full_name, email, password, phone, student_id, is_verified) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [full_name, email, hashedPassword, phone, student_id, false]
      );
    } else {
      // If user exists but is not verified, update their details
      await pool.query(
        `UPDATE users 
        SET full_name = $1, password = $2, phone = $3, student_id = $4 
        WHERE email = $5`,
        [full_name, hashedPassword, phone, student_id, email]
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await pool.query(
      'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
      [email, otpCode, expiresAt]
    );

    // Make sure we only attempt to send email if configured, else just print for development
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendOTP(email, otpCode);
    } else {
      console.log(`[DEV MODE] OTP for ${email} is ${otpCode}`);
    }

    res.status(200).json({ message: 'OTP sent successfully to your college email.' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpCheck = await pool.query(
      'SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ error: 'No OTP found for this email.' });
    }

    const latestOtp = otpCheck.rows[0];

    if (latestOtp.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    if (new Date() > latestOtp.expires_at) {
      return res.status(400).json({ error: 'OTP code has expired.' });
    }

    const userUpdate = await pool.query(
      'UPDATE users SET is_verified = true WHERE email = $1 RETURNING *',
      [email]
    );

    const user = userUpdate.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: { id: user.id, name: user.full_name, email: user.email }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Internal server error during verification.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = userCheck.rows[0];

    if (!user.is_verified) {
      return res.status(400).json({ error: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.full_name, email: user.email }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

const sendLoginOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    const user = userCheck.rows[0];

    if (!user.is_verified) {
      return res.status(400).json({ error: 'Account is not verified yet.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

    await pool.query(
      'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
      [email, otpCode, expiresAt]
    );

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendOTP(email, otpCode);
    } else {
      console.log(`[DEV MODE] Login OTP for ${email} is ${otpCode}`);
    }

    res.status(200).json({ message: 'Login OTP sent to your email.' });
  } catch (error) {
    console.error('Send Login OTP Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpCheck = await pool.query(
      'SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ error: 'No OTP found for this email.' });
    }

    const latestOtp = otpCheck.rows[0];

    if (latestOtp.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    if (new Date() > latestOtp.expires_at) {
      return res.status(400).json({ error: 'OTP code has expired.' });
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userCheck.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.full_name, email: user.email }
    });
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  sendLoginOTP,
  verifyLoginOTP
};
