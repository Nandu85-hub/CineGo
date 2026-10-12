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

    try {
      const orderRes = await createPaymentOrder({ bookingId: booking._id });
      const orderId = orderRes.data.orderId;

      await new Promise((resolve) => setTimeout(resolve, 2500));

      const mockPaymentId = `pay_test_${Date.now()}`;
      const mockSignature = `sig_test_${Date.now()}`;

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
        }, 2500);
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
    setLoading(true);
    setError('');
    setPaymentStep('processing');

    try {
      const orderRes = await createPaymentOrder({ bookingId: booking._id });
      const orderId = orderRes.data.orderId;

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockPaymentId = `pay_test_${Date.now()}`;
      const mockSignature = `sig_test_${Date.now()}`;

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
        }, 2000);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.response?.data?.error || err.message || 'Payment failed');
      setPaymentStep('select');
    } finally {
      setLoading(false);
    }
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

  // Processing Animation
  const renderProcessing = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1.5rem' }}>
      {/* Spinning Animation */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        border: '4px solid rgba(99, 102, 241, 0.2)',
        borderTopColor: '#6366f1',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>Processing Payment...</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
        Securely processing your payment of <strong style={{ color: '#10b981' }}>₹{booking.totalAmount}</strong> via{' '}
        {selectedMethod === 'card' ? 'Card' : selectedMethod === 'upi' ? 'UPI' : 'Net Banking'}
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px',
        fontSize: '0.82rem', color: '#818cf8',
      }}>
        <Lock size={14} /> Encrypted & Secure Transaction
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1.2rem' }}>
      <div style={{
        width: '90px', height: '90px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
        animation: 'popIn 0.4s ease-out',
      }}>
        <CheckCircle size={45} color="#fff" />
      </div>
      <style>{`@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }`}</style>

      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#34d399' }}>Payment Successful!</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center' }}>
        Your payment of <strong style={{ color: '#10b981' }}>₹{booking.totalAmount}</strong> has been processed successfully.
      </p>

      <div style={{
        background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
        padding: '0.8rem 1.5rem', borderRadius: '10px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Booking Code</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'monospace', color: '#fff' }}>
          {booking.bookingCode}
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Redirecting to your e-ticket...
      </p>
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
