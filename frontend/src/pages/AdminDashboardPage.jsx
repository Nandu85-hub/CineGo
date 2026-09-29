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
        <div className="glass-panel overflow-scroll-container" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem' }}>All System Bookings & Payment Records ({bookings.length})</h3>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem' }}>Code</th>
                <th style={{ padding: '0.8rem' }}>User</th>
                <th style={{ padding: '0.8rem' }}>Movie</th>
                <th style={{ padding: '0.8rem' }}>Seats</th>
                <th style={{ padding: '0.8rem' }}>Amount</th>
                <th style={{ padding: '0.8rem' }}>Booking Status</th>
                <th style={{ padding: '0.8rem' }}>Payment Txn ID</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.8rem', fontFamily: 'monospace', fontWeight: '700' }}>{b.bookingCode}</td>
                  <td style={{ padding: '0.8rem' }}>{b.userId?.name} ({b.userId?.email})</td>
                  <td style={{ padding: '0.8rem' }}>{b.movieId?.title}</td>
                  <td style={{ padding: '0.8rem', color: 'var(--accent-gold)' }}>{b.seats.join(', ')}</td>
                  <td style={{ padding: '0.8rem', color: 'var(--accent-green)', fontWeight: '700' }}>₹{b.totalAmount}</td>
                  <td style={{ padding: '0.8rem', fontWeight: '700' }}>{b.status}</td>
                  <td style={{ padding: '0.8rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#818cf8' }}>
                    {b.paymentId?.gatewayPaymentId || b.paymentId?._id || (b.status === 'confirmed' ? `pay_test_${b._id.slice(-6)}` : 'N/A')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
