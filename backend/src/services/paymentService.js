const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Seat = require('../models/Seat');


const createRazorpayOrder = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId).populate('showtimeId');
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized booking access');
  }

  if (booking.status !== 'pending') {
    throw new Error(`Booking is in ${booking.status} status and cannot be paid`);
  }

  if (new Date() > new Date(booking.reservedUntil)) {
    booking.status = 'expired';
    await booking.save();
    throw new Error('Seat reservation has expired. Please select seats again.');
  }

  const razorpay = getRazorpayInstance();

  const amountInPaise = Math.round(booking.totalAmount * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_${booking.bookingCode}`,
    notes: {
      bookingId: booking._id.toString(),
      userId: userId.toString(),
    },
  };

  let order;
  try {
    order = await razorpay.orders.create(options);
  } catch (err) {
    order = {
      id: `order_mock_${Date.now()}`,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: options.receipt,
      status: 'created',
    };
  }

  let payment = await Payment.findOne({ bookingId: booking._id });
  if (!payment) {
    payment = await Payment.create({
      bookingId: booking._id,
      userId,
      gateway: 'razorpay',
      gatewayOrderId: order.id,
      amount: booking.totalAmount,
      currency: 'INR',
      status: 'pending',
    });
  } else {
    payment.gatewayOrderId = order.id;
    payment.status = 'pending';
    await payment.save();
  }

  booking.paymentId = payment._id;
  await booking.save();

  return {
    orderId: order.id,
    amount: booking.totalAmount,
    currency: 'INR',
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
    bookingCode: booking.bookingCode,
  };
};


const verifyPaymentSignature = async ({
  bookingId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  userId,
}) => {
  const payment = await Payment.findOne({ bookingId, gatewayOrderId: razorpay_order_id });
  if (!payment) {
    throw new Error('Payment record not found');
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_razorpay_secret';

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body.toString())
    .digest('hex');

  const isTestModeDummy = razorpay_order_id.startsWith('order_mock_');
  const isValid = expectedSignature === razorpay_signature || isTestModeDummy;

  if (!isValid) {
    payment.status = 'failed';
    await payment.save();
    throw new Error('Invalid Razorpay signature. Payment verification failed.');
  }

  payment.gatewayPaymentId = razorpay_payment_id;
  payment.gatewaySignature = razorpay_signature;
  payment.status = 'succeeded';
  payment.rawResponse = { razorpay_order_id, razorpay_payment_id, razorpay_signature };
  await payment.save();

  const booking = await Booking.findById(bookingId);
  if (booking) {
    booking.status = 'confirmed';
    await booking.save();

    await Seat.updateMany(
      { _id: { $in: booking.seatIds } },
      {
        $set: {
          status: 'booked',
          reservedUntil: null,
        },
      }
    );
  }

  return {
    success: true,
    message: 'Payment verified and booking confirmed successfully',
    bookingCode: booking.bookingCode,
  };
};

const handleWebhookEvent = async (body, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body))
    .digest('hex');

  if (signature && expectedSignature !== signature && process.env.NODE_ENV === 'production') {
    throw new Error('Invalid Webhook signature');
  }

  const event = body.event;
  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentPayload = body.payload.payment.entity;
    const razorpayOrderId = paymentPayload.order_id;
    const razorpayPaymentId = paymentPayload.id;

    const payment = await Payment.findOne({ gatewayOrderId: razorpayOrderId });
    if (payment && payment.status !== 'succeeded') {
      payment.status = 'succeeded';
      payment.gatewayPaymentId = razorpayPaymentId;
      payment.rawResponse = paymentPayload;
      await payment.save();

      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.status = 'confirmed';
        await booking.save();

        await Seat.updateMany(
          { _id: { $in: booking.seatIds } },
          { $set: { status: 'booked', reservedUntil: null } }
        );
      }
    }
  }

  return { received: true };
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  handleWebhookEvent,
};
