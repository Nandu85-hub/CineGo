const express = require('express');
const router = express.Router();
const {
  getUserBookings,
  getBookingById,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/me', protect, getUserBookings);
router.get('/admin/all', protect, adminOnly, getAllBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
