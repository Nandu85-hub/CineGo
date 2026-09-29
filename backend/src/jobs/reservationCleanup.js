const cron = require('node-cron');
const { cleanupExpiredReservations } = require('../services/seatService');

const startReservationCleanupJob = () => {
  cron.schedule('*/1 * * * *', async () => {
    try {
      await cleanupExpiredReservations();
    } catch (error) {
      console.error('[Cleanup Job Error]:', error.message);
    }
  });

  console.log('[Background Job] Reservation cleanup cron scheduler started (every 1 min).');
};

module.exports = startReservationCleanupJob;
