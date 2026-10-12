import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, AlertCircle, Zap, CheckCircle, Smartphone, Building2, ArrowLeft, Lock } from 'lucide-react';
import { createPaymentOrder, verifyPaymentSignature, releaseSeats } from '../services/api';
import BookingSummary from '../components/BookingSummary';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const movie = location.state?.movie;
  const showtime = location.state?.showtime;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  // Demo Payment UI State
  const [paymentStep, setPaymentStep] = useState('select'); 
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processingStage, setProcessingStage] = useState(1);
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4111 1111 1111 1111',
    cardName: 'DEMO USER',
    expiry: '12/28',
    cvv: '123',
  });
  const [upiId, setUpiId] = useState('demo@upi');
  const [selectedBank, setSelectedBank] = useState('SBI');

  useEffect(() => {
    if (!booking) {
      navigate('/');
      return;
    }

    const expiryTime = new Date(booking.reservedUntil).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        setError('Seat reservation expired. Please re-select your seats.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking, navigate]);

  if (!booking) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setPaymentStep('processing');
    setProcessingStage(1);

    try {
      const orderRes = await createPaymentOrder({ bookingId: booking._id });
      const orderId = orderRes.data.orderId;

      // Realistic Razorpay stage transitions:
      // Stage 1: Initiating Secure Connection
      await new Promise((resolve) => setTimeout(resolve, 900));
      setProcessingStage(2);

      // Stage 2: Authorizing with Bank / Payment Network
      await new Promise((resolve) => setTimeout(resolve, 1100));
      setProcessingStage(3);

      // Stage 3: Verifying Signature and Completing
      await new Promise((resolve) => setTimeout(resolve, 900));

      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 9).toUpperCase()}${Date.now().toString().slice(-4)}`;
      const mockSignature = `sig_rzp_${Date.now()}`;
      setPaymentTxnId(mockPaymentId);

      const verifyRes = await verifyPaymentSignature({
        bookingId: booking._id,
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      });

      if (verifyRes.success) {
        setPaymentStep('success');
        setTimeout(() => {
          navigate(`/confirmation/${booking._id}`);
        }, 2600);
      } else {
        setError('Payment verification failed.');
        setPaymentStep('select');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.response?.data?.error || err.message || 'Payment failed');
      setPaymentStep('select');
    } finally {
      setLoading(false);
    }
  };

  const executeInstantPayment = async () => {
    await handlePayment();
  };

  const handleCancelBooking = async () => {
    try {
      await releaseSeats({ bookingId: booking._id });
    } catch (err) {
      console.error(err);
    }
    navigate('/');
  };

  const renderMethodSelection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        Choose Payment Method
      </h3>

      <button
        onClick={() => { setSelectedMethod('card'); setPaymentStep('card'); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem',
          background: selectedMethod === 'card' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          border: selectedMethod === 'card' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-glass)',
          borderRadius: '12px', textAlign: 'left', width: '100%', color: '#fff',
        }}
      >
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '0.6rem', borderRadius: '10px' }}>
          <CreditCard size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>Credit / Debit Card</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visa, Mastercard, Rupay</div>
        </div>
      </button>

      <button
        onClick={() => { setSelectedMethod('upi'); setPaymentStep('upi'); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem',
          background: selectedMethod === 'upi' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          border: selectedMethod === 'upi' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-glass)',
          borderRadius: '12px', textAlign: 'left', width: '100%', color: '#fff',
        }}
      >
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.6rem', borderRadius: '10px' }}>
          <Smartphone size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>UPI Payment</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Google Pay, PhonePe, Paytm</div>
        </div>
      </button>

      <button
        onClick={() => { setSelectedMethod('netbanking'); setPaymentStep('netbanking'); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem',
          background: selectedMethod === 'netbanking' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          border: selectedMethod === 'netbanking' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-glass)',
          borderRadius: '12px', textAlign: 'left', width: '100%', color: '#fff',
        }}
      >
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '0.6rem', borderRadius: '10px' }}>
          <Building2 size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>Net Banking</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SBI, HDFC, ICICI, Axis & more</div>
        </div>
      </button>

      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          disabled={loading || timeLeft === 0}
          onClick={executeInstantPayment}
          className="btn-secondary"
          style={{
            width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.85rem',
            borderColor: 'rgba(99,102,241,0.4)', color: '#818cf8',
            display: 'flex', gap: '0.4rem', alignItems: 'center',
          }}
        >
          <Zap size={16} color="#fbbf24" /> Instant Demo Payment (Skip Details)
        </button>
      </div>
    </div>
  );

  const renderCardForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        onClick={() => setPaymentStep('select')}
        style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}
      >
        <ArrowLeft size={16} /> Back to payment methods
      </button>

      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CreditCard size={20} color="#6366f1" /> Card Details
      </h3>

      <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <ShieldCheck size={14} /> Demo Mode — Pre-filled with test card details
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Card Number</label>
        <input
          value={cardDetails.cardNumber}
          onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
          className="input-field"
          placeholder="4111 1111 1111 1111"
          style={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '1.05rem' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Cardholder Name</label>
        <input
          value={cardDetails.cardName}
          onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
          className="input-field"
          placeholder="JOHN DOE"
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Expiry (MM/YY)</label>
          <input
            value={cardDetails.expiry}
            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
            className="input-field"
            placeholder="12/28"
          />
        </div>
        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>CVV</label>
          <input
            type="password"
            value={cardDetails.cvv}
            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
            className="input-field"
            placeholder="•••"
            maxLength={4}
          />
        </div>
      </div>

      <button
        disabled={loading || timeLeft === 0}
        onClick={handlePayment}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
      >
        <Lock size={18} /> Pay ₹{booking.totalAmount}
      </button>
    </div>
  );

  const renderUpiForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        onClick={() => setPaymentStep('select')}
        style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}
      >
        <ArrowLeft size={16} /> Back to payment methods
      </button>

      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Smartphone size={20} color="#10b981" /> UPI Payment
      </h3>

      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <ShieldCheck size={14} /> Demo Mode — Enter any UPI ID
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>UPI ID</label>
        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="input-field"
          placeholder="yourname@upi"
          style={{ fontSize: '1.05rem' }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.3rem' }}>
        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
          <span
            key={app}
            style={{
              fontSize: '0.78rem', padding: '0.35rem 0.8rem', borderRadius: '20px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)',
            }}
          >
            {app}
          </span>
        ))}
      </div>

      <button
        disabled={loading || timeLeft === 0}
        onClick={handlePayment}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
      >
        <Lock size={18} /> Pay ₹{booking.totalAmount} via UPI
      </button>
    </div>
  );

  const renderNetBankingForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        onClick={() => setPaymentStep('select')}
        style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}
      >
        <ArrowLeft size={16} /> Back to payment methods
      </button>

      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Building2 size={20} color="#f59e0b" /> Net Banking
      </h3>

      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <ShieldCheck size={14} /> Demo Mode — Select any bank
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Select Bank</label>
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="input-field"
          style={{ fontSize: '1rem' }}
        >
          <option value="SBI">State Bank of India (SBI)</option>
          <option value="HDFC">HDFC Bank</option>
          <option value="ICICI">ICICI Bank</option>
          <option value="Axis">Axis Bank</option>
          <option value="Kotak">Kotak Mahindra Bank</option>
          <option value="BOB">Bank of Baroda</option>
          <option value="PNB">Punjab National Bank</option>
          <option value="Federal">Federal Bank</option>
        </select>
      </div>

      <button
        disabled={loading || timeLeft === 0}
        onClick={handlePayment}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
      >
        <Lock size={18} /> Pay ₹{booking.totalAmount} via {selectedBank}
      </button>
    </div>
  );

  // Authentic Razorpay Processing Animation
  const renderProcessing = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.2rem',
      gap: '1.6rem',
      background: 'linear-gradient(180deg, rgba(12, 35, 64, 0.45) 0%, rgba(10, 15, 30, 0.6) 100%)',
      border: '1px solid rgba(51, 149, 255, 0.25)',
      borderRadius: '18px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle Razorpay Brand Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '260px',
        height: '140px',
        background: 'radial-gradient(circle, rgba(51, 149, 255, 0.2) 0%, transparent 70%)',
        filter: 'blur(35px)',
        pointerEvents: 'none',
      }} />

      {/* Official Razorpay Header Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: 'rgba(15, 23, 42, 0.85)',
        padding: '0.45rem 1.1rem',
        borderRadius: '30px',
        border: '1px solid rgba(51, 149, 255, 0.3)',
        boxShadow: '0 4px 16px rgba(51, 149, 255, 0.15)',
      }}>
        {/* Official Razorpay Logo Mark */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M22.3 8.35L14.7 0.75C14.22 0.27 13.57 0 12.89 0H3.34C2.12 0 1.25 1.18 1.63 2.34L6.15 16.03C6.39 16.76 6.96 17.33 7.69 17.57L9.93 18.31L7.54 22.38C7.14 23.06 7.63 23.91 8.42 23.91H11.59C12.18 23.91 12.72 23.57 12.98 23.05L16.2 16.63H20.66C21.88 16.63 22.75 15.45 22.37 14.29L22.3 8.35Z" fill="#3395FF"/>
        </svg>
        <span style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#fff' }}>
          Razor<span style={{ color: '#3395ff' }}>pay</span>
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>|</span>
        <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: '600' }}>
          Payment Gateway
        </span>
      </div>

      {/* Razorpay Dual-Orbit Processing Spinner */}
      <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0.5rem 0' }}>
        {/* Outer Glowing Fast Orbit */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          border: '3.5px solid rgba(51, 149, 255, 0.15)',
          borderTopColor: '#3395ff',
          borderRightColor: '#38bdf8',
          animation: 'rzpSpinClockwise 0.85s cubic-bezier(0.4, 0.1, 0.2, 1) infinite',
          boxShadow: '0 0 18px rgba(51, 149, 255, 0.45)',
        }} />

        {/* Inner Counter Orbit */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '66px',
          height: '66px',
          borderRadius: '50%',
          border: '2.5px dashed rgba(51, 149, 255, 0.35)',
          borderBottomColor: '#60a5fa',
          animation: 'rzpSpinCounter 1.3s linear infinite',
        }} />

        {/* Center Pulsing Razorpay Emblem */}
        <div style={{
          position: 'absolute',
          top: '25px',
          left: '25px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0c2340, #1e3a8a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'rzpPulse 1.2s ease-in-out infinite',
          boxShadow: '0 0 12px rgba(51, 149, 255, 0.5)',
        }}>
          <Lock size={18} color="#3395ff" />
        </div>
      </div>

      {/* Dynamic Processing Status */}
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.4rem' }}>
          {processingStage === 1 && 'Connecting to Razorpay...'}
          {processingStage === 2 && 'Authorizing Payment...'}
          {processingStage === 3 && 'Finalizing Confirmation...'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.4' }}>
          Processing <strong style={{ color: '#38bdf8' }}>₹{booking.totalAmount}</strong> via{' '}
          <strong style={{ color: '#fff' }}>
            {selectedMethod === 'card' ? 'Credit/Debit Card' : selectedMethod === 'upi' ? `UPI (${upiId})` : `${selectedBank} NetBanking`}
          </strong>
        </p>
      </div>

      {/* Step Progression Indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        fontSize: '0.78rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: processingStage >= 1 ? '#38bdf8' : 'var(--text-muted)',
          fontWeight: processingStage === 1 ? '700' : '500',
        }}>
          <span>1. Gateway</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: processingStage >= 2 ? '#38bdf8' : 'var(--text-muted)',
          fontWeight: processingStage === 2 ? '700' : '500',
        }}>
          <span>2. Bank Authorization</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: processingStage >= 3 ? '#34d399' : 'var(--text-muted)',
          fontWeight: processingStage === 3 ? '700' : '500',
        }}>
          <span>3. Confirm</span>
        </div>
      </div>

      {/* Safety Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(51, 149, 255, 0.08)',
        border: '1px solid rgba(51, 149, 255, 0.25)',
        padding: '0.55rem 1.1rem',
        borderRadius: '10px',
        fontSize: '0.8rem',
        color: '#93c5fd',
      }}>
        <ShieldCheck size={16} color="#38bdf8" />
        <span>100% Secure • Do not press back or refresh this window</span>
      </div>

      <style>{`
        @keyframes rzpSpinClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rzpSpinCounter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes rzpPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
      `}</style>
    </div>
  );

  // Authentic Razorpay Success Screen
  const renderSuccess = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.2rem',
      gap: '1.4rem',
      background: 'linear-gradient(180deg, rgba(6, 78, 59, 0.25) 0%, rgba(10, 15, 30, 0.6) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '18px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Razorpay Brand Top Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(15, 23, 42, 0.85)',
        padding: '0.4rem 1rem',
        borderRadius: '30px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.3 8.35L14.7 0.75C14.22 0.27 13.57 0 12.89 0H3.34C2.12 0 1.25 1.18 1.63 2.34L6.15 16.03C6.39 16.76 6.96 17.33 7.69 17.57L9.93 18.31L7.54 22.38C7.14 23.06 7.63 23.91 8.42 23.91H11.59C12.18 23.91 12.72 23.57 12.98 23.05L16.2 16.63H20.66C21.88 16.63 22.75 15.45 22.37 14.29L22.3 8.35Z" fill="#10B981"/>
        </svg>
        <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>
          Razor<span style={{ color: '#10b981' }}>pay</span> Verified
        </span>
      </div>

      {/* Expanding Ripple Green Checkmark */}
      <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute',
          width: '92px',
          height: '92px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.18)',
          animation: 'rzpRipple 1.4s ease-out infinite',
        }} />
        <div style={{
          width: '78px',
          height: '78px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.45)',
          animation: 'rzpPopIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 2,
        }}>
          {/* Animated SVG Checkmark */}
          <svg width="44" height="44" viewBox="0 0 52 52">
            <path
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="50"
              strokeDashoffset="0"
              style={{ animation: 'rzpCheckStroke 0.55s ease-in-out forwards' }}
              d="M14 27l9 9 16-16"
            />
          </svg>
        </div>
      </div>

      {/* Success Heading */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#34d399', marginBottom: '0.3rem' }}>
          Payment Successful!
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Paid <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{booking.totalAmount}</strong> to CineGo Entertainment
        </p>
      </div>

      {/* Official Transaction Receipt Slip */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '12px',
        padding: '0.9rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Razorpay Txn ID</span>
          <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#a7f3d0' }}>
            {paymentTxnId || `pay_${booking._id.slice(-8)}`}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Booking Code</span>
          <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#fff' }}>
            {booking.bookingCode}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Status</span>
          <span style={{ color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            ● Verified & Captured
          </span>
        </div>
      </div>

      {/* Redirecting bar */}
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '380px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Redirecting to your confirmed e-ticket...
        </p>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #38bdf8)',
            animation: 'rzpProgress 2.5s ease-in-out forwards',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes rzpPopIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rzpRipple {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes rzpCheckStroke {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes rzpProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="split-layout-page" style={{ width: '100%' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CreditCard color="var(--accent-primary)" /> Complete Payment
        </h2>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle', display: 'inline-block' }} />
            {error}
          </div>
        )}

        {/* Gateway Badge */}
        {(paymentStep === 'select' || paymentStep === 'card' || paymentStep === 'upi' || paymentStep === 'netbanking') && (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '1rem 1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>Razorpay Payment Gateway</span>
              <span className="badge badge-now">Demo Mode</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Secure demo payment — no real charges will be made.
            </p>
          </div>
        )}

        {paymentStep === 'select' && renderMethodSelection()}
        {paymentStep === 'card' && renderCardForm()}
        {paymentStep === 'upi' && renderUpiForm()}
        {paymentStep === 'netbanking' && renderNetBankingForm()}
        {paymentStep === 'processing' && renderProcessing()}
        {paymentStep === 'success' && renderSuccess()}

        {paymentStep !== 'processing' && paymentStep !== 'success' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={handleCancelBooking}
              style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              Cancel Reservation & Return to Movies
            </button>
          </div>
        )}
      </div>

      <BookingSummary
        movie={movie}
        showtime={showtime}
        selectedSeats={booking.seats}
        totalAmount={booking.totalAmount}
        onProceed={handlePayment}
        loading={loading}
        timerSeconds={timeLeft}
      />
    </div>
  );
};

export default CheckoutPage;
