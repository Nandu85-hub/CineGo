import React from 'react';
import { Calendar, MapPin, Monitor, ArrowRight } from 'lucide-react';

const ShowtimeCard = ({ showtime, onSelect }) => {
  const { _id, theaterName, screenName, dateTime, basePrice } = showtime;

  const showDate = new Date(dateTime);
  const formattedTime = showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = showDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: '700', fontSize: '1.1rem' }}>
          <MapPin size={18} color="var(--accent-secondary)" />
          {theaterName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Monitor size={14} /> {screenName}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={14} /> {formattedDate}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
            {formattedTime}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Starts at ₹{basePrice}
          </div>
        </div>

        <button onClick={() => onSelect(_id)} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
          Select Seats
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ShowtimeCard;
