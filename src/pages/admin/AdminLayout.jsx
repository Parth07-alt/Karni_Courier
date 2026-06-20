import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-brand-area">
          <div style={{ background: 'var(--white)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '8px' }}>
            <img src="/logo.png" alt="Logo" className="sidebar-logo" style={{ display: 'block' }} />
          </div>
          <div className="sidebar-tagline">Admin Control Panel</div>
        </div>
        
        <div className="sidebar-section-label">Management</div>
        <Link 
          to="/admin/dashboard" 
          className={`sidebar-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-gauge" /> Dashboard
        </Link>
        <Link 
          to="/admin/staff" 
          className={`sidebar-link ${location.pathname === '/admin/staff' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-users-gear" /> Staff Management
        </Link>
        <a href="#" className="sidebar-link"><i className="fa-solid fa-chart-line" /> Reports</a>
        
        <div className="sidebar-section-label">Settings</div>
        <Link 
          to="/admin/pricing" 
          className={`sidebar-link ${location.pathname === '/admin/pricing' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-tags" /> Pricing
        </Link>
        <a href="#" className="sidebar-link"><i className="fa-solid fa-gear" /> General</a>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <i className="fa-solid fa-arrow-left" /> Back to Website
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
