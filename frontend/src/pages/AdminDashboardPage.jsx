import React, { useState, useEffect } from 'react';
import { Film, Calendar, Ticket, Plus, Trash2, ShieldCheck, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import {
  fetchMovies,
  createMovie,
  deleteMovie,
  createShowtime,
  fetchAllBookingsAdmin,
  uploadImage,
} from '../services/api';
import { getMoviePosterUrl, getPosterFallback } from '../utils/moviePosters';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // New Movie Form State
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genre: 'Action, Drama',
    language: 'Malayalam',
    duration: 140,
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    rating: 8.5,
    votesCount: '50.0K+',
    certification: 'UA16+',
    releaseDate: '',
    status: 'now_showing',
  });

  // New Showtime Form State
  const [newShowtime, setNewShowtime] = useState({
    movieId: '',
    theaterName: 'PVR Lulu Mall Kochi',
    screenName: 'IMAX Screen 1',
    dateTime: '',
    rows: 5,
    cols: 8,
    basePrice: 240,
  });

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setMsg('');
    setErrorMsg('');
    try {
      if (activeTab === 'movies' || activeTab === 'showtimes') {
        const res = await fetchMovies({});
        setMovies(res.data);
        if (res.data.length > 0 && !newShowtime.movieId) {
          setNewShowtime((prev) => ({ ...prev, movieId: res.data[0]._id }));
        }
      } else if (activeTab === 'bookings') {
        const res = await fetchAllBookingsAdmin();
        setBookings(res.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePosterFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPoster(true);
    setErrorMsg('');
    try {
      const res = await uploadImage(file);
      if (res.url) {
        setNewMovie((prev) => ({ ...prev, posterUrl: res.url }));
        setMsg('Poster image uploaded successfully!');
      }
    } catch (err) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleBannerFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    setErrorMsg('');
    try {
      const res = await uploadImage(file);
      if (res.url) {
        setNewMovie((prev) => ({ ...prev, bannerUrl: res.url }));
        setMsg('Banner image uploaded successfully!');
      }
    } catch (err) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    if (!newMovie.posterUrl) {
      setErrorMsg('Poster Image URL or File Upload is required!');
      return;
    }
    try {
      const payload = {
        ...newMovie,
        genre: newMovie.genre.split(',').map((g) => g.trim()).filter(Boolean),
        duration: Number(newMovie.duration),
        rating: Number(newMovie.rating),
      };
      await createMovie(payload);
      setMsg('Movie added successfully!');
      setNewMovie({
        title: '',
        description: '',
        genre: 'Action, Drama',
        language: 'Malayalam',
        duration: 140,
        posterUrl: '',
        bannerUrl: '',
        trailerUrl: '',
        rating: 8.5,
        votesCount: '50.0K+',
        certification: 'UA16+',
        releaseDate: '',
        status: 'now_showing',
      });
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    setMsg('');
    setErrorMsg('');
    try {
      await deleteMovie(id);
      setMsg('Movie deleted successfully!');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete movie');
    }
  };

  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    try {
      await createShowtime(newShowtime);
      setMsg('Showtime & seat map generated successfully!');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create showtime');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'calc(2rem - 2px)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck color="#f472b6" /> Admin Control Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage cinema movies with Multer image upload, schedule showtimes with auto seat layouts, and view all bookings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.8rem' }}>
        <button
          onClick={() => setActiveTab('movies')}
          className="btn-secondary"
          style={{
            background: activeTab === 'movies' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'center',
          }}
        >
          <Film size={18} /> Manage Movies
        </button>
        <button
          onClick={() => setActiveTab('showtimes')}
          className="btn-secondary"
          style={{
            background: activeTab === 'showtimes' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'center',
          }}
        >
          <Calendar size={18} /> Add Showtimes
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className="btn-secondary"
          style={{
            background: activeTab === 'bookings' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'center',
          }}
        >
          <Ticket size={18} /> All System Bookings
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle size={18} /> {msg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={18} /> {errorMsg}
        </div>
      )}

      {activeTab === 'movies' && (
        <div className="admin-split-layout">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: 'calc(1.2rem - 2px)', fontWeight: '700', marginBottom: '1.2rem' }}>Current Catalog ({movies.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {movies.map((m) => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={getMoviePosterUrl(m)}
                      alt={m.title}
                      referrerPolicy="no-referrer"
                      style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getPosterFallback(m.title);
                      }}
                    />
                    <div>
                      <h4 style={{ fontWeight: '700' }}>{m.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.language} • {m.duration} min • Rating: ★ {m.rating}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMovie(m._id)} style={{ background: 'none', color: '#f87171', padding: '0.4rem' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateMovie} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} /> Add New Movie
            </h3>
            <input placeholder="Movie Title" required value={newMovie.title} onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })} className="input-field" />
            <textarea placeholder="Description" required value={newMovie.description} onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })} className="input-field" rows={3} />
            <input placeholder="Genre (comma separated, e.g. Action, Drama)" required value={newMovie.genre} onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })} className="input-field" />
            <input placeholder="Language (e.g. Malayalam, Tamil)" required value={newMovie.language} onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })} className="input-field" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <input type="number" placeholder="Duration (mins)" required value={newMovie.duration} onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })} className="input-field" />
              <input type="number" step="0.1" placeholder="Rating (0-10)" required value={newMovie.rating} onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })} className="input-field" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <input placeholder="Certification (e.g. U, UA16+, A)" value={newMovie.certification} onChange={(e) => setNewMovie({ ...newMovie, certification: e.target.value })} className="input-field" />
              <input placeholder="Votes Count (e.g. 50.0K+)" value={newMovie.votesCount} onChange={(e) => setNewMovie({ ...newMovie, votesCount: e.target.value })} className="input-field" />
            </div>

            <input placeholder="YouTube Trailer URL (e.g. https://www.youtube.com/watch?v=...)" value={newMovie.trailerUrl} onChange={(e) => setNewMovie({ ...newMovie, trailerUrl: e.target.value })} className="input-field" />

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={16} color="var(--accent-primary)" /> Poster Image (Upload file via Multer or paste URL)
              </label>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterFileUpload}
                  style={{ display: 'none' }}
                  id="poster-file-input"
                />
                <label
                  htmlFor="poster-file-input"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                >
                  <Upload size={14} /> {uploadingPoster ? 'Uploading...' : 'Upload File'}
                </label>
                <input
                  placeholder="Or paste Poster Image URL"
                  value={newMovie.posterUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              {newMovie.posterUrl && (
                <div style={{ fontSize: '0.75rem', color: '#34d399', wordBreak: 'break-all' }}>
                  ✓ Poster URL: {newMovie.posterUrl}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={16} color="var(--accent-secondary)" /> Banner Backdrop Image (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileUpload}
                  style={{ display: 'none' }}
                  id="banner-file-input"
                />
                <label
                  htmlFor="banner-file-input"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                >
                  <Upload size={14} /> {uploadingBanner ? 'Uploading...' : 'Upload File'}
                </label>
                <input
                  placeholder="Or paste Banner Image URL"
                  value={newMovie.bannerUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, bannerUrl: e.target.value })}
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <input type="date" required value={newMovie.releaseDate} onChange={(e) => setNewMovie({ ...newMovie, releaseDate: e.target.value })} className="input-field" />
            <select value={newMovie.status} onChange={(e) => setNewMovie({ ...newMovie, status: e.target.value })} className="input-field">
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>Save Movie</button>
          </form>
        </div>
      )}

      {activeTab === 'showtimes' && (
        <form onSubmit={handleCreateShowtime} className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Schedule Showtime & Auto Seats</h3>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Select Movie</label>
            <select value={newShowtime.movieId} onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })} className="input-field">
              {movies.map((m) => (
                <option key={m._id} value={m._id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Theater Name</label>
            <input value={newShowtime.theaterName} onChange={(e) => setNewShowtime({ ...newShowtime, theaterName: e.target.value })} className="input-field" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Screen Name</label>
              <input value={newShowtime.screenName} onChange={(e) => setNewShowtime({ ...newShowtime, screenName: e.target.value })} className="input-field" />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Base Price (₹)</label>
              <input type="number" value={newShowtime.basePrice} onChange={(e) => setNewShowtime({ ...newShowtime, basePrice: Number(e.target.value) })} className="input-field" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Date and Time</label>
            <input type="datetime-local" required value={newShowtime.dateTime} onChange={(e) => setNewShowtime({ ...newShowtime, dateTime: e.target.value })} className="input-field" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Seat Grid Rows</label>
              <input type="number" min={1} max={10} value={newShowtime.rows} onChange={(e) => setNewShowtime({ ...newShowtime, rows: Number(e.target.value) })} className="input-field" />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Seat Grid Columns</label>
              <input type="number" min={1} max={12} value={newShowtime.cols} onChange={(e) => setNewShowtime({ ...newShowtime, cols: Number(e.target.value) })} className="input-field" />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
            Schedule Showtime ({newShowtime.rows * newShowtime.cols} Seats Auto-Generated)
          </button>
        </form>
      )}

      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Ticket color="var(--accent-primary)" /> All Users Booking History ({bookings.length})
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Comprehensive one-by-one record of all cinema reservations, customer details, and payment transactions.
              </p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Ticket size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h4>No bookings found in the system yet.</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {bookings.map((b, idx) => (
                <div
                  key={b._id}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem',
                    borderLeft: b.status === 'confirmed' ? '4px solid #10b981' : '4px solid #f59e0b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top row: Counter, Booking Code & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>
                        #{idx + 1}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--accent-primary)' }}>
                        {b.bookingCode}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(b.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span
                        style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: b.status === 'confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: b.status === 'confirmed' ? '#34d399' : '#fbbf24',
                          border: `1px solid ${b.status === 'confirmed' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        }}
                      >
                        {b.status === 'confirmed' ? '✓ Confirmed' : b.status}
                      </span>
                    </div>
                  </div>

                  {/* Middle row: 3-column Grid for User, Movie, Payment info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                    {/* Customer Info */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '700' }}>
                        Customer Info
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>
                        {b.userId?.name || 'Guest User'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
                        {b.userId?.email || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        User Role: <span style={{ textTransform: 'capitalize', color: '#cbd5e1' }}>{b.userId?.role || 'user'}</span>
                      </div>
                    </div>

                    {/* Movie & Showtime Info */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '700' }}>
                        Movie & Screening
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>
                        {b.movieId?.title || 'Movie'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {b.showtimeId?.theaterName || 'Theater'} • {b.showtimeId?.screenName || 'Screen 1'}
                      </div>
                      {b.showtimeId?.dateTime && (
                        <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '0.2rem' }}>
                          📅 {new Date(b.showtimeId.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      )}
                    </div>

                    {/* Seats & Payment */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '700' }}>
                        Seats & Total Paid
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Seats:</span>
                        {b.seats?.map((seat) => (
                          <span
                            key={seat}
                            style={{
                              background: 'rgba(236,72,153,0.15)',
                              border: '1px solid rgba(236,72,153,0.3)',
                              color: '#f472b6',
                              padding: '0.1rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                            }}
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34d399' }}>
                        ₹{b.totalAmount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                        Txn ID: {b.paymentId?.gatewayPaymentId || b.paymentId?._id || (b.status === 'confirmed' ? `pay_rzp_${b._id.slice(-8)}` : 'Pending')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
