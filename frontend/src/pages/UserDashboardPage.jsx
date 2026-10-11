import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Ticket, AlertCircle, CheckCircle,
  Clock, CreditCard, Film, Search, Filter, ChevronDown
} from 'lucide-react';
import { fetchMyBookings } from '../services/api';
import { getMoviePosterUrl, getPosterFallback } from '../utils/moviePosters';

const STATUS_CONFIG = {
  confirmed: {
    color: '#34d399', bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)', icon: <CheckCircle size={13} />, label: 'CONFIRMED',
  },
  reserved: {
    color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)', icon: <Clock size={13} />, label: 'RESERVED',
  },
  pending: {
    color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)', icon: <Clock size={13} />, label: 'PENDING',
  },
  cancelled: {
    color: '#f87171', bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)', icon: <AlertCircle size={13} />, label: 'CANCELLED',
  },
  expired: {
    color: '#94a3b8', bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.2)', icon: <AlertCircle size={13} />, label: 'EXPIRED',
  },
};

const UserDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMyBookings();
        const data = res.data || [];
        setBookings(data);
        setFiltered(data);
      } catch (err) {
        setError('Failed to load booking history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    })();
  }, []);

  // Filter whenever search or status changes
  useEffect(() => {
    let list = [...bookings];
    if (statusFilter !== 'all') {
      list = list.filter(b => b.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => {
        const movie =
          (b.movieId?.title) ||
          (b.showtimeId?.movieId?.title) || '';
        return (
          movie.toLowerCase().includes(q) ||
          b.bookingCode?.toLowerCase().includes(q) ||
          b.showtimeId?.theaterName?.toLowerCase().includes(q)
        );
      });
    }
    setFiltered(list);
  }, [search, statusFilter, bookings]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: '1rem' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your bookings...</p>
    </div>
  );

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeInUp 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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

      {/* Summary Stats */}
      {bookings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Bookings', value: bookings.length, sub: 'all time', color: '#818cf8' },
            { label: 'Confirmed', value: confirmedCount, sub: 'successful tickets', color: '#34d399' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, sub: 'on confirmed tickets', color: '#fbbf24' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Ticket size={24} color={color} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</p>
                <p style={{ fontSize: '1.35rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1rem 1.2rem', color: '#f87171', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      {bookings.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by movie, code, or theatre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.3rem', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', paddingRight: '2rem', fontSize: '0.875rem', cursor: 'pointer', appearance: 'none', minWidth: '160px' }}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && !error ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Ticket size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No bookings yet</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Browse now showing movies and reserve your favourite seats.</p>
          <Link to="/" className="btn-primary">Explore Movies</Link>
        </div>
      ) : filtered.length === 0 && bookings.length > 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Search size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No results found</h3>
          <p style={{ fontSize: '0.875rem' }}>Try a different search term or filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Section heading */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Booking History — {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            </p>
          </div>

          {filtered.map((booking, idx) => {
            const {
              _id, showtimeId: showtime, seats, totalAmount,
              bookingCode, status, paymentId: payment, createdAt,
            } = booking;

            const movie =
              (booking.movieId?.title ? booking.movieId : null) ||
              (showtime?.movieId?.title ? showtime.movieId : null) ||
              null;

            const isConfirmed = status === 'confirmed';
            const sc = STATUS_CONFIG[status] || STATUS_CONFIG.expired;

            return (
              <div
                key={_id}
                className="glass-panel animate-fadeInUp"
                style={{ padding: '1.5rem', animationDelay: `${idx * 0.05}s`, opacity: 0, borderLeft: `3px solid ${sc.color}` }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  {/* Poster */}
                  <img
                    src={getMoviePosterUrl(movie)}
                    alt={movie?.title || 'Movie'}
                    referrerPolicy="no-referrer"
                    style={{ width: '60px', height: '84px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid var(--border-glass)' }}
                    onError={e => { e.target.onerror = null; e.target.src = getPosterFallback(movie?.title); }}
                  />

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Code + Status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
                        {bookingCode}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, padding: '0.15rem 0.5rem', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    {/* Movie title */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: '#fff' }}>
                      {movie?.title || 'Movie'}
                    </h3>

                    {/* Theatre & Date */}
                    <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={12} color="var(--accent-secondary)" />
                        {showtime?.theaterName || '—'}
                        {showtime?.screenName && <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>&nbsp;• {showtime.screenName}</span>}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} color="var(--accent-primary)" />
                        {showtime?.dateTime ? new Date(showtime.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </span>
                    </div>

                    {/* Seats */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {seats?.map(seat => (
                        <span key={seat} style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent-gold)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                      {seats?.length} seat{seats?.length !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontWeight: '900', color: '#34d399', fontSize: '1.3rem' }}>
                      ₹{totalAmount?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      {new Date(createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Footer row */}
                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.77rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CreditCard size={12} color="#818cf8" />
                      Payment:&nbsp;<strong style={{ color: 'var(--text-muted)' }}>
                        {payment?.gateway?.toUpperCase() || 'RAZORPAY'}
                      </strong>
                    </span>
                    <span>
                      Pay Status:&nbsp;<strong style={{ color: isConfirmed ? '#34d399' : '#fbbf24' }}>
                        {payment?.status?.toUpperCase() || (isConfirmed ? 'SUCCEEDED' : 'PENDING')}
                      </strong>
                    </span>
                    {payment?.gatewayOrderId && (
                      <span style={{ fontFamily: 'monospace', color: '#818cf8' }}>
                        {payment.gatewayOrderId}
                      </span>
                    )}
                  </div>

                  {isConfirmed && (
                    <Link
                      to={`/confirmation/${_id}`}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: '700' }}
                    >
                      <Ticket size={13} /> View E-Ticket
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
