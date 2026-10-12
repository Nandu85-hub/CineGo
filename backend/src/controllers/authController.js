const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');


const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345!', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/** Generate a cryptographically random 6-digit OTP string */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/** Generate a secure random token (hex) for verification links */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/** Hash token for secure DB storage */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ─── Register ───────────────────────────────────────────────────────────────
const register = asyncWrapper(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    return res.status(400).json({ success: false, error: 'User already exists with this email' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate 6-digit OTP
  const rawOTP = generateOTP();
  const otpSalt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(rawOTP, otpSalt);
  const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Generate secure token for clickable email verification link
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'user',
    isVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpiry: tokenExpiry,
    otp: hashedOTP,
    otpExpiry,
  });

  // Send verification email with clickable link & OTP
  await sendVerificationEmail(user.email, rawToken, rawOTP);

  res.status(201).json({
    success: true,
    data: {
      email: user.email,
      message: 'Registration successful! A verification email has been sent. Please click the link or enter the OTP to verify your account.',
    },
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────
const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Block unverified regular users (admins bypass this check)
  if (user.role === 'user' && !user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
      email: user.email,
    });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

// ─── Get Me ──────────────────────────────────────────────────────────────────
const getMe = asyncWrapper(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// ─── Verify Email (Clickable Link API) ───────────────────────────────────────
const verifyEmail = asyncWrapper(async (req, res) => {
  const { token, email } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Verification token is required.' });
  }

  const hashedToken = hashToken(token);

  let query = {
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: new Date() },
  };

  if (email) {
    query.email = email.toLowerCase();
  }

  const user = await User.findOne(query);

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Verification link is invalid or has expired. Please request a new verification email.',
    });
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully! You can now log in to CineGo.',
  });
});

// ─── Resend Verification Email (Link + OTP) ──────────────────────────────────
const resendVerificationEmail = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ success: false, error: 'No account found with this email address.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, error: 'This email is already verified. Please log in.' });
  }

  // Generate new token & OTP
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const rawOTP = generateOTP();
  const otpSalt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(rawOTP, otpSalt);
  const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationToken = hashedToken;
  user.verificationTokenExpiry = tokenExpiry;
  user.otp = hashedOTP;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendVerificationEmail(user.email, rawToken, rawOTP);

  res.json({
    success: true,
    message: 'A new verification email has been sent. Please check your inbox.',
  });
});

// ─── Verify OTP ──────────────────────────────────────────────────────────────
const verifyOTP = asyncWrapper(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ success: false, error: 'No account found with this email address.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, error: 'This email is already verified. Please log in.' });
  }

  if (!user.otp || !user.otpExpiry) {
    return res.status(400).json({
      success: false,
      error: 'No OTP found for this account. Please request a new verification code.',
    });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(400).json({
      success: false,
      error: 'Your verification code has expired. Please request a new one.',
    });
  }

  const isOTPMatch = await bcrypt.compare(otp, user.otp);
  if (!isOTPMatch) {
    return res.status(400).json({ success: false, error: 'Invalid OTP code. Please check and try again.' });
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully! You can now log in to CineGo.',
  });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration attacks
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // Generate a secure random reset token
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = expiry;
  await user.save();

  await sendPasswordResetEmail(user.email, rawToken);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = asyncWrapper(async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Token and new password are required.' });
  }

  const hashedToken = hashToken(token);

  let query = {
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
  };
  if (email) query.email = email.toLowerCase();

  const user = await User.findOne(query);

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Reset link is invalid or has expired. Please request a new one.',
    });
  }

  // Prevent reuse of same password
  const isSamePassword = await bcrypt.compare(password, user.passwordHash);
  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      error: 'Your new password cannot be the same as your current password.',
    });
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(password, salt);
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;

  // Ensure the user is marked as verified (in case they weren't before)
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;

  await user.save();

  // Auto-login: generate JWT token so they can immediately be logged in
  const jwtToken = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: 'Password reset successful! You can now log in with your new password.',
    token: jwtToken,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ─── Direct Reset Password (In-Project Reset) ─────────────────────────────────
const directResetPassword = asyncWrapper(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, error: 'Email and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'No registered user found with this email address.',
    });
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: 'Password updated successfully! You can now sign in with your new password.',
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  verifyOTP,
  resendOTP: resendVerificationEmail,
  forgotPassword,
  resetPassword,
  directResetPassword,
};

