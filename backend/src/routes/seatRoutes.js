const express = require('express');
const router = express.Router();
const {
  getSeatsByShowtime,
  reserveSelectedSeats,
  releaseSelectedSeats,
} = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { reserveSeatsSchema } = require('../validations/schemas');

router.get('/:showtimeId', getSeatsByShowtime);
router.post('/reserve', protect, validate(reserveSeatsSchema), reserveSelectedSeats);
router.post('/release', protect, releaseSelectedSeats);

module.exports = router;
