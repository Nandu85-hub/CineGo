import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSeatsByShowtime, fetchShowtimeById, reserveSeats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import BookingSummary from '../components/BookingSummary';
import AuthModal from '../components/AuthModal';

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

  useEffect(() => {
    loadShowtimeAndSeats();
  }, [showtimeId]);

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
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Select Your Seats</h2>
          {showtime && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {showtime.theaterName} • {showtime.screenName}
            </p>
          )}
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
