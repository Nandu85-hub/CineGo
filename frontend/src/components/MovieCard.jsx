import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Play } from 'lucide-react';
import { getMoviePosterUrl, getPosterFallback, getMovieTrailerUrl } from '../utils/moviePosters';

const MovieCard = ({ movie }) => {
  const { _id, title, rating, duration, genre, language, status } = movie;
  const imageSrc = getMoviePosterUrl(movie);
  const trailerUrl = getMovieTrailerUrl(movie);

  return (
    <div
      className="glass-panel"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-smooth)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--border-glass)';
      }}
    >
      {/* Poster */}
      <div className="movie-card-poster">
        <img
          src={imageSrc}
          alt={title}
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onError={(e) => { e.target.onerror = null; e.target.src = getPosterFallback(title); }}
        />

        <div className="poster-overlay-gradient" />

        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
          {status === 'now_showing'
            ? <span className="badge badge-now">Now Showing</span>
            : <span className="badge badge-soon">Coming Soon</span>
          }
        </div>

        {/* Trailer Button */}
        <a
          href={trailerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Watch ${title} Trailer`}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 3,
            background: 'rgba(8,10,20,0.88)',
            backdropFilter: 'blur(8px)',
            padding: '0.32rem 0.6rem',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontWeight: '700', fontSize: '0.72rem', color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            transition: 'background 0.2s',
            textDecoration: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236,72,153,0.92)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(8,10,20,0.88)'; }}
        >
          <Play size={10} color="#ec4899" fill="#ec4899" /> Trailer
        </a>

        <div
          style={{
            position: 'absolute', bottom: '10px', right: '10px', zIndex: 2,
            background: 'rgba(8,10,20,0.9)', backdropFilter: 'blur(8px)',
            padding: '0.28rem 0.55rem', borderRadius: '7px',
            display: 'flex', alignItems: 'center', gap: '0.28rem',
            fontWeight: '800', fontSize: '0.82rem', color: '#fbbf24',
            border: '1px solid rgba(251,191,36,0.25)',
          }}
        >
          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {rating}
        </div>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', gap: '0.8rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{language}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={11} /> {duration} min
            </span>
          </div>

          <h3
            style={{
              fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.55rem',
              lineHeight: '1.3', overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {genre.slice(0, 3).map((g, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.68rem', fontWeight: '600',
                  background: 'rgba(99,102,241,0.1)',
                  color: '#818cf8',
                  padding: '0.18rem 0.48rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/movie/${_id}`}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', textAlign: 'center', padding: '0.6rem 0.5rem', fontSize: '0.85rem' }}
          >
            <Ticket size={14} /> Book Tickets
          </Link>
          <a
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            title={`Watch ${title} Trailer`}
            style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
          >
            <Play size={13} color="#ec4899" fill="#ec4899" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
