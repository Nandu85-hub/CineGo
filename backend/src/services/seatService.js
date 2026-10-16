const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const generateBookingCode = require('../utils/generateBookingCode');
const { emitSeatsStatusChanged } = require('../socket');

/**
 * Reserve seats temporarily for a specific user and showtime
 */
const reserveSeats = async ({ showtimeId, seatNumbers, userId }) => {
  const timeoutMinutes = parseInt(process.env.RESERVATION_TIMEOUT_MINUTES || '10', 10);
  const reservedUntil = new Date(Date.now() + timeoutMinutes * 60 * 1000);

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    throw new Error('Showtime not found');
  }

  // We perform an atomic find-and-update or transaction loop
  // First, check if all requested seats are currently available (or expired)
  const seatsToReserve = await Seat.find({
    showtimeId,
    seatNumber: { $in: seatNumbers },
  });

  if (seatsToReserve.length !== seatNumbers.length) {
    throw new Error('One or more selected seats do not exist');
  }

  const now = new Date();
  const unavailableSeats = seatsToReserve.filter((seat) => {
    if (seat.status === 'booked') return true;
    if (seat.status === 'reserved' && seat.reservedUntil > now && seat.reservedBy?.toString() !== userId.toString()) {
      return true;
    }
    return false;
  });

  if (unavailableSeats.length > 0) {
    const seatNames = unavailableSeats.map((s) => s.seatNumber).join(', ');
    throw new Error(`Seats already reserved or booked: ${seatNames}`);
  }

  // Calculate total price
  const totalAmount = seatsToReserve.reduce((sum, seat) => sum + seat.price, 0);

  // Update seats atomically
  const seatIds = seatsToReserve.map((s) => s._id);
  await Seat.updateMany(
    { _id: { $in: seatIds } },
    {
      $set: {
        status: 'reserved',
        reservedBy: userId,
        reservedUntil,
      },
    }
  );

  // Create a pending Booking record
  const bookingCode = generateBookingCode();
  const booking = await Booking.create({
    userId,
    movieId: showtime.movieId,
    showtimeId,
    seats: seatNumbers,
    seatIds,
    totalAmount,
    status: 'pending',
    bookingCode,
    reservedUntil,
  });

  // Link bookingId to seats
  await Seat.updateMany(
    { _id: { $in: seatIds } },
    { $set: { bookingId: booking._id } }
  );

  // Broadcast reserved status to all users viewing this showtime in real-time
  emitSeatsStatusChanged(showtimeId, seatNumbers, 'reserved');

  return booking;
};

/**
 * Manually release reserved seats for a user
 */
const releaseSeats = async ({ bookingId, userId }) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) {
    throw new Error('Booking not found or unauthorized');
  }

  if (booking.status === 'confirmed') {
    throw new Error('Cannot release already confirmed/paid booking');
  }

  await Seat.updateMany(
    { _id: { $in: booking.seatIds } },
    {
      $set: {
        status: 'available',
        reservedBy: null,
        reservedUntil: null,
        bookingId: null,
      },
    }
  );

  booking.status = 'cancelled';
  await booking.save();

  // Broadcast available status to all users viewing this showtime in real-time
  emitSeatsStatusChanged(booking.showtimeId, booking.seats, 'available');

  return booking;
};


const cleanupExpiredReservations = async () => {
  const now = new Date();

  const expiredBookings = await Booking.find({
    status: 'pending',
    reservedUntil: { $lt: now },
  });

  if (expiredBookings.length === 0) return 0;

  const expiredBookingIds = expiredBookings.map((b) => b._id);
  const expiredSeatIds = expiredBookings.flatMap((b) => b.seatIds);

  await Seat.updateMany(
    { _id: { $in: expiredSeatIds }, status: 'reserved' },
    {
      $set: {
        status: 'available',
        reservedBy: null,
        reservedUntil: null,
        bookingId: null,
      },
    }
  );

  await Booking.updateMany(
    { _id: { $in: expiredBookingIds } },
    { $set: { status: 'expired' } }
  );

  // Broadcast availability for all released seats
  expiredBookings.forEach((b) => {
    emitSeatsStatusChanged(b.showtimeId, b.seats, 'available');
  });

  console.log(`[Seat Cleanup] Released ${expiredBookings.length} expired booking(s).`);
  return expiredBookings.length;
};

module.exports = {
  reserveSeats,
  releaseSeats,
  cleanupExpiredReservations,
};
