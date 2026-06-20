import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const BookingWidget = () => {
  const [fromPin, setFromPin] = useState('');
  const [toPin, setToPin] = useState('');
  const navigate = useNavigate();

  const handleBook = (e) => {
    e.preventDefault();
    navigate('/book', { state: { fromPin, toPin } });
  };

  return (
    <div className="booking-widget">
      <h3 className="widget-title">
        <span>Book</span> Personal Courier
      </h3>

      <form onSubmit={handleBook}>
        <div className="route-wrapper">
          <div className="route-connector" />
          <div className="route-row">
            <div className="route-icon from" />
            <input
              className="route-input"
              type="text"
              placeholder="From — Pickup Pincode"
              maxLength={6}
              value={fromPin}
              onChange={e => setFromPin(e.target.value.replace(/\D/,'').slice(0,6))}
              required
            />
          </div>
          <div style={{ height: 8 }} />
          <div className="route-row">
            <div className="route-icon to" />
            <input
              className="route-input"
              type="text"
              placeholder="To — Delivery Pincode"
              maxLength={6}
              value={toPin}
              onChange={e => setToPin(e.target.value.replace(/\D/,'').slice(0,6))}
              required
            />
          </div>
        </div>

        <hr className="widget-divider" />

        <button type="submit" className="btn btn-primary btn-block btn-lg">
          <i className="fa-solid fa-truck-fast" /> Book Now
        </button>
      </form>

      <p style={{ textAlign:'center', marginTop:12, fontSize:'0.8125rem', color:'var(--text-light)' }}>
        <i className="fa-solid fa-shield-halved" style={{ marginRight:4 }} />
        Safe, secure & insured delivery across India
      </p>
    </div>
  );
};

export default BookingWidget;
