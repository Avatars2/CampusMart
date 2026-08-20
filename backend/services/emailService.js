const nodemailer = require('nodemailer');

const sendOTP = async (email, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"CampusMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your CampusMart Verification Code',
    html: `
      <h2>Welcome to CampusMart!</h2>
      <p>Your OTP for registration is: <strong>${otpCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTP
};
