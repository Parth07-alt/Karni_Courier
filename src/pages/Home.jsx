import { useState } from 'react';
import BookingWidget from '../components/BookingWidget';

const Home = () => {
  const [trackingId, setTrackingId] = useState('');
  const [cargoCompany, setCargoCompany] = useState('karni');

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    const awb = trackingId.trim();
    if (cargoCompany === 'karni') {
      window.location.href = `/track?id=${awb}`;
      return;
    }

    let redirectUrl = '';
    if (cargoCompany === 'mark') {
      redirectUrl = `http://crm.markerp.in/Frm_DocTrackWeb.aspx?docno=${awb}`;
    } else if (cargoCompany === 'dtdc') {
      redirectUrl = 'https://www.dtdc.com/track-your-shipment/';
    } else if (cargoCompany === 'maruti') {
      redirectUrl = 'http://marutiair.com/tracking.html';
    } else if (cargoCompany === 'dhl') {
      redirectUrl = `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${awb}`;
    } else if (cargoCompany === 'bluedart') {
      redirectUrl = 'https://www.bluedart.com/tracking';
    }

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-glow-1" />
        <div className="hero-bg-glow-2" />
        
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fa-solid fa-bolt" /> Aggregating India's Best Networks
            </div>
            <h1 className="hero-title">
              Local Courier,<br />
              <span className="highlight">Global Logistics</span>
            </h1>
            <p className="hero-subtitle">
              Ship from your doorstep anywhere in India. Karni Air Courier connects your parcels to premier nationwide networks like Delhivery, DTDC, and more.
            </p>
            
            {/* Tracking Quick Action */}
            <div className="hero-track-wrap">
              <form onSubmit={handleTrack} className="hero-track-form">
                <select 
                  className="form-input hero-track-select"
                  value={cargoCompany}
                  onChange={(e) => setCargoCompany(e.target.value)}
                >
                  <option value="karni" style={{ color: '#000' }}>Karni ID</option>
                  <option value="mark" style={{ color: '#000' }}>Mark</option>
                  <option value="dtdc" style={{ color: '#000' }}>DTDC</option>
                  <option value="maruti" style={{ color: '#000' }}>Maruti</option>
                  <option value="dhl" style={{ color: '#000' }}>DHL</option>
                  <option value="bluedart" style={{ color: '#000' }}>BlueDart</option>
                </select>

                <div className="input-icon-wrap" style={{ flex: 1, margin: 0, width: '100%' }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--white)' }} />
                  <input 
                    type="text" 
                    placeholder={cargoCompany === 'karni' ? "Enter Tracking ID..." : "Enter AWB..."} 
                    className="form-input"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.3)', color: 'var(--white)', paddingLeft: '40px', width: '100%', textOverflow: 'ellipsis' }}
                    value={trackingId}
                    onChange={e => setTrackingId(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary hero-track-btn">
                  <i className="fa-solid fa-magnifying-glass" /> Track
                </button>
              </form>

            </div>
          </div>

          <div className="hero-widget">
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="container stats-bar-grid">
          <div>
            <div className="stat-bar-number">50K+</div>
            <div className="stat-bar-label">Parcels Delivered</div>
          </div>
          <div>
            <div className="stat-bar-number">19K+</div>
            <div className="stat-bar-label">Pin Codes Covered</div>
          </div>
          <div>
            <div className="stat-bar-number">99.8%</div>
            <div className="stat-bar-label">Safe Handover Rate</div>
          </div>
          <div>
            <div className="stat-bar-number">24/7</div>
            <div className="stat-bar-label">Tracking Support</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding services-bg">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">What We Do</span>
            <h2 className="section-title">Premium Shipping Services</h2>
            <p className="section-subtitle">We package, process, and securely hand over your consignments to India's most trusted logistics networks.</p>
          </div>

          <div className="services-grid">
            <div className="card service-card">
              <div className="service-icon-box">
                <i className="fa-solid fa-house-chimney" />
              </div>
              <h3>Doorstep Pickup</h3>
              <p>Schedule a pickup from your home or office. Our local representatives collect, weigh, and package your items with care.</p>
            </div>
            
            <div className="card service-card">
              <div className="service-icon-box">
                <i className="fa-solid fa-plane-departure" />
              </div>
              <h3>Air Express Courier</h3>
              <p>Urgent documents and parcels routed through premier air courier partners. Fast delivery across major metro hubs in India.</p>
            </div>

            <div className="card service-card">
              <div className="service-icon-box">
                <i className="fa-solid fa-truck-fast" />
              </div>
              <h3>Surface Cargo</h3>
              <p>Heavy weight consignments and bulk shipments routed via surface networks. Safe, cost-effective, and fully trackable transport.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">How Karni Courier Works</h2>
          </div>

          <div className="hiw-grid">
            <div className="hiw-step">
              <div className="hiw-number">1</div>
              <h4>Book Online</h4>
              <p>Enter pickup and delivery pincodes, select package weight, and choose a time.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-number">2</div>
              <h4>We Collect</h4>
              <p>Our executive arrives at your doorstep to pick up and securely pack your parcel.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-number">3</div>
              <h4>We Route</h4>
              <p>We aggregate and dispatch via top networks (Delhivery, DTDC, etc.) for fastest transit.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-number">4</div>
              <h4>Delivered</h4>
              <p>Track your shipment live until it safely reaches the destination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="section-padding" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Network Partners</span>
            <h2 className="section-title">Our Trusted Logistics Partners</h2>
            <p className="section-subtitle">We collaborate with India's leading courier networks to ensure the widest reach and fastest delivery.</p>
          </div>

          <div className="partners-grid">
            <div className="card partner-card">
              <i className="fa-solid fa-truck-fast partner-logo-icon" />
              <h4>Delhivery</h4>
              <p>India's largest B2B & B2C supply chain network.</p>
            </div>
            <div className="card partner-card">
              <i className="fa-solid fa-paper-plane partner-logo-icon" />
              <h4>DTDC</h4>
              <p>Vast retail and distribution network across India.</p>
            </div>
            <div className="card partner-card">
              <i className="fa-solid fa-box-open partner-logo-icon" />
              <h4>Shree Mahabali</h4>
              <p>Trusted cargo network with high regional penetration.</p>
            </div>
            <div className="card partner-card">
              <i className="fa-solid fa-gauge-high partner-logo-icon" />
              <h4>Mark Express</h4>
              <p>Specialized express cargo delivering speed and security.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
