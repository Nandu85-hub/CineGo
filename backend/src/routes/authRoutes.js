const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/schemas');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

// Email verification
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), resendVerificationEmail);

// OTP verification
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);
router.post('/resend-otp', validate(resendOTPSchema), resendOTP);

// Password reset
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
