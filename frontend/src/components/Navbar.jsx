import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Ticket, ShieldAlert, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className="glass-panel"
        style={{
          borderRadius: 0,
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10, 12, 22, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          className="app-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '70px',
          }}
        >
          <Link
            to="/"
            onClick={handleLinkClick}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Film color="#fff" size={22} />
            </div>
            <span
              style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}
              className="gradient-text"
            >
              CineGo
            </span>
          </Link>

          <div
            className="navbar-desktop-links"
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
          >
            <Link to="/" style={{ color: 'var(--text-main)', fontWeight: '500' }}>
              Movies
            </Link>

            {user && (
              <Link
                to="/my-bookings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-main)',
                  fontWeight: '500',
                }}
              >
                <Ticket size={18} color="var(--accent-primary)" />
                My Bookings
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#f472b6',
                  fontWeight: '600',
                  background: 'rgba(236,72,153,0.1)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(236,72,153,0.3)',
                }}
              >
                <ShieldAlert size={18} />
                Admin Panel
              </Link>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                  }}
                >
                  <User size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</span>
                  {isAdmin && <span className="badge badge-vip" style={{ fontSize: '0.65rem' }}>Admin</span>}
                </div>

                <button
                  onClick={logout}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="btn-primary">
                Sign In / Register
              </button>
            )}
          </div>

          <div className="navbar-mobile-toggle">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="navbar-mobile-dropdown"
            style={{
              padding: '1.2rem 1.5rem',
              borderTop: '1px solid var(--border-glass)',
              background: 'rgba(10, 12, 22, 0.98)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.6rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '0.4rem',
                }}
              >
                <User size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user.name}</span>
                {isAdmin && <span className="badge badge-vip" style={{ fontSize: '0.65rem' }}>Admin</span>}
              </div>
            )}

            <Link
              to="/"
              onClick={handleLinkClick}
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                padding: '0.5rem 0',
              }}
            >
              Movies
            </Link>

            {user && (
              <Link
                to="/my-bookings"
                onClick={handleLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  padding: '0.5rem 0',
                }}
              >
                <Ticket size={18} color="var(--accent-primary)" />
                My Bookings
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={handleLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f472b6',
                  padding: '0.5rem 0',
                }}
              >
                <ShieldAlert size={18} />
                Admin Panel
              </Link>
            )}

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthOpen(true);
                    handleLinkClick();
                  }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />}
    </>
  );
};

export default Navbar;
