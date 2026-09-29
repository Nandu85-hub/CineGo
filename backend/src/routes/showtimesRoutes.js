const express = require('express');
const router = express.Router();
const {
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} = require('../controllers/showtimeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { showtimeSchema } = require('../validations/schemas');

router.get('/single/:id', getShowtimeById);
router.get('/:movieId', getShowtimesByMovie);

router.post('/', protect, adminOnly, validate(showtimeSchema), createShowtime);
router.put('/:id', protect, adminOnly, updateShowtime);
router.delete('/:id', protect, adminOnly, deleteShowtime);

module.exports = router;
