const { Server } = require('socket.io');

let io = null;

// In-memory map: showtimeId -> Map<seatNumber, socketId>
// Tracks which socket is "currently selecting" each seat
const seatSelectingMap = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all origins (Vercel, localhost, etc.)
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join a specific showtime room to receive real-time updates for that screen
    socket.on('join_showtime', (showtimeId) => {
      if (showtimeId) {
        const room = `showtime_${showtimeId}`;
        socket.join(room);
        socket._showtimeId = showtimeId;
        console.log(`[Socket.io] Socket ${socket.id} joined room ${room}`);
      }
    });

    // Leave showtime room
    socket.on('leave_showtime', (showtimeId) => {
      if (showtimeId) {
        const room = `showtime_${showtimeId}`;
        socket.leave(room);
        _releaseSocketSeats(socket, showtimeId);
        console.log(`[Socket.io] Socket ${socket.id} left room ${room}`);
      }
    });

    // User clicked a seat (not yet at checkout — just UI selection)
    socket.on('seat_selecting', ({ showtimeId, seatNumber }) => {
      if (!showtimeId || !seatNumber) return;

      if (!seatSelectingMap[showtimeId]) seatSelectingMap[showtimeId] = {};

      // Only claim it if nobody else is selecting it
      if (!seatSelectingMap[showtimeId][seatNumber]) {
        seatSelectingMap[showtimeId][seatNumber] = socket.id;
        // Broadcast to everyone ELSE in the room (not the sender)
        socket.to(`showtime_${showtimeId}`).emit('seats_status_changed', {
          showtimeId: String(showtimeId),
          seatNumbers: [seatNumber],
          status: 'selecting',
        });
        console.log(`[Socket.io] ${socket.id} selecting seat ${seatNumber} in showtime ${showtimeId}`);
      }
    });

    // User deselected a seat
    socket.on('seat_deselecting', ({ showtimeId, seatNumber }) => {
      if (!showtimeId || !seatNumber) return;
      if (seatSelectingMap[showtimeId]?.[seatNumber] === socket.id) {
        delete seatSelectingMap[showtimeId][seatNumber];
        socket.to(`showtime_${showtimeId}`).emit('seats_status_changed', {
          showtimeId: String(showtimeId),
          seatNumbers: [seatNumber],
          status: 'available',
        });
        console.log(`[Socket.io] ${socket.id} deselected seat ${seatNumber} in showtime ${showtimeId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      // Release all seats this socket was "selecting"
      if (socket._showtimeId) {
        _releaseSocketSeats(socket, socket._showtimeId);
      }
    });
  });

  return io;
};

/**
 * Release all in-memory "selecting" seats held by a socket and notify the room.
 */
const _releaseSocketSeats = (socket, showtimeId) => {
  const map = seatSelectingMap[showtimeId];
  if (!map) return;

  const releasedSeats = [];
  for (const [seatNumber, sid] of Object.entries(map)) {
    if (sid === socket.id) {
      delete map[seatNumber];
      releasedSeats.push(seatNumber);
    }
  }

  if (releasedSeats.length > 0) {
    io.to(`showtime_${showtimeId}`).emit('seats_status_changed', {
      showtimeId: String(showtimeId),
      seatNumbers: releasedSeats,
      status: 'available',
    });
    console.log(`[Socket.io] Released selecting seats on disconnect: ${releasedSeats.join(', ')} for showtime ${showtimeId}`);
  }
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.io] io instance requested before initialization');
  }
  return io;
};

const emitSeatsStatusChanged = (showtimeId, seatNumbers, status) => {
  if (!io || !showtimeId || !seatNumbers || seatNumbers.length === 0) return;
  const room = `showtime_${showtimeId}`;
  io.to(room).emit('seats_status_changed', {
    showtimeId: showtimeId.toString(),
    seatNumbers,
    status,
  });
  console.log(`[Socket.io] Emitted seats_status_changed (${status}) for ${seatNumbers.join(', ')} to room ${room}`);
};

module.exports = {
  initSocket,
  getIO,
  emitSeatsStatusChanged,
};
