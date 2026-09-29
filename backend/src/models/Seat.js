const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true, 
    },
    row: {
      type: String,
      required: true, 
    },
    col: {
      type: Number,
      required: true,
    },
    seatType: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked'],
      default: 'available',
      index: true,
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reservedUntil: {
      type: Date,
      default: null,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { timestamps: true }
);

seatSchema.index({ showtimeId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
