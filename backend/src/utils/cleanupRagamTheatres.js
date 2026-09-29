const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

const cleanupRagamTheatres = async () => {
  try {
    await connectDB();
    console.log('Connected to database. Checking for Ragam Theatre showtimes...');

    const ragamShowtimes = await Showtime.find({
      theaterName: { $regex: /ragam/i },
    }).populate('movieId', 'title');

    console.log(`Found ${ragamShowtimes.length} showtimes matching "Ragam".`);

    if (ragamShowtimes.length === 0) {
      console.log('No Ragam Theatre showtimes found. Database is clean.');
      process.exit(0);
    }

    ragamShowtimes.forEach((st, idx) => {
      console.log(
        `[${idx + 1}] ID: ${st._id}, Movie: ${st.movieId?.title || st.movieId}, Screen: ${st.screenName}, Time: ${st.dateTime}, Status: ${st.status}`
      );
    });

    const showtimeIds = ragamShowtimes.map((s) => s._id);
    const bookings = await Booking.find({ showtimeId: { $in: showtimeIds } });
    const bookedShowtimeIds = new Set(bookings.map((b) => b.showtimeId.toString()));

    if (bookedShowtimeIds.size > 0) {
      console.log(`Warning: Found active bookings for showtime IDs:`, Array.from(bookedShowtimeIds));
    }

    const seen = new Set();
    const toDeleteIds = [];
    const keptIds = [];

    for (const st of ragamShowtimes) {
      const key = `${st.movieId?._id || st.movieId}_${new Date(st.dateTime).getTime()}_${st.screenName || 'Screen 1'}`;
      if (!seen.has(key)) {
        seen.add(key);
        keptIds.push(st._id);
      } else {
        if (!bookedShowtimeIds.has(st._id.toString())) {
          toDeleteIds.push(st._id);
        } else {
          console.log(`Keeping duplicate ${st._id} because it has associated bookings.`);
          keptIds.push(st._id);
        }
      }
    }

    console.log(`Identified ${toDeleteIds.length} duplicate Ragam showtimes to remove.`);
    console.log(`Keeping ${keptIds.length} distinct Ragam showtime(s).`);

    if (toDeleteIds.length > 0) {
      const seatDeleteResult = await Seat.deleteMany({ showtimeId: { $in: toDeleteIds } });
      console.log(`Deleted ${seatDeleteResult.deletedCount} associated seat records.`);

      const showtimeDeleteResult = await Showtime.deleteMany({ _id: { $in: toDeleteIds } });
      console.log(`Deleted ${showtimeDeleteResult.deletedCount} duplicate showtime records.`);
    }

    console.log('Ragam Theatre duplicate cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during Ragam Theatre cleanup:', error);
    process.exit(1);
  }
};

cleanupRagamTheatres();
