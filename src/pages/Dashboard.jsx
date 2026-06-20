import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { formatDate, getBadgeClass, STATUS_LABELS } from '../utils/awbGenerator';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid)
          // orderBy requires a composite index if used with where, so we sort in JS
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort descending by creation date
        fetched.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setOrders(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const stats = {
    total: orders.length,
    active: orders.filter(o => ['pending','confirmed','picked_up','in_transit','out_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--off-white)', minHeight: 'calc(100vh - var(--navbar-height))' }}>
      
      <div className="dash-header">
        <div className="container">
          <h1>My Dashboard</h1>
          <p>Manage and track your courier bookings</p>
          
          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-label">Total Shipments</div>
              <div className="dash-stat-num">{stats.total}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-label">Active Shipments</div>
              <div className="dash-stat-num" style={{ color: '#60A5FA' }}>{stats.active}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-label">Delivered</div>
              <div className="dash-stat-num" style={{ color: '#4ADE80' }}>{stats.delivered}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-xl pb-xl">
        <div className="flex-between mb-lg">
          <h2 style={{ fontSize: '1.5rem' }}>Recent Orders</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
            <i className="fa-solid fa-plus" /> New Booking
          </button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner spinner-red" /></div>
        ) : orders.length === 0 ? (
          <div className="card empty-state">
            <i className="fa-solid fa-box-open" />
            <h3>No shipments yet</h3>
            <p className="text-gray mb-md">You haven't booked any courier services yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/book')}>Book Now</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {orders.map(order => {
              const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
              return (
                <div key={order.id} className="order-card" onClick={() => navigate(`/track?id=${order.awbNumber}`)}>
                  
                  <div className="order-status-icon" style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}>
                    <i className={`fa-solid ${statusInfo.icon}`} />
                  </div>
                  
                  <div className="order-info">
                    <div className="order-awb">
                      {order.cargoAwb ? `AWB: ${order.cargoAwb}` : `Temp AWB: ${order.awbNumber}`}
                    </div>
                    <div className="order-route">
                      {order.sender?.city} <i className="fa-solid fa-arrow-right text-gray" style={{ margin: '0 4px', fontSize: '0.8rem' }} /> {order.receiver?.city}
                    </div>
                    <div className="order-date">
                      {formatDate(order.createdAt)} • {order.packageType} ({order.weight}kg)
                    </div>
                  </div>

                  <div className="order-card-actions">
                    <span className={`badge ${getBadgeClass(order.status)}`}>
                      {statusInfo.label}
                    </span>
                    {order.status === 'pending' && (
                      <button 
                        className="btn btn-primary btn-sm ml-sm" 
                        onClick={(e) => { e.stopPropagation(); navigate('/payment', { state: { orderId: order.id, awb: order.awbNumber }}); }}
                      >
                        Pay ₹{order.estimatedPrice}
                      </button>
                    )}
                    <i className="fa-solid fa-chevron-right text-light" style={{ marginLeft: 'var(--space-sm)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
