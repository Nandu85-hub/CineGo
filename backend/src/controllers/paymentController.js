const asyncWrapper = require('../utils/asyncWrapper');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  handleWebhookEvent,
} = require('../services/paymentService');


const createPaymentOrder = asyncWrapper(async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  const orderData = await createRazorpayOrder(bookingId, userId);

  res.status(200).json({
    success: true,
    data: orderData,
  });
});


const verifyPayment = asyncWrapper(async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user._id;

  const result = await verifyPaymentSignature({
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});


const handleWebhook = asyncWrapper(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const result = await handleWebhookEvent(req.body, signature);

  res.status(200).json(result);
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
};
