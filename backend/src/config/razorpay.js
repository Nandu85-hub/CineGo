const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_razorpay_secret';

    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
