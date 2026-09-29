const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { movieSchema } = require('../validations/schemas');

router.get('/', getMovies);
router.get('/:id', getMovieById);

router.post('/', protect, adminOnly, validate(movieSchema), createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
