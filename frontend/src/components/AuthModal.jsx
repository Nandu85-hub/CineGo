import React, { useState, useEffect, useRef } from 'react';
import { X, CircleAlert, CheckCircle2, Info, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail, forgotPassword } from '../services/api';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const [modalMode, setModalMode] = useState(initialView === 'login' ? 'login' : 'register'); // 'login' | 'register' | 'forgot'

  useEffect(() => {
    setModalMode(initialView === 'login' ? 'login' : 'register');
  }, [initialView]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const redirectTimeoutRef = useRef(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast || toast.persistent) return undefined;
    const timeout = setTimeout(() => setToast(null), toast.duration || 4500);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => () => clearTimeout(redirectTimeoutRef.current), []);

  if (!isOpen) return null;

  const fillPreset = (type) => {
    setRole(type);
    setFieldErrors({});
    setToast(null);
  };

  const safeAuthError = (err, mode) => {
    const message = err?.message?.toLowerCase() || '';
    if (mode === 'login' && message.includes('invalid email or password')) {
      return 'Invalid email or password. Please try again.';
    }
    if (mode === 'register' && (message.includes('already exists') || message.includes('already registered'))) {
      return 'This email is already registered. Please sign in.';
    }
    if (mode === 'forgot') {
      return err?.message || 'Failed to send password reset email. Please try again.';
    }
    return mode === 'login'
      ? 'We couldn’t sign you in. Please check your details and try again.'
      : 'We couldn’t create your account. Please try again.';
  };

  const validateForm = () => {
    const errors = {};
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (modalMode === 'register' && !normalizedName) {
      errors.name = 'Full name is required.';
    } else if (modalMode === 'register' && (normalizedName.length < 2 || normalizedName.length > 50)) {
      errors.name = 'Name must be between 2 and 50 characters.';
    }

    if (!normalizedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (modalMode !== 'forgot') {
      if (!password) {
        errors.password = 'Password is required.';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }
    }

    setFieldErrors(errors);
    setToast(null);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isCompleting || !validateForm()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    setLoading(true);

    try {
      if (modalMode === 'login') {
        await login({ email: normalizedEmail, password });
        setIsCompleting(true);
        setToast({
          type: 'success',
          message: 'Login successful! Welcome back to CineGo.',
          duration: 3000,
          simple: true,
        });
        redirectTimeoutRef.current = setTimeout(onClose, 3000);
      } else if (modalMode === 'register') {
        const data = await register({ name: normalizedName, email: normalizedEmail, password, role });
        const verificationEmail = data.email || normalizedEmail;
        localStorage.setItem('pendingVerifyEmail', verificationEmail);
        setIsCompleting(true);
        setToast({ type: 'success', message: 'Account created successfully!' });
        redirectTimeoutRef.current = setTimeout(() => {
          onClose();
          navigate('/verify-otp', { state: { email: verificationEmail } });
        }, 1400);
      } else if (modalMode === 'forgot') {
        await forgotPassword({ email: normalizedEmail });
        setToast({
          type: 'success',
          message: 'If an account exists with that email, a password reset link has been sent to your inbox.',
          duration: 6000,
        });
        setPassword('');
      }
    } catch (err) {
      const message = err?.message?.toLowerCase() || '';
      if (modalMode === 'login' && /verif|verification/.test(message)) {
        setToast({
          type: 'info',
          message: 'Please verify your email address before signing in. Resend the verification email below.',
          persistent: true,
        });
      } else {
        setToast({ type: 'error', message: safeAuthError(err, modalMode) });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resending) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFieldErrors((errors) => ({
        ...errors,
        email: normalizedEmail ? 'Please enter a valid email address.' : 'Email address is required.',
      }));
      return;
    }

    setResending(true);
    try {
      await resendVerificationEmail({ email: normalizedEmail });
      setToast({ type: 'success', message: 'Verification email sent. Please check your inbox.' });
    } catch (err) {
      const message = err?.message?.toLowerCase() || '';
      let safeMessage = 'We couldn’t resend the verification email. Please try again.';
      if (message.includes('no account found')) {
        safeMessage = 'No account was found for this email. Please check the address and try again.';
      } else if (message.includes('already verified')) {
        safeMessage = 'This email is already verified. Please sign in.';
      }
      setToast({ type: 'info', message: safeMessage, persistent: true });
    } finally {
      setResending(false);
    }
  };

  const clearFieldError = (field) => {
    setFieldErrors((errors) => {
      if (!errors[field]) return errors;
      const nextErrors = { ...errors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  return (
    <div className="modal-overlay" onClick={isCompleting ? undefined : onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        {toast && (
          <div className={`auth-toast auth-toast-${toast.type}${toast.simple ? ' auth-toast-simple' : ''}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live="polite">
            <div className="auth-toast-content">
              {!toast.simple && (toast.type === 'success' ? <CheckCircle2 size={20} /> : toast.type === 'error' ? <CircleAlert size={20} /> : <Info size={20} />)}
              <span>{toast.message}</span>
            </div>
            {!toast.simple && toast.persistent && (
              <button
                type="button"
                className="auth-toast-action"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            )}
            {!toast.simple && !toast.persistent && (
              <button type="button" className="auth-toast-dismiss" aria-label="Dismiss notification" onClick={() => setToast(null)}>
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            {modalMode === 'login' ? 'Welcome Back' : modalMode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>
          <button onClick={onClose} disabled={isCompleting} style={{ background: 'none', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {modalMode === 'login' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <button
              type="button"
              onClick={() => fillPreset('user')}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '0.4rem',
                fontSize: '0.8rem',
                background: role === 'user' ? 'rgba(99,102,241,0.2)' : undefined,
                borderColor: role === 'user' ? 'var(--accent-primary)' : undefined,
                color: role === 'user' ? '#fff' : 'var(--text-muted)',
                fontWeight: role === 'user' ? '700' : '500',
              }}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => fillPreset('admin')}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '0.4rem',
                fontSize: '0.8rem',
                background: role === 'admin' ? 'rgba(236,72,153,0.2)' : undefined,
                borderColor: role === 'admin' ? '#ec4899' : 'rgba(236,72,153,0.4)',
                color: role === 'admin' ? '#f472b6' : 'var(--text-muted)',
                fontWeight: role === 'admin' ? '700' : '500',
              }}
            >
              Admin
            </button>
          </div>
        )}

        {modalMode === 'forgot' && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.5 }}>
            Enter your registered email address below and we'll send you a secure link to reset your password.
          </p>
        )}

        <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalMode === 'register' && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Full Name</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'auth-name-error' : undefined}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                placeholder="Nandhana"
                className="input-field"
              />
              {fieldErrors.name && <p id="auth-name-error" className="auth-field-error">{fieldErrors.name}</p>}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Email Address</label>
            <input
              type="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
                setToast((currentToast) => currentToast?.persistent ? null : currentToast);
              }}
              autoComplete="off"
              className="input-field"
            />
            {fieldErrors.email && <p id="auth-email-error" className="auth-field-error">{fieldErrors.email}</p>}
          </div>

          {modalMode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Password</label>
                {modalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('forgot');
                      setFieldErrors({});
                      setToast(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                placeholder="••••••••"
                className="input-field"
              />
              {fieldErrors.password && <p id="auth-password-error" className="auth-field-error">{fieldErrors.password}</p>}
            </div>
          )}

          {modalMode === 'register' && (
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

          <button type="submit" disabled={loading || isCompleting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : isCompleting ? 'Success!' : modalMode === 'login' ? 'Sign In' : modalMode === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Navigation Links */}
        {modalMode === 'forgot' ? (
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem' }}>
            <button
              onClick={() => {
                setModalMode('login');
                setFieldErrors({});
                setToast(null);
              }}
              style={{
                background: 'none',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {modalMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                if (isCompleting) return;
                setModalMode(modalMode === 'login' ? 'register' : 'login');
                setFieldErrors({});
                setToast(null);
              }}
              style={{ background: 'none', color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {modalMode === 'login' ? 'Register here' : 'Login here'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
