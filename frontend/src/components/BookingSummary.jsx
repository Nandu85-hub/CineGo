import React from 'react';
import { Ticket, ShoppingBag, Clock } from 'lucide-react';
import { getMoviePosterUrl, getPosterFallback } from '../utils/moviePosters';

const BookingSummary = ({
  movie,
  showtime,
  selectedSeats,
  totalAmount,
  onProceed,
  loading,
  timerSeconds,
}) => {
  const formatTime = (seconds) => {
    if (seconds == null) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.8rem' }}>
        Booking Summary
      </h3>

      {timerSeconds != null && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fbbf24',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} /> Reservation Timeout:
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '800' }}>
            {formatTime(timerSeconds)}
          </span>
        </div>
      )}

      {movie && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <img
            src={getMoviePosterUrl(movie)}
            alt={movie.title}
            referrerPolicy="no-referrer"
            style={{ width: '55px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getPosterFallback(movie.title);
            }}
          />
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{movie.title}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{movie.language} • {movie.duration} min</p>
          </div>
        </div>
      )}

      {showtime && (
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
          <p style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{showtime.theaterName}</p>
          <p style={{ color: 'var(--text-muted)' }}>
            {showtime.screenName} • {new Date(showtime.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          <span>Selected Seats ({selectedSeats.length}):</span>
          <span style={{ color: '#fff', fontWeight: '600' }}>
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', marginTop: '0.8rem' }}>
          <span>Total Payable:</span>
          <span style={{ color: 'var(--accent-green)' }}>₹{totalAmount}</span>
        </div>
      </div>

      <button
        disabled={selectedSeats.length === 0 || loading}
        onClick={onProceed}
        className="btn-primary"
        style={{
          width: '100%',
          justify: 'center',
          padding: '0.9rem',
          opacity: selectedSeats.length === 0 ? 0.5 : 1,
        }}
      >
        {loading ? (
          'Processing...'
        ) : (
          <>
            <ShoppingBag size={18} /> Proceed to Checkout
          </>
        )}
      </button>
    </div>
  );
};

export default BookingSummary;
