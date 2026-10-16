import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSeatsByShowtime, fetchShowtimeById, reserveSeats } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import BookingSummary from '../components/BookingSummary';
import AuthModal from '../components/AuthModal';
import { Radio } from 'lucide-react';

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    loadShowtimeAndSeats();

    const socket = getSocket();
    if (showtimeId) {
      socket.emit('join_showtime', showtimeId);
    }

    const onConnect = () => setIsLive(true);
    const onDisconnect = () => setIsLive(false);

    if (socket.connected) {
      setIsLive(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const handleSeatsStatusChanged = ({ showtimeId: updatedShowtimeId, seatNumbers, status }) => {
      if (String(updatedShowtimeId) !== String(showtimeId)) return;

      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          if (seatNumbers.includes(seat.seatNumber)) {
            return {
              ...seat,
              status,
            };
          }
          return seat;
        })
      );

      // Deselect seats if reserved or booked by someone else
      if (status === 'reserved' || status === 'booked') {
        setSelectedSeats((prevSelected) => {
          const conflicting = prevSelected.filter((sNum) => seatNumbers.includes(sNum));
          if (conflicting.length > 0) {
            setError(`Notice: Seat(s) ${conflicting.join(', ')} were just taken by another user.`);
            return prevSelected.filter((sNum) => !seatNumbers.includes(sNum));
          }
          return prevSelected;
        });
      }
    };

    socket.on('seats_status_changed', handleSeatsStatusChanged);

    return () => {
      if (showtimeId) {
        socket.emit('leave_showtime', showtimeId);
      }
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('seats_status_changed', handleSeatsStatusChanged);
    };
  }, [showtimeId]);

  // Recalculate totalAmount whenever selectedSeats or seats change
  useEffect(() => {
    const newTotal = selectedSeats.reduce((sum, sNum) => {
      const sObj = seats.find((s) => s.seatNumber === sNum);
      return sum + (sObj ? sObj.price : 0);
    }, 0);
    setTotalAmount(newTotal);
  }, [selectedSeats, seats]);

  const loadShowtimeAndSeats = async () => {
    setLoading(true);
    try {
      const [stRes, seatsRes] = await Promise.all([
        fetchShowtimeById(showtimeId),
        fetchSeatsByShowtime(showtimeId),
      ]);
      setShowtime(stRes.data);
      setMovie(stRes.data.movieId);
      setSeats(seatsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  const handleSeatClick = (seatNumber, price) => {
    let updated;
    if (selectedSeats.includes(seatNumber)) {
      updated = selectedSeats.filter((s) => s !== seatNumber);
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking');
        return;
      }
      updated = [...selectedSeats, seatNumber];
    }
    setSelectedSeats(updated);

    const newTotal = updated.reduce((sum, sNum) => {
      const sObj = seats.find((s) => s.seatNumber === sNum);
      return sum + (sObj ? sObj.price : price);
    }, 0);
    setTotalAmount(newTotal);
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (selectedSeats.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await reserveSeats({
        showtimeId,
        seatNumbers: selectedSeats,
      });

      navigate('/checkout', { state: { booking: res.data, movie, showtime } });
    } catch (err) {
      setError(err.message);
      loadShowtimeAndSeats();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading seat layout...</div>;

  return (
    <div className="split-layout-page">
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Select Your Seats</h2>
            {showtime && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {showtime.theaterName} • {showtime.screenName}
              </p>
            )}
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: '600',
              padding: '4px 12px',
              borderRadius: '20px',
              background: isLive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(156, 163, 175, 0.1)',
              color: isLive ? '#4ade80' : 'var(--text-muted)',
              border: isLive ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-glass)',
              transition: 'all 0.3s ease',
            }}
            title={isLive ? 'Real-time WebSocket connection active' : 'Connecting to real-time sync server...'}
          >
            <Radio size={14} style={{ animation: isLive ? 'spin 3s linear infinite' : 'none' }} />
            {isLive ? 'Live Sync Active' : 'Connecting...'}
          </span>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="overflow-scroll-container">
          <SeatMap seats={seats} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />
        </div>
      </div>

      <BookingSummary
        movie={movie}
        showtime={showtime}
        selectedSeats={selectedSeats}
        totalAmount={totalAmount}
        onProceed={handleProceedToCheckout}
        loading={submitting}
      />

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
};

export default SeatSelectionPage;
