import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const fillPreset = (type) => {
    if (type === 'admin') {
      setEmail('admin@moviebook.com');
      setPassword('admin123');
    } else {
      setEmail('user@moviebook.com');
      setPassword('user123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!isLoginView) {
      if (normalizedName.length < 2 || normalizedName.length > 50) {
        setError('Name must be between 2 and 50 characters.');
        return;
      }
      if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLoginView) {
        await login({ email: normalizedEmail, password });
      } else {
        await register({ name: normalizedName, email: normalizedEmail, password, role });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {isLoginView && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <button
              type="button"
              onClick={() => fillPreset('user')}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => fillPreset('admin')}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderColor: 'rgba(236,72,153,0.4)', color: '#f472b6' }}
            >
              Admin
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLoginView && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Full Name</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nandhana"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@moviebook.com"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          {!isLoginView && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : isLoginView ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isLoginView ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
            }}
            style={{ background: 'none', color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'underline' }}
          >
            {isLoginView ? 'Register here' : 'Login here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
