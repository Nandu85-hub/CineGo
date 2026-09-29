const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const Movie = require('../models/Movie');
const asyncWrapper = require('../utils/asyncWrapper');


const getShowtimesByMovie = asyncWrapper(async (req, res) => {
  const { movieId } = req.params;
  const showtimes = await Showtime.find({ movieId, status: 'active' }).sort({ dateTime: 1 });

  res.json({
    success: true,
    count: showtimes.length,
    data: showtimes,
  });
});


const getShowtimeById = asyncWrapper(async (req, res) => {
  const showtime = await Showtime.findById(req.params.id).populate('movieId');
  if (!showtime) {
    return res.status(404).json({ success: false, error: 'Showtime not found' });
  }

  res.json({
    success: true,
    data: showtime,
  });
});


const createShowtime = asyncWrapper(async (req, res) => {
  const { movieId, theaterName, screenName, dateTime, rows = 5, cols = 8, basePrice } = req.body;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    return res.status(404).json({ success: false, error: 'Movie not found' });
  }

  const totalSeats = rows * cols;
  const showtime = await Showtime.create({
    movieId,
    theaterName,
    screenName: screenName || 'Screen 1',
    dateTime,
    totalSeats,
    seatLayout: { rows, cols },
    basePrice,
  });

  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsToInsert = [];

  for (let r = 0; r < rows; r++) {
    const rowName = rowLetters[r] || `R${r + 1}`;
    for (let c = 1; c <= cols; c++) {
      let seatType = 'standard';
      let seatPrice = basePrice;

      if (r === 0) {
        seatType = 'vip';
        seatPrice = basePrice * 1.5;
      } else if (r === 1) {
        seatType = 'premium';
        seatPrice = basePrice * 1.25;
      }

      seatsToInsert.push({
        showtimeId: showtime._id,
        seatNumber: `${rowName}${c}`,
        row: rowName,
        col: c,
        seatType,
        price: Math.round(seatPrice),
        status: 'available',
      });
    }
  }

  await Seat.insertMany(seatsToInsert);

  res.status(201).json({
    success: true,
    data: showtime,
    message: `Showtime created with ${seatsToInsert.length} seats generated`,
  });
});


const updateShowtime = asyncWrapper(async (req, res) => {
  const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!showtime) {
    return res.status(404).json({ success: false, error: 'Showtime not found' });
  }

  res.json({
    success: true,
    data: showtime,
  });
});


const deleteShowtime = asyncWrapper(async (req, res) => {
  const showtime = await Showtime.findById(req.params.id);
  if (!showtime) {
    return res.status(404).json({ success: false, error: 'Showtime not found' });
  }

  await Seat.deleteMany({ showtimeId: showtime._id });
  await showtime.deleteOne();

  res.json({
    success: true,
    message: 'Showtime and associated seats deleted',
  });
});

module.exports = {
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
