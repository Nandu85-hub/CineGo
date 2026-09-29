import React, { useState, useEffect } from 'react';
import { Search, Film, Sparkles, Filter, Globe, Ticket, Star, Clock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMovies } from '../services/api';
import MovieCard from '../components/MovieCard';
import { getMoviePosterUrl, getPosterFallback, getMovieTrailerUrl } from '../utils/moviePosters';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('now_showing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const languagesList = ['All', 'Malayalam', 'Tamil', 'Telugu', 'Hindi', 'English'];

  useEffect(() => {
    loadMovies();
  }, [activeTab, selectedGenre, selectedLanguage]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const params = { status: activeTab };
      if (selectedGenre) params.genre = selectedGenre;
      if (selectedLanguage && selectedLanguage !== 'All') params.language = selectedLanguage;
      if (searchQuery) params.search = searchQuery;

      const res = await fetchMovies(params);
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMovies();
  };

  const handleLanguageSelect = (lang) => {
    if (lang === 'All') {
      setSelectedLanguage('');
    } else {
      setSelectedLanguage(lang);
    }
  };

  // Find Bethlehem Kudumba Unit featured movie object
  const featuredMovie = movies.find(
    (m) => m.title.toLowerCase().includes('bethlehem') || m.title.toLowerCase().includes('kudumba')
  ) || movies[0];

  const featuredPoster = featuredMovie ? getMoviePosterUrl(featuredMovie) : '/posters/bethlehem_kudumba_unit.jpg';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Bethlehem Kudumba Unit Cinematic Hero Banner */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#0a0c16',
        }}
      >
        {/* Additional Full BKU Film Poster Background Backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${featuredPoster}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            filter: 'brightness(0.42) blur(3px)',
            transform: 'scale(1.04)',
          }}
        />

        {/* Cinematic Multi-layered Shadow & Vignette Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 75% 50%, rgba(10, 12, 22, 0.2) 0%, rgba(10, 12, 22, 0.8) 80%), linear-gradient(90deg, rgba(10, 12, 22, 0.94) 0%, rgba(10, 12, 22, 0.68) 50%, rgba(10, 12, 22, 0.88) 100%)',
            boxShadow: 'inset 0 0 100px #000',
          }}
        />

        {/* Banner Content Container */}
        <div className="hero-banner-content">
          {/* Small Film Poster Image Card with Shadow */}
          <div className="hero-poster-card">
            <img
              src={featuredPoster}
              alt={featuredMovie ? featuredMovie.title : 'Bethlehem Kudumba Unit'}
              referrerPolicy="no-referrer"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getPosterFallback(featuredMovie?.title || 'Bethlehem Kudumba Unit');
              }}
            />
          </div>

          {/* Title & Info */}
          <div className="hero-info-column" style={{ flex: 1, minWidth: '280px' }}>
            <div
              className="hero-badge-wrap"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#818cf8',
                padding: '0.35rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '700',
                marginBottom: '0.8rem',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={16} /> 🔥 FEATURED MALAYALAM BLOCKBUSTER
            </div>

            <h1
              style={{
                fontSize: 'calc(2.2rem - 2px)',
                fontWeight: '800',
                lineHeight: '1.2',
                color: '#ffffff',
                marginBottom: '0.5rem',
                textShadow: '0 4px 15px rgba(0,0,0,0.9)',
              }}
            >
              {featuredMovie ? featuredMovie.title : 'Bethlehem Kudumba Unit'}
            </h1>

            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '1.2rem', maxWidth: '620px' }}>
              {featuredMovie ? featuredMovie.description : 'Bethlehem Kudumba Unit revolves around heartwarming family moments, hilarious situations, and emotional relationships in Kerala.'}
            </p>

            <div className="hero-badge-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-now">Now Showing</span>
              <span style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px', color: '#fff' }}>
                {featuredMovie ? featuredMovie.language : 'Malayalam'}
              </span>
              <span style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Clock size={13} /> {featuredMovie ? featuredMovie.duration : 135} mins
              </span>
              <span style={{ fontSize: '0.82rem', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Star size={13} fill="#fbbf24" /> {featuredMovie ? featuredMovie.rating : 8.7} / 10 ({featuredMovie?.votesCount || '34.5K+'})
              </span>
            </div>

            {featuredMovie && (
              <div className="hero-actions-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <Link
                  to={`/movie/${featuredMovie._id}`}
                  className="btn-primary"
                  style={{
                    padding: '0.9rem 1.8rem',
                    fontSize: '1.05rem',
                    fontWeight: '800',
                    display: 'inline-flex',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
                  }}
                >
                  <Ticket size={20} /> Book Tickets Now
                </Link>

                <a
                  href={getMovieTrailerUrl(featuredMovie)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    padding: '0.9rem 1.6rem',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                  }}
                >
                  <Play size={18} color="#ec4899" fill="#ec4899" /> Watch Trailer
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '1.2rem 1.8rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <form onSubmit={handleSearchSubmit} className="movie-search-form">
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search movies by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', height: '48px', fontSize: '1rem' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: '48px', padding: '0 1.5rem' }}>
            Search
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.95rem' }}>
          <Globe size={18} color="var(--accent-primary)" /> Filter by Language:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {languagesList.map((lang) => {
            const isSelected = (lang === 'All' && !selectedLanguage) || selectedLanguage.toLowerCase() === lang.toLowerCase();
            return (
              <button
                key={lang}
                onClick={() => handleLanguageSelect(lang)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#818cf8' : 'var(--text-muted)',
                }}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => setActiveTab('now_showing')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: activeTab === 'now_showing' ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' : 'rgba(255,255,255,0.04)',
              color: activeTab === 'now_showing' ? '#fff' : 'var(--text-muted)',
            }}
          >
            🔥 Now Showing
          </button>
          <button
            onClick={() => setActiveTab('coming_soon')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: activeTab === 'coming_soon' ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' : 'rgba(255,255,255,0.04)',
              color: activeTab === 'coming_soon' ? '#fff' : 'var(--text-muted)',
            }}
          >
            🚀 Coming Soon
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="input-field"
            style={{ width: '180px', padding: '0.5rem 0.8rem' }}
          >
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Drama">Drama</option>
            <option value="Comedy">Comedy</option>
            <option value="Family">Family</option>
            <option value="Romance">Romance</option>
            <option value="Thriller">Thriller</option>
            <option value="Mystery">Mystery</option>
            <option value="Crime">Crime</option>
            <option value="Survival">Survival</option>
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Adventure">Adventure</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading movies...
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Film size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No movies found</h3>
          <p style={{ fontSize: '0.9rem' }}>Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
