

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_booking_db';

async function migrate() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.\n');

  const result = await User.updateMany(
    { isVerified: { $ne: true } },
    { $set: { isVerified: true, otp: null, otpExpiry: null } }
  );

  console.log(`✅ Migration complete!`);
  console.log(`   Modified: ${result.modifiedCount} user(s) → isVerified set to true`);
  console.log(`   Matched:  ${result.matchedCount} user(s) had isVerified !== true\n`);
  console.log('Existing users can now log in without OTP verification.');

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
