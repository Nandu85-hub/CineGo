import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState({ success: false, message: '' });

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing or invalid verification link. Please check your email.');
        return;
      }

      try {
        const res = await verifyEmail({ token, email: emailParam || undefined });
        if (isMounted) {
          setStatus('success');
          setMessage(res.message || 'Your email address has been successfully verified!');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'The verification link is invalid or has expired.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, emailParam]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendStatus({ success: false, message: 'Please enter your email address.' });
      return;
    }

    setResending(true);
    setResendStatus({ success: false, message: '' });

    try {
      const res = await resendVerificationEmail({ email: resendEmail.trim().toLowerCase() });
      setResendStatus({
        success: true,
        message: res.message || 'A new verification email has been sent. Please check your inbox.',
      });
    } catch (err) {
      setResendStatus({
        success: false,
        message: err.message || 'Failed to resend verification email. Please try again.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid var(--border-glass)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {status === 'verifying' && (
          <div>
            <Loader2
              size={56}
              style={{
                color: 'var(--accent-primary)',
                margin: '0 auto 1.5rem',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Please wait a moment while we verify your CineGo account credentials.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={42} style={{ color: 'var(--accent-green)' }} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Email Verified! 🎉
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              {message}
            </p>

            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Proceed to Sign In <ArrowRight size={18} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <XCircle size={42} style={{ color: 'var(--accent-red)' }} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {message}
            </p>

            {/* Resend Verification Email Section */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                marginTop: '1.5rem',
                textAlign: 'left',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Need a new verification link?
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Enter your registered email address and we'll send you a fresh link.
              </p>

              {resendStatus.message && (
                <div
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.825rem',
                    marginBottom: '0.75rem',
                    background: resendStatus.success
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    color: resendStatus.success ? '#34d399' : '#f87171',
                    border: `1px solid ${
                      resendStatus.success
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                  }}
                >
                  {resendStatus.message}
                </div>
              )}

              <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  {resending ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} /> Resend Verification Email
                    </>
                  )}
                </button>
              </form>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Link
                to="/"
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  textDecoration: 'underline',
                }}
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailPage;
