import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <img src="/logo.png" alt="Karni Air Courier & Logistics" className="footer-logo" />
          <p className="footer-desc">
            Karni Air Courier & Logistics — your trusted partner for fast, reliable, and affordable parcel delivery across India. Built on trust. Delivered on time.
          </p>
          <div className="social-row">
            <a href="#" className="social-btn" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
            <a href="https://wa.me/918306396840" target="_blank" rel="noreferrer" className="social-btn" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp" /></a>
            <a href="#" className="social-btn" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/book">Book Pickup</Link></li>
            <li><Link to="/track">Track Parcel</Link></li>
            <li><Link to="/dashboard">My Orders</Link></li>
            <li><Link to="/login">Login / Register</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="footer-col-title">Services</h4>
          <ul className="footer-links">
            <li><Link to="/book">Doorstep Pickup</Link></li>
            <li><Link to="/book">Air Express</Link></li>
            <li><Link to="/book">Surface Cargo</Link></li>
            <li><Link to="/book">Document Courier</Link></li>
            <li><Link to="/book">Heavy Parcel</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="footer-col-title">Contact Us</h4>
          <div className="footer-contact-item">
            <i className="fa-solid fa-phone" />
            <a href="tel:+918306396840" style={{ color:'rgba(255,255,255,0.6)' }}>+91 83063 96840</a>
          </div>
          <div className="footer-contact-item">
            <i className="fa-brands fa-whatsapp" />
            <a href="https://wa.me/918306396840" target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,0.6)' }}>WhatsApp Us</a>
          </div>
          <div className="footer-contact-item">
            <i className="fa-solid fa-envelope" />
            <a href="mailto:Pradeepjodha007@gmail.com" style={{ color:'rgba(255,255,255,0.6)' }}>Pradeepjodha007@gmail.com</a>
          </div>
          <div className="footer-contact-item">
            <i className="fa-solid fa-location-dot" />
            <span>B-5, Sadar Flats, Paldi, Ahmedabad, Gujarat</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Karni Air Courier & Logistics. All rights reserved.</p>
        <p>Made with <i className="fa-solid fa-heart" style={{ color:'var(--primary)' }} /> for India</p>
      </div>
    </div>
  </footer>
);

export default Footer;
