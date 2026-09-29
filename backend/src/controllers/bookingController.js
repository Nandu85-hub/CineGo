const Booking = require('../models/Booking');
const asyncWrapper = require('../utils/asyncWrapper');


const getUserBookings = asyncWrapper(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('movieId')
    .populate({
      path: 'showtimeId',
      populate: { path: 'movieId' },
    })
    .populate('paymentId')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

const getBookingById = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('movieId')
    .populate({
      path: 'showtimeId',
      populate: { path: 'movieId' },
    })
    .populate('paymentId');

  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  
  if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized access to booking' });
  }

  res.json({
    success: true,
    data: booking,
  });
});


const getAllBookings = asyncWrapper(async (req, res) => {
  const bookings = await Booking.find()
    .populate('userId', 'name email')
    .populate('movieId')
    .populate({
      path: 'showtimeId',
      populate: { path: 'movieId' },
    })
    .populate('paymentId')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

module.exports = {
  getUserBookings,
  getBookingById,
  getAllBookings,
};
