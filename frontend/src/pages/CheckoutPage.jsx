import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, AlertCircle, Zap, CheckCircle, Smartphone, Building2, ArrowLeft, Lock } from 'lucide-react';
import { createPaymentOrder, verifyPaymentSignature, releaseSeats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingSummary from '../components/BookingSummary';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const openRazorpayCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const orderRes = await createPaymentOrder({ bookingId: booking._id });
      const { orderId, amount, currency, key } = orderRes.data;

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: key || 'rzp_test_TmX1cUtE83dfqo',
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'CineGo',
        description: `Movie Ticket Booking - ${movie?.title || 'Tickets'}`,
        order_id: orderId,
        handler: async function (response) {
          setPaymentStep('processing');
          try {
            const verifyRes = await verifyPaymentSignature({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setPaymentStep('success');
              setTimeout(() => {
                navigate(`/confirmation/${booking._id}`);
              }, 2000);
            } else {
              setError('Payment verification failed.');
              setPaymentStep('select');
            }
          } catch (verifyErr) {
            console.error('Verification Error:', verifyErr);
            setError(verifyErr.response?.data?.error || verifyErr.message || 'Payment verification failed');
            setPaymentStep('select');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || 'Nandhana',
          email: user?.email || 'nandhana@example.com',
          contact: '9876543210',
        },
        readonly: {
          contact: true,
          email: true,
          name: true,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setError(response.error?.description || 'Payment transaction failed.');
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  // Direct 1-Click Demo Payment (No modal, no details asked at all!)
  const executeInstantDemoPayment = async () => {
    setLoading(true);
    setError('');
    setPaymentStep('processing');

    try {
      const orderRes = await createPaymentOrder({ bookingId: booking._id });
      const orderId = orderRes.data.orderId;

      // Small simulated delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockPaymentId = `pay_demo_${Date.now()}`;
      const mockSignature = `sig_demo_${Date.now()}`;

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
        }, 1500);
      } else {
        setError('Payment verification failed.');
        setPaymentStep('select');
      }
    } catch (err) {
      console.error('Demo Payment Error:', err);
      setError(err.response?.data?.error || err.message || 'Payment failed');
      setPaymentStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    await executeInstantDemoPayment();
  };

  const executeInstantPayment = async () => {
    await executeInstantDemoPayment();
  };

  const handleCancelBooking = async () => {
    try {
      await releaseSeats({ bookingId: booking._id });
    } catch (err) {
      console.error(err);
    }
    navigate('/');
  };

  const banksList = [
    { id: 'SBI', name: 'State Bank of India', code: 'SBIN', icon: '🏛️' },
    { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC', icon: '🏦' },
    { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC', icon: '🏢' },
    { id: 'AXIS', name: 'Axis Bank', code: 'UTIB', icon: '🏧' },
    { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KKBK', icon: '💳' },
    { id: 'FEDERAL', name: 'Federal Bank', code: 'FDRL', icon: '🏛️' },
  ];

  const renderMethodSelection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      
      {/* Bank Selection Panel */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        padding: '1.2rem',
        borderRadius: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="#38bdf8" /> Select Your Bank
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
            NetBanking / Instant
          </span>
        </div>

        {/* Bank Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.6rem',
          marginBottom: '0.9rem',
        }}>
          {banksList.map((b) => {
            const isSelected = selectedBank === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBank(b.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1.5px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.07)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.02)' : 'none',
                  boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{b.icon}</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: isSelected ? '700' : '500', fontSize: '0.82rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? '#38bdf8' : 'var(--text-muted)' }}>
                    {b.code}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Other Banks dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Other Bank:</label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="input-field"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', flex: 1 }}
          >
            <option value="SBI">State Bank of India (SBI)</option>
            <option value="HDFC">HDFC Bank</option>
            <option value="ICICI">ICICI Bank</option>
            <option value="AXIS">Axis Bank</option>
            <option value="KOTAK">Kotak Mahindra Bank</option>
            <option value="FEDERAL">Federal Bank</option>
            <option value="BOB">Bank of Baroda</option>
            <option value="PNB">Punjab National Bank</option>
            <option value="CANARA">Canara Bank</option>
            <option value="UNION">Union Bank of India</option>
            <option value="YES">Yes Bank</option>
            <option value="INDUSIND">IndusInd Bank</option>
          </select>
        </div>
      </div>

      {/* Hero Pay using Razorpay Button */}
      <button
        disabled={loading || timeLeft === 0}
        onClick={executeInstantDemoPayment}
        className="btn-primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '1.15rem',
          fontSize: '1.15rem',
          fontWeight: '700',
          display: 'flex',
          gap: '0.7rem',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0284c7, #2563eb)',
          boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
          borderRadius: '12px',
          cursor: 'pointer',
        }}
      >
        <Lock size={20} color="#fff" /> Pay ₹{booking.totalAmount} using Razorpay
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        marginTop: '-0.3rem',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={16} color="#10b981" /> 256-bit Secure Razorpay Gateway
        </span>
        <span>•</span>
        <span>Selected Bank: <strong style={{ color: '#fff' }}>{selectedBank}</strong></span>
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

  // Razorpay Branded Speeding Coin Animation
  const renderProcessing = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', gap: '2rem' }}>
      
      {/* Razorpay Brand Header + Fast Forward Coin Motion Track */}
      <div className="rzp-motion-stage">
        {/* Glow ambient background */}
        <div className="rzp-stage-glow" />

        {/* Razorpay Brand Header */}
        <div className="rzp-brand-badge">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.64 3L8.5 19.46H16.14L12.36 29L23.5 12.54H15.86L19.64 3Z" fill="#0284c7" />
          </svg>
          <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#fff' }}>
            Razor<span style={{ color: '#0284c7' }}>pay</span>
          </span>
        </div>

        {/* Speed Track with Fast Forward Moving Coins */}
        <div className="rzp-track">
          {/* Speed Motion Lines */}
          <div className="rzp-speed-lines">
            <span className="line line-1" />
            <span className="line line-2" />
            <span className="line line-3" />
          </div>

          {/* Speeding Gold Coin Moving Forward */}
          <div className="rzp-fast-coin">
            <div className="coin-face">₹</div>
            <div className="coin-trail" />
          </div>

          {/* Success Target Portal */}
          <div className="rzp-target-portal">
            <div className="portal-ring" />
          </div>
        </div>
      </div>

      <style>{`
        .rzp-motion-stage {
          position: relative;
          width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 1rem;
          background: rgba(2, 132, 199, 0.06);
          border: 1px solid rgba(2, 132, 199, 0.25);
          border-radius: 20px;
          overflow: hidden;
        }

        .rzp-stage-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 120px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, transparent 70%);
          filter: blur(25px);
          pointer-events: none;
        }

        .rzp-brand-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          background: rgba(15, 23, 42, 0.7);
          padding: 0.4rem 1rem;
          border-radius: 30px;
          border: 1px solid rgba(2, 132, 199, 0.3);
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
        }

        .rzp-track {
          position: relative;
          width: 100%;
          height: 70px;
          display: flex;
          align-items: center;
        }

        .rzp-speed-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          opacity: 0.35;
        }

        .line {
          height: 2px;
          background: linear-gradient(90deg, transparent, #38bdf8, transparent);
          border-radius: 2px;
          animation: speedStream 0.6s linear infinite;
        }
        .line-1 { animation-delay: 0s; width: 80%; }
        .line-2 { animation-delay: 0.2s; width: 95%; }
        .line-3 { animation-delay: 0.4s; width: 70%; }

        @keyframes speedStream {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Forward Speeding Coin */
        .rzp-fast-coin {
          position: absolute;
          left: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: coinRushForward 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .coin-face {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #fef08a, #eab308 65%, #a16207 100%);
          border: 2.5px solid #ca8a04;
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.8), inset 0 0 8px rgba(254, 240, 138, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 900;
          color: #713f12;
          text-shadow: 0 1px 2px rgba(254, 240, 138, 0.9);
          animation: coinRoll 0.4s linear infinite;
          z-index: 2;
        }

        .coin-trail {
          position: absolute;
          right: 32px;
          width: 60px;
          height: 18px;
          background: linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.6));
          border-radius: 20px;
          filter: blur(3px);
          z-index: 1;
        }

        @keyframes coinRushForward {
          0% {
            left: -10px;
            transform: scale(0.6) translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: scale(1) translateY(-4px);
          }
          85% {
            opacity: 1;
            transform: scale(1.15) translateY(-2px);
          }
          100% {
            left: 230px;
            transform: scale(0.8) translateY(0);
            opacity: 0;
          }
        }

        @keyframes coinRoll {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        .rzp-target-portal {
          position: absolute;
          right: 15px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portal-ring {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 3px dashed #0284c7;
          box-shadow: 0 0 20px rgba(2, 132, 199, 0.7);
          animation: portalPulse 1s ease-in-out infinite alternate;
        }

        @keyframes portalPulse {
          0% {
            transform: scale(0.85) rotate(0deg);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.4rem' }}>
          Processing with Razorpay...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Transferring <strong style={{ color: '#38bdf8' }}>₹{booking.totalAmount}</strong> via <strong style={{ color: '#fff' }}>{selectedBank}</strong> to complete your booking
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(2, 132, 199, 0.1)', padding: '0.55rem 1.3rem', borderRadius: '25px',
        fontSize: '0.82rem', color: '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.3)',
      }}>
        <Lock size={14} /> Razorpay Verified Secure Transaction
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
        {paymentStep === 'select' && (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '1rem 1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>Razorpay Payment Gateway</span>
              <span className="badge badge-now">Test Mode</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Razorpay standard checkout with your test keys.
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
