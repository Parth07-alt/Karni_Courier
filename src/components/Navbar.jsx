import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, userProfile, isAdmin, displayName, initials, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setUserDropOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserDropOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" alt="Karni Air Courier & Logistics" className="navbar-logo" />
            <div className="navbar-brand-text">
              <span className="navbar-brand-name">KARNI AIR COURIER &amp; LOGISTICS</span>
              <span className="navbar-brand-slogan">Built on trust. Delivered on time.</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="navbar-links">
            <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
            <Link to="/book" className={`nav-link${isActive('/book') ? ' active' : ''}`}>Book Pickup</Link>
            <Link to="/complaint" className={`nav-link${isActive('/complaint') ? ' active' : ''}`}>Complaint</Link>
            <Link to="/track" className={`nav-link${isActive('/track') ? ' active' : ''}`}>Track Parcel</Link>
            {user && (
              <Link to="/dashboard" className={`nav-link${isActive('/dashboard') ? ' active' : ''}`}>My Orders</Link>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" className="nav-link" style={{ color: 'var(--primary)' }}>
                <i className="fa-solid fa-shield-halved" /> Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <div style={{ position: 'relative' }}>
                <div className="user-menu-btn" onClick={() => setUserDropOpen(!userDropOpen)}>
                  <div className="user-avatar">{initials}</div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {displayName.split(' ')[0]}
                  </span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }} />
                </div>
                {userDropOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200,
                    background: 'var(--white)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200,
                    overflow: 'hidden'
                  }}>
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setUserDropOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', fontSize:'0.9rem', transition:'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--off-white)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <i className="fa-solid fa-box" style={{ color:'var(--primary)', width:16 }} /> My Orders
                    </Link>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserDropOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', fontSize:'0.9rem', transition:'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--off-white)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <i className="fa-solid fa-user" style={{ color:'var(--primary)', width:16 }} /> My Profile
                    </Link>
                    <hr style={{ margin:'4px 0', border:'none', borderTop:'1px solid var(--border-light)' }} />
                    <button onClick={handleLogout}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', width:'100%', fontSize:'0.9rem', color:'var(--danger)', cursor:'pointer', background:'transparent', border:'none', transition:'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--danger-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <i className="fa-solid fa-right-from-bracket" style={{ width:16 }} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link to="/book" className="btn btn-primary btn-sm">
                  <i className="fa-solid fa-box" /> Book Now
                </Link>
              </>
            )}
            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998, backdropFilter: 'blur(2px)' }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} style={{ zIndex: 999 }}>
        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/book" className="nav-link" onClick={() => setMenuOpen(false)}>Book Pickup</Link>
        <Link to="/complaint" className="nav-link" onClick={() => setMenuOpen(false)}>Complaint</Link>
        <Link to="/track" className="nav-link" onClick={() => setMenuOpen(false)}>Track Parcel</Link>
        {user && <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>My Orders</Link>}
        {user && <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>My Profile</Link>}
        {isAdmin && <Link to="/admin/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
        {user
          ? <button className="btn btn-secondary btn-sm" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</button>
          : <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign In / Register</Link>
        }
      </div>
    </>
  );
};

export default Navbar;
