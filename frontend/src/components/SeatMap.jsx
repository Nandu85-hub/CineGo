import React from 'react';

const SeatMap = ({ seats, selectedSeats, onSeatClick, maxSeats = 8 }) => {
  const rowsMap = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const rows = Object.keys(rowsMap).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ textAlign: 'center', width: '100%', marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
          SCREEN THIS WAY
        </p>
        <div className="screen-curved" />
      </div>

      {/* Seat Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', alignItems: 'center' }}>
        {rows.map((rowName) => (
          <div key={rowName} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {/* Row Label */}
            <span style={{ width: '20px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {rowName}
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {rowsMap[rowName].map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatNumber);
                const isBooked = seat.status === 'booked';
                const isReserved = seat.status === 'reserved';
                const isSelecting = seat.status === 'selecting';
                const isVip = seat.seatType === 'vip';

                let statusClass = 'seat-available';
                if (isBooked) statusClass = 'seat-booked';
                else if (isReserved) statusClass = 'seat-reserved';
                else if (isSelecting) statusClass = 'seat-selecting';
                else if (isSelected) statusClass = 'seat-selected';

                const isDisabled = isBooked || isReserved || isSelecting;

                return (
                  <button
                    key={seat._id}
                    disabled={isDisabled}
                    onClick={() => onSeatClick(seat.seatNumber, seat.price)}
                    className={`seat-btn ${statusClass} ${isVip ? 'seat-vip-border' : ''}`}
                    title={
                      isSelecting
                        ? `${seat.seatNumber} — Being selected by another user`
                        : `${seat.seatNumber} (${seat.seatType.toUpperCase()}) - ₹${seat.price}`
                    }
                  >
                    {seat.col}
                  </button>
                );
              })}
            </div>

            <span style={{ width: '20px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {rowName}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1.5rem',
          marginTop: '2.5rem',
          padding: '0.8rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div className="seat-btn seat-available" style={{ width: '22px', height: '22px' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div className="seat-btn seat-selected" style={{ width: '22px', height: '22px' }} />
          <span>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div className="seat-btn seat-selecting" style={{ width: '22px', height: '22px' }} />
          <span>Being Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div className="seat-btn seat-reserved" style={{ width: '22px', height: '22px' }} />
          <span>Reserved</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div className="seat-btn seat-booked" style={{ width: '22px', height: '22px' }} />
          <span>Booked</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div className="seat-btn seat-available seat-vip-border" style={{ width: '22px', height: '22px' }} />
          <span>VIP (Pink Border)</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
