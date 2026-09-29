const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createPaymentSchema, verifyPaymentSchema } = require('../validations/schemas');

router.post('/create', protect, validate(createPaymentSchema), createPaymentOrder);
router.post('/verify', protect, validate(verifyPaymentSchema), verifyPayment);
router.post('/webhook', express.json({ type: 'application/json' }), handleWebhook);

module.exports = router;
