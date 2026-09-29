import React from 'react';
import { Film, ShieldCheck, Headphones, Ticket, Instagram, Twitter, Youtube, Facebook, Smartphone, Monitor } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        marginTop: '3rem',
        background: 'linear-gradient(180deg, rgba(12,16,32,0.98) 0%, rgba(8,10,20,1) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

        <div
          style={{
            padding: '1.5rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                border: '1px solid rgba(99,102,241,0.3)',
                padding: '0.65rem',
                borderRadius: '12px',
                color: '#818cf8',
              }}
            >
              <Headphones size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: '800', fontSize: '0.98rem', marginBottom: '0.15rem', color: '#fff' }}>
                Got Questions? 24/7 Support Ready
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Seat selection, ticket cancellations &amp; instant refund status — we've got you covered.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#818cf8', fontWeight: '700' }}>
              <ShieldCheck size={15} /> 100% Safe Payments
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#34d399', fontWeight: '700' }}>
              <Ticket size={15} /> Instant E-Tickets
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#fbbf24', fontWeight: '700' }}>
              <Monitor size={15} /> All Formats
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr',
            gap: '2.5rem',
            padding: '3rem 0 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  width: '34px', height: '34px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                }}
              >
                <Film color="#fff" size={18} />
              </div>
              <span style={{ fontWeight: '800', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }} className="gradient-text">
                CineGo
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: '1.7', marginBottom: '1.4rem', maxWidth: '220px' }}>
              Kerala's premium movie ticket booking platform. Book fast, enjoy more.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {[
                { icon: <Instagram size={16} />, color: '#f472b6', label: 'Instagram' },
                { icon: <Twitter size={16} />, color: '#38bdf8', label: 'Twitter' },
                { icon: <Youtube size={16} />, color: '#f87171', label: 'YouTube' },
                { icon: <Facebook size={16} />, color: '#818cf8', label: 'Facebook' },
              ].map(({ icon, color, label }) => (
                <button
                  key={label}
                  title={label}
                  style={{
                    width: '34px', height: '34px', borderRadius: '9px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h5 style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Now Showing
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Bethlehem Kudumba Unit', 'Aasha', 'Prathyadrishtya Kuttukaran', 'Ghalifa', 'DC', 'Unmaadham', 'Manjummel Boys'].map(m => (
                <li key={m}>
                  <a
                    href="/"
                    style={{ color: 'var(--text-muted)', fontSize: '0.84rem', transition: 'color 0.15s', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {m}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Coming Soon
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['L2: Empuraan', 'Barroz', 'Bazooka', 'Kanguva', 'Pushpa 2: The Rule', 'Vettaiyan', 'Kantara: Chapter 1'].map(m => (
                <li key={m}>
                  <a
                    href="/"
                    style={{ color: 'var(--text-muted)', fontSize: '0.84rem', transition: 'color 0.15s', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {m}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Top Cinemas
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Ariesplex SL Cinemas 4K', 'PVR Lulu Mall Kochi', 'Shenoys Cinemas', 'Kozhikode Multiplex', 'Thrissur Cinema Hub', 'Kollam Screens'].map(m => (
                <li key={m}>
                  <a
                    href="/"
                    style={{ color: 'var(--text-muted)', fontSize: '0.84rem', transition: 'color 0.15s', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {m}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Help &amp; Legal
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.4rem' }}>
              {['About CineGo', 'Contact Support', 'Terms of Service', 'Privacy Policy', 'Cancellation Policy', 'Razorpay Gateway'].map(m => (
                <li key={m}>
                  <a
                    href="/"
                    style={{ color: 'var(--text-muted)', fontSize: '0.84rem', transition: 'color 0.15s', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {m}
                  </a>
                </li>
              ))}
            </ul>

            <h5 style={{ fontWeight: '800', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Download App
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { icon: <Smartphone size={14} />, line1: 'Get it on', line2: 'Google Play' },
                { icon: <Monitor size={14} />, line1: 'Download on the', line2: 'App Store' },
              ].map(({ icon, line1, line2 }) => (
                <button
                  key={line2}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '9px', padding: '0.5rem 0.9rem',
                    color: '#fff', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
                >
                  {icon}
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1 }}>{line1}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: 1.3 }}>{line2}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '1.2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} CineGo Media Ltd. All Rights Reserved. Built for Kerala Cinema Lovers. 🎬
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy', 'Terms', 'Cookies'].map(link => (
              <a
                key={link}
                href="/"
                style={{ color: 'var(--text-dim)', fontSize: '0.8rem', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
