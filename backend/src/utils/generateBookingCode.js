const crypto = require('crypto');

const generateBookingCode = () => {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TKT-${randomHex}`;
};

module.exports = generateBookingCode;
