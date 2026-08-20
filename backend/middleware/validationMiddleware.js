const validateRegistration = (req, res, next) => {
  const { full_name, email, password, phone, student_id } = req.body;

  if (!full_name || full_name.trim() === '') {
    return res.status(400).json({ error: 'Full Name cannot be empty.' });
  }

  if (!email || !email.endsWith('@bvmengineering.ac.in')) {
    return res.status(400).json({ error: 'Only @bvmengineering.ac.in emails are allowed.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharRegex.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one special character.' });
  }

  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
  }

  if (!student_id || student_id.trim() === '') {
    return res.status(400).json({ error: 'Student ID cannot be empty.' });
  }

  next();
};

const validateOTPVerification = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !email.endsWith('@bvmengineering.ac.in')) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  if (!otp || otp.length < 6) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit OTP.' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.endsWith('@bvmengineering.ac.in')) {
    return res.status(400).json({ error: 'Please enter a valid college email address.' });
  }

  if (!password || password.trim() === '') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateOTPVerification,
  validateLogin
};
