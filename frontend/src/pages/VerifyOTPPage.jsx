import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../services/api';

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer email from navigation state, fall back to localStorage
  const emailFromState = location.state?.email || localStorage.getItem('pendingVerifyEmail') || '';
  const [email] = useState(emailFromState);

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // ─── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── OTP digit input handlers ────────────────────────────────────────────────
  const handleDigitChange = (index, value) => {
    // Accept only single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setDigits(newDigits);
      // Focus the last filled box
      const lastFilled = Math.min(pasted.length, 5);
      inputRefs.current[lastFilled]?.focus();
      e.preventDefault();
    }
  };

  // ─── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otp = digits.join('');
    if (otp.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }
    if (!email) {
      setError('Email address is missing. Please register again.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({ email, otp });
      setSuccess(res.message || 'Email verified successfully! Redirecting to login...');
      localStorage.removeItem('pendingVerifyEmail');
      // Redirect to home (login modal) after a short delay
      setTimeout(() => navigate('/', { state: { openLogin: true } }), 2500);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email address is missing. Please register again.');
      return;
    }

    setResendLoading(true);
    try {
      const res = await resendOTP({ email });
      setSuccess(res.message || 'New OTP sent! Check your inbox.');
      // Reset countdown
      setSecondsLeft(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'var(--bg-main)',
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-card)',
    backdropFilter: 'blur(12px)',
  };

  const otpInputStyle = (filled) => ({
    width: '48px',
    height: '56px',
    textAlign: 'center',
    fontSize: '1.4rem',
    fontWeight: '700',
    borderRadius: '10px',
    border: `2px solid ${filled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.12)'}`,
    background: 'rgba(99,102,241,0.07)',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    caretColor: 'var(--accent-primary)',
  });

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎬</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Verify Your Email
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            We sent a 6-digit OTP to
          </p>
          <p style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.95rem', wordBreak: 'break-all' }}>
            {email || 'your email address'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.7rem 0.9rem',
            fontSize: '0.85rem',
            marginBottom: '1.2rem',
            lineHeight: '1.4',
          }}>
            {error}
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '0.7rem 0.9rem',
            fontSize: '0.85rem',
            marginBottom: '1.2rem',
            lineHeight: '1.4',
          }}>
            ✅ {success}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerify}>
          {/* 6-digit input boxes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                style={otpInputStyle(!!digit)}
                autoFocus={i === 0}
                disabled={!!success}
              />
            ))}
          </div>

          {/* Countdown */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {secondsLeft > 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                OTP expires in{' '}
                <span style={{
                  color: secondsLeft <= 60 ? '#f87171' : 'var(--accent-primary)',
                  fontWeight: '700',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {formatTime(secondsLeft)}
                </span>
              </p>
            ) : (
              <p style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '600' }}>
                ⏰ OTP has expired. Please resend.
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || !!success}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '0.8rem', padding: '0.75rem' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resendLoading || !!success}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.75rem',
              opacity: (!canResend || !!success) ? 0.5 : 1,
              cursor: (!canResend || !!success) ? 'not-allowed' : 'pointer',
            }}
          >
            {resendLoading ? 'Sending...' : canResend ? 'Resend OTP' : `Resend available in ${formatTime(secondsLeft)}`}
          </button>
        </form>

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.83rem', color: 'var(--text-dim)' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.83rem' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
