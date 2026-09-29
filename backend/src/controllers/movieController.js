const Movie = require('../models/Movie');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc Get all movies
// @route GET /api/movies
// @access Public
const getMovies = asyncWrapper(async (req, res) => {
  const { status, genre, language, search } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (language && language.trim() !== '') {
    filter.language = { $regex: new RegExp(`^${language.trim()}$`, 'i') };
  }
  if (genre && genre.trim() !== '') {
    filter.genre = { $in: [new RegExp(genre.trim(), 'i')] };
  }
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const movies = await Movie.find(filter).sort({ order: 1, releaseDate: -1 });

  res.json({
    success: true,
    count: movies.length,
    data: movies,
  });
});

// @desc Get single movie by ID
// @route GET /api/movies/:id
// @access Public
const getMovieById = asyncWrapper(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, error: 'Movie not found' });
  }

  res.json({
    success: true,
    data: movie,
  });
});

const normalizeMovieData = (data) => {
  const payload = { ...data };
  if (typeof payload.genre === 'string') {
    payload.genre = payload.genre.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof payload.formats === 'string') {
    payload.formats = payload.formats.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof payload.availableLanguages === 'string') {
    payload.availableLanguages = payload.availableLanguages.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (payload.duration !== undefined && payload.duration !== '') {
    payload.duration = Number(payload.duration);
  }
  if (payload.rating !== undefined && payload.rating !== '') {
    payload.rating = Number(payload.rating);
  }
  return payload;
};

const createMovie = asyncWrapper(async (req, res) => {
  const formattedData = normalizeMovieData(req.body);
  const movie = await Movie.create(formattedData);
  res.status(201).json({
    success: true,
    data: movie,
  });
});


const updateMovie = asyncWrapper(async (req, res) => {
  const formattedData = normalizeMovieData(req.body);
  const movie = await Movie.findByIdAndUpdate(req.params.id, formattedData, {
    new: true,
    runValidators: true,
  });

  if (!movie) {
    return res.status(404).json({ success: false, error: 'Movie not found' });
  }

  res.json({
    success: true,
    data: movie,
  });
});


const deleteMovie = asyncWrapper(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, error: 'Movie not found' });
  }

  await movie.deleteOne();

  res.json({
    success: true,
    message: 'Movie removed successfully',
  });
});

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
