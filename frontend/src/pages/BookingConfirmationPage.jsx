import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, Ticket, Printer, Home, CreditCard, ShieldCheck } from 'lucide-react';
import { fetchBookingById } from '../services/api';
import { getMoviePosterUrl, getPosterFallback } from '../utils/moviePosters';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await fetchBookingById(bookingId);
        setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading booking details...</div>;
  if (!booking) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Booking record not found</div>;

  const { showtimeId: showtime, seats, totalAmount, bookingCode, paymentId: payment, createdAt } = booking;
  const movie =
    (booking.movieId && typeof booking.movieId === 'object' && booking.movieId.title ? booking.movieId : null) ||
    (showtime?.movieId && typeof showtime.movieId === 'object' && showtime.movieId.title ? showtime.movieId : null) ||
    booking.movieId ||
    showtime?.movieId;

  const posterSrc = getMoviePosterUrl(movie);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeInUp 0.4s ease' }}>
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--accent-primary)',
          boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            padding: '1.2rem 1.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={22} />
            <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Booking Confirmed</span>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '700' }}>
            CONFIRMED
          </span>
        </div>

        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <img
              src={posterSrc}
              alt={movie?.title || 'Movie'}
              referrerPolicy="no-referrer"
              style={{ width: '70px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getPosterFallback(movie?.title);
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.3rem' }}>{movie?.title || 'Movie Ticket'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {[movie?.language, movie?.duration ? `${movie.duration} minutes` : null].filter(Boolean).join(' • ')}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                {movie?.genre?.map((g, i) => (
                  <span key={i} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed var(--border-glass)' }} />

          <div className="confirmation-details-grid">
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Theater & Screen</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <MapPin size={14} color="var(--accent-secondary)" /> {showtime?.theaterName} ({showtime?.screenName})
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Show Date & Time</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <Calendar size={14} color="var(--accent-primary)" /> {new Date(showtime?.dateTime).toLocaleString()}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Seats Booked ({seats?.length})</span>
              <strong style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
                {seats?.join(', ')}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Total Paid</span>
              <strong style={{ color: 'var(--accent-green)', fontSize: '1.1rem' }}>
                ₹{totalAmount}
              </strong>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed var(--border-glass)' }} />

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              padding: '1rem 1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={16} /> Official Payment Record
              </span>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldCheck size={12} /> {payment?.status ? payment.status.toUpperCase() : 'SUCCEEDED'}
              </span>
            </div>

            <div className="payment-record-grid" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <div>
                <span>Payment ID: </span>
                <strong style={{ color: '#fff', fontFamily: 'monospace' }}>
                  {payment?.gatewayPaymentId || payment?._id || `pay_test_${booking._id.slice(-6)}`}
                </strong>
              </div>
              <div>
                <span>Payment Gateway: </span>
                <strong style={{ color: '#fff' }}>
                  {payment?.gateway ? payment.gateway.toUpperCase() : 'RAZORPAY (TEST)'}
                </strong>
              </div>
              <div>
                <span>Gateway Order ID: </span>
                <strong style={{ color: '#fff', fontFamily: 'monospace' }}>
                  {payment?.gatewayOrderId || `order_mock_${booking._id.slice(-6)}`}
                </strong>
              </div>
              <div>
                <span>Transaction Date: </span>
                <strong style={{ color: '#fff' }}>
                  {new Date(payment?.updatedAt || createdAt).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '1.2rem', borderRadius: '12px', textAlign: 'center' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${bookingCode}`}
              alt="QR Code"
              style={{ borderRadius: '6px', background: '#fff', padding: '6px', marginBottom: '0.6rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scan for entry verification</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={handlePrint} className="btn-secondary">
          <Printer size={16} /> Print Ticket & Receipt
        </button>
        <Link to="/" className="btn-primary">
          <Home size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
