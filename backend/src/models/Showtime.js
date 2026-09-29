const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
    },
    theaterName: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
    },
    screenName: {
      type: String,
      required: true,
      default: 'Screen 1',
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time is required'],
    },
    totalSeats: {
      type: Number,
      default: 40,
    },
    seatLayout: {
      rows: { type: Number, default: 5 },
      cols: { type: Number, default: 8 },
    },
    basePrice: {
      type: Number,
      required: [true, 'Base seat price is required'],
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', showtimeSchema);
