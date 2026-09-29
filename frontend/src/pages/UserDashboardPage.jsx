import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, AlertCircle, CheckCircle, Clock, CreditCard, TrendingUp, Film, IndianRupee } from 'lucide-react';
import { fetchMyBookings } from '../services/api';
import { getMoviePosterUrl, getPosterFallback } from '../utils/moviePosters';

const UserDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await fetchMyBookings();
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };
    loadBookings();
  }, []);

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalSpent = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalSeats = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.seats?.length || 0), 0);
  const movieSummaries = bookings
    .filter((booking) => booking.status === 'confirmed')
    .reduce((groups, booking) => {
      const movie =
        (booking.movieId && typeof booking.movieId === 'object' && booking.movieId.title ? booking.movieId : null) ||
        (booking.showtimeId?.movieId && typeof booking.showtimeId.movieId === 'object' && booking.showtimeId.movieId.title
          ? booking.showtimeId.movieId
          : null);
      const movieId = movie?._id || booking.movieId || booking.showtimeId?.movieId;
      const key = movieId?.toString() || 'unknown-movie';

      if (!groups[key]) {
        groups[key] = {
          movie,
          bookings: 0,
          tickets: 0,
          totalSpent: 0,
          seats: [],
        };
      }

      groups[key].bookings += 1;
      groups[key].tickets += booking.seats?.length || 0;
      groups[key].totalSpent += booking.totalAmount || 0;
      groups[key].seats.push(...(booking.seats || []));
      return groups;
    }, {});
  const movieSummaryList = Object.values(movieSummaries);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: '1rem' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your dashboard...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeInUp 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            My Account
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff' }}>
            My Bookings &amp; Tickets
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            Review your upcoming showtimes, e-tickets, and transaction history.
          </p>
        </div>
        <Link to="/" className="btn-primary" style={{ padding: '0.65rem 1.3rem', fontSize: '0.88rem' }}>
          <Film size={16} /> Browse Movies
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          {
            icon: <Ticket size={22} color="#818cf8" />,
            iconBg: 'rgba(99,102,241,0.15)',
            label: 'Total Bookings',
            value: confirmedCount,
            sub: 'confirmed tickets',
          },
          {
            icon: <IndianRupee size={22} color="#34d399" />,
            iconBg: 'rgba(16,185,129,0.15)',
            label: 'Total Spent',
            value: `₹${totalSpent.toLocaleString()}`,
            sub: 'across all bookings',
          },
          {
            icon: <TrendingUp size={22} color="#fbbf24" />,
            iconBg: 'rgba(245,158,11,0.15)',
            label: 'Seats Booked',
            value: totalSeats,
            sub: 'movie seats total',
          },
        ].map(({ icon, iconBg, label, value, sub }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: iconBg }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.25rem' }}>{label}</p>
              <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {movieSummaryList.length > 0 && (
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Movie-wise summary
            </p>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>Your spending by movie</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {movieSummaryList.map(({ movie, bookings: movieBookings, tickets, totalSpent: movieTotalSpent, seats }) => (
              <div key={movie?._id || movie?.title || 'unknown-movie'} className="glass-panel" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <img
                    src={getMoviePosterUrl(movie)}
                    alt={movie?.title || 'Movie'}
                    referrerPolicy="no-referrer"
                    style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    onError={(e) => { e.target.onerror = null; e.target.src = getPosterFallback(movie?.title); }}
                  />
                  <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '800' }}>{movie?.title || 'Movie'}</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Bookings</p>
                    <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900' }}>{movieBookings}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Tickets</p>
                    <p style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: '900' }}>{tickets}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Total spent</p>
                    <p style={{ color: 'var(--accent-green)', fontSize: '1.2rem', fontWeight: '900' }}>₹{movieTotalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Seats booked</p>
                    <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '800', wordBreak: 'break-word' }}>{seats.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Ticket size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No movie bookings yet</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Browse now showing movies and reserve your favorite seats.</p>
          <Link to="/" className="btn-primary">Explore Movies</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((booking, idx) => {
            const { _id, showtimeId: showtime, seats, totalAmount, bookingCode, status, paymentId: payment, createdAt } = booking;
            const movie =
              (booking.movieId && typeof booking.movieId === 'object' && booking.movieId.title ? booking.movieId : null) ||
              (showtime?.movieId && typeof showtime.movieId === 'object' && showtime.movieId.title ? showtime.movieId : null) ||
              booking.movieId || showtime?.movieId;

            const isConfirmed = status === 'confirmed';
            const statusConfig = {
              confirmed: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: <CheckCircle size={13} />, label: 'CONFIRMED' },
              reserved:  { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: <Clock size={13} />, label: 'RESERVED' },
            };
            const sc = statusConfig[status] || { color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: <AlertCircle size={13} />, label: status?.toUpperCase() };

            return (
              <div
                key={_id}
                className="glass-panel animate-fadeInUp"
                style={{ padding: '1.5rem', animationDelay: `${idx * 0.05}s`, opacity: 0 }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <img
                    src={getMoviePosterUrl(movie)}
                    alt={movie?.title || 'Movie'}
                    referrerPolicy="no-referrer"
                    style={{ width: '64px', height: '90px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid var(--border-glass)' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = getPosterFallback(movie?.title); }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
                        {bookingCode}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, padding: '0.15rem 0.55rem', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.45rem', color: '#fff' }}>
                      {movie?.title || 'Movie'}
                    </h3>

                    <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} color="var(--accent-secondary)" /> {showtime?.theaterName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} color="var(--accent-primary)" /> {showtime?.dateTime ? new Date(showtime.dateTime).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Seats ({seats?.length})</div>
                    <div style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{seats?.join(', ')}</div>
                    <div style={{ fontWeight: '900', color: '#34d399', fontSize: '1.25rem' }}>₹{totalAmount}</div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CreditCard size={13} color="#818cf8" />
                      Payment: <strong style={{ color: 'var(--text-muted)' }}>{payment?.gateway?.toUpperCase() || 'RAZORPAY'}</strong>
                    </span>
                    <span>
                      Status: <strong style={{ color: '#34d399' }}>{payment?.status?.toUpperCase() || (isConfirmed ? 'SUCCEEDED' : 'PENDING')}</strong>
                    </span>
                    <span>
                      Date: <strong style={{ color: 'var(--text-muted)' }}>{new Date(payment?.updatedAt || createdAt).toLocaleDateString()}</strong>
                    </span>
                  </div>

                  {isConfirmed && (
                    <Link
                      to={`/confirmation/${_id}`}
                      className="btn-secondary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: '700' }}
                    >
                      <Ticket size={14} /> View E-Ticket
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
