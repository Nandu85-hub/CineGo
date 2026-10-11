const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only digits',
  }),
});

const resendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
  email: Joi.string().email().optional(),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Email address is required.',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required.',
  }),
  email: Joi.string().email().optional(),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.max': 'Password cannot exceed 64 characters.',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      'any.required': 'New password is required.',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.',
    'any.required': 'Please confirm your new password.',
  }),
});





const movieSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  genre: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).required(),
  language: Joi.string().trim().required(),
  duration: Joi.number().positive().required(),
  posterUrl: Joi.string().trim().required(),
  bannerUrl: Joi.string().trim().allow('', null).optional(),
  trailerUrl: Joi.string().trim().allow('', null).optional(),
  rating: Joi.number().min(0).max(10).optional(),
  releaseDate: Joi.alternatives().try(Joi.date(), Joi.string()).required(),
  status: Joi.string().valid('now_showing', 'coming_soon').optional(),
  votesCount: Joi.alternatives().try(Joi.string().allow('', null), Joi.number()).optional(),
  certification: Joi.string().allow('', null).optional(),
  formats: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  availableLanguages: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  order: Joi.number().optional(),
}).unknown(true);

const showtimeSchema = Joi.object({
  movieId: Joi.string().hex().length(24).required(),
  theaterName: Joi.string().required(),
  screenName: Joi.string().optional(),
  dateTime: Joi.date().required(),
  totalSeats: Joi.number().positive().optional(),
  rows: Joi.number().min(1).max(10).optional(),
  cols: Joi.number().min(1).max(12).optional(),
  basePrice: Joi.number().positive().required(),
});

const reserveSeatsSchema = Joi.object({
  showtimeId: Joi.string().hex().length(24).required(),
  seatNumbers: Joi.array().items(Joi.string()).min(1).required(),
});

const createPaymentSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
});

const verifyPaymentSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  movieSchema,
  showtimeSchema,
  reserveSeatsSchema,
  createPaymentSchema,
  verifyPaymentSchema,
};
