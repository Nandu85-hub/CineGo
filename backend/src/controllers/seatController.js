const Seat = require('../models/Seat');
const asyncWrapper = require('../utils/asyncWrapper');
const { reserveSeats, releaseSeats } = require('../services/seatService');


const getSeatsByShowtime = asyncWrapper(async (req, res) => {
  const { showtimeId } = req.params;
  const now = new Date();

  const seats = await Seat.find({ showtimeId }).sort({ row: 1, col: 1 });

  const formattedSeats = seats.map((seat) => {
    let currentStatus = seat.status;
    if (seat.status === 'reserved' && seat.reservedUntil && seat.reservedUntil < now) {
      currentStatus = 'available';
    }

    return {
      _id: seat._id,
      seatNumber: seat.seatNumber,
      row: seat.row,
      col: seat.col,
      seatType: seat.seatType,
      price: seat.price,
      status: currentStatus,
      reservedUntil: seat.reservedUntil,
    };
  });

  res.json({
    success: true,
    count: formattedSeats.length,
    data: formattedSeats,
  });
});

const reserveSelectedSeats = asyncWrapper(async (req, res) => {
  const { showtimeId, seatNumbers } = req.body;
  const userId = req.user._id;

  const booking = await reserveSeats({ showtimeId, seatNumbers, userId });

  res.status(201).json({
    success: true,
    message: 'Seats reserved successfully for checkout',
    data: booking,
  });
});


const releaseSelectedSeats = asyncWrapper(async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  const booking = await releaseSeats({ bookingId, userId });

  res.json({
    success: true,
    message: 'Seats released successfully',
    data: booking,
  });
});

module.exports = {
  getSeatsByShowtime,
  reserveSelectedSeats,
  releaseSelectedSeats,
};
