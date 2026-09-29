import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Globe, Calendar, Play, Share2, Ticket, ChevronRight, Info, Film } from 'lucide-react';
import { fetchMovieById, fetchShowtimesByMovie } from '../services/api';
import ShowtimeCard from '../components/ShowtimeCard';
import { getMoviePosterUrl, getPosterFallback, getMovieTrailerUrl } from '../utils/moviePosters';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [movieRes, showtimeRes] = await Promise.all([
        fetchMovieById(id),
        fetchShowtimesByMovie(id),
      ]);
      setMovie(movieRes.data);
      setShowtimes(showtimeRes.data);
    } catch (err) {
      console.error(err);
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

  const handleSelectShowtime = (showtimeId) => {
    navigate(`/seats/${showtimeId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Check out ${movie?.title} on CineGo!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Movie link copied to clipboard!');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: '1rem' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading movie details...</p>
    </div>
  );
  if (!movie) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem', color: 'var(--text-muted)', gap: '1rem' }}>
      <Film size={52} style={{ opacity: 0.2 }} />
      <p>Movie not found</p>
    </div>
  );

  const durationHours = Math.floor((movie.duration || 120) / 60);
  const durationMins = (movie.duration || 120) % 60;
  const formattedDuration = `${durationHours}h ${durationMins}m`;

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '2026';
  const genresString = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || 'Action';
  const formatsList = movie.formats && movie.formats.length > 0 ? movie.formats : ['2D', 'HDR By Barco', 'IMAX 2D', 'DOLBY CINEMA 2D'];
  const languagesList = movie.availableLanguages && movie.availableLanguages.length > 0 ? movie.availableLanguages : [movie.language || 'Malayalam'];
  const currentPoster = getMoviePosterUrl(movie);
  const currentBackdrop = currentPoster;
  const trailerHref = getMovieTrailerUrl(movie);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#090b14',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${currentBackdrop}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.45)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(10, 12, 22, 0.95) 0%, rgba(10, 12, 22, 0.75) 50%, rgba(10, 12, 22, 0.92) 100%)',
          }}
        />

        <div className="movie-detail-banner-content">
          {/* Left Poster Image Card */}
          <div
            className="detail-poster-card"
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '240px',
              height: '350px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <img
              src={currentPoster}
              alt={movie.title}
              referrerPolicy="no-referrer"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getPosterFallback(movie.title);
              }}
            />
            <a
              href={trailerHref}
              target="_blank"
              rel="noopener noreferrer"
              title={`Watch ${movie.title} Trailer on YouTube`}
              style={{
                position: 'absolute',
                bottom: 0,
                insetX: 0,
                width: '100%',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '0.6rem 0.5rem',
                textAlign: 'center',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(236, 72, 153, 0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)')}
            >
              <Play size={13} fill="#fff" /> Watch Trailer
            </a>
          </div>

          <div className="detail-info-column" style={{ flex: 1, color: '#ffffff' }}>
            <h1
              style={{
                fontSize: 'calc(2.5rem - 2px)',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
                color: '#ffffff',
                textShadow: '0 4px 15px rgba(0, 0, 0, 0.8)',
              }}
            >
              {movie.title}
            </h1>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                background: 'rgba(22, 27, 46, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '0.8rem 1.2rem',
                borderRadius: '12px',
                marginBottom: '1.2rem',
                maxWidth: '460px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Star size={24} fill="#eb4e62" color="#eb4e62" />
                <div>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                    {movie.rating} / 10
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginLeft: '0.5rem' }}>
                    ({movie.votesCount || '67.1K+ Votes'}) <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </span>
                </div>
              </div>
              <button
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
                onClick={() => alert('Rating submitted!')}
              >
                Rate now
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem 1rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '1rem',
              }}
            >
              <span>{formattedDuration}</span>
              <span>•</span>
              <span>{genresString}</span>
              <span>•</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                {movie.certification || 'UA16+'}
              </span>
              <span>•</span>
              <span>{releaseYear}</span>
            </div>

            {/* Formats Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              {formatsList.map((fmt, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.8rem', alignItems: 'center' }}>
              {languagesList.map((lang, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    background: 'rgba(99, 102, 241, 0.25)',
                    color: '#a5b4fc',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('showtimes-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn-primary"
                style={{
                  padding: '0.9rem 2.2rem',
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  boxShadow: '0 8px 25px rgba(225, 29, 72, 0.5)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <Ticket size={20} /> Book tickets
              </button>

              <button
                onClick={handleShare}
                className="btn-secondary"
                style={{
                  padding: '0.9rem 1.4rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Share2 size={18} /> Share
              </button>

              <a
                href={trailerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  padding: '0.9rem 1.4rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                }}
              >
                <Play size={18} color="#ec4899" fill="#ec4899" /> Watch Trailer
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem 2.5rem' }}>
        <h2 style={{ fontSize: 'calc(1.5rem - 2px)', fontWeight: '800', marginBottom: '0.8rem', color: '#fff' }}>
          About the movie
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem', lineHeight: '1.7', maxWidth: '900px' }}>
          {movie.description}
        </p>
      </div>

      <div id="showtimes-section">
        <h2 style={{ fontSize: 'calc(1.6rem - 2px)', fontWeight: '800', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          Available Showtimes & Theaters
        </h2>

        {showtimes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Info size={36} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
            <p>No active showtimes scheduled for this movie currently. Please check back soon!</p>
          </div>
        ) : (
          <div>
            {showtimes.map((st) => (
              <ShowtimeCard key={st._id} showtime={st} onSelect={handleSelectShowtime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
