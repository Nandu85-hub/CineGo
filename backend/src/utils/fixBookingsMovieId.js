const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

const fixBookings = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Inspecting all bookings...');

    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} total bookings.`);

    let updatedCount = 0;
    for (const booking of bookings) {
      let isValidMovie = false;
      if (booking.movieId) {
        const movieDoc = await Movie.findById(booking.movieId);
        if (movieDoc) {
          isValidMovie = true;
        }
      }

      if (!isValidMovie) {
        const showtime = await Showtime.findById(booking.showtimeId);
        if (showtime && showtime.movieId) {
          const correctMovie = await Movie.findById(showtime.movieId);
          booking.movieId = showtime.movieId;
          await booking.save();
          console.log(`✓ Updated booking ${booking.bookingCode} (${booking._id}): assigned movieId -> ${correctMovie ? correctMovie.title : showtime.movieId}`);
          updatedCount++;
        } else {
          console.warn(`! Warning: Showtime or showtime.movieId not found for booking ${booking._id}`);
        }
      } else {
        console.log(`- Booking ${booking.bookingCode} already has valid movieId`);
      }
    }

    console.log(`Migration finished. ${updatedCount} bookings updated.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

fixBookings();
