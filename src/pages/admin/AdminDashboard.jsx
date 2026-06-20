import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDateTime, getBadgeClass, STATUS_LABELS, STATUS_FLOW } from '../../utils/awbGenerator';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { sendPickupConfirmationEmail, sendCancellationEmail } from '../../utils/emailService';

const AdminDashboard = () => {
  const { initials, displayName } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pickupModal, setPickupModal] = useState({ open: false, orderId: null, awb: '', cargo: '', timeline: [] });
  const cargoPartners = ['Mark', 'Maruti', 'DTDC', 'DHL', 'BlueDart', 'Other'];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setOrders(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus, currentTimeline) => {
    if (newStatus === 'pickedup') {
      setPickupModal({ open: true, orderId, awb: '', cargo: 'Mark', timeline: currentTimeline || [] });
      return;
    }

    if (!window.confirm(`Are you sure you want to update status to ${STATUS_LABELS[newStatus]?.label || newStatus}?`)) return;
    
    try {
      const orderRef = doc(db, 'orders', orderId);
      const note = window.prompt("Optional note for this status update:", "");
      
      const newTimelineEvent = {
        status: newStatus,
        timestamp: new Date(),
        note: note || `Status updated to ${STATUS_LABELS[newStatus]?.label || newStatus}`
      };

      await updateDoc(orderRef, {
        status: newStatus,
        timeline: [...(currentTimeline || []), newTimelineEvent]
      });

      const updatedOrder = orders.find(o => o.id === orderId);
      if (newStatus === 'cancelled' && updatedOrder) {
        await sendCancellationEmail(updatedOrder, note);
      }
      
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? {
        ...o, status: newStatus, timeline: [...(o.timeline || []), newTimelineEvent]
      } : o));
      
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const submitPickupModal = async () => {
    if (!pickupModal.awb.trim()) return alert("Please enter AWB number");
    if (!pickupModal.cargo) return alert("Please select a cargo company");

    try {
      const orderRef = doc(db, 'orders', pickupModal.orderId);
      const newTimelineEvent = {
        status: 'pickedup',
        timestamp: new Date(),
        note: `Forwarded to ${pickupModal.cargo} with AWB: ${pickupModal.awb}`
      };

      await updateDoc(orderRef, {
        status: 'pickedup',
        cargoAwb: pickupModal.awb,
        cargoCompany: pickupModal.cargo,
        timeline: [...pickupModal.timeline, newTimelineEvent]
      });

      const updatedOrder = orders.find(o => o.id === pickupModal.orderId);
      if (updatedOrder) {
        // We pass the updated order data. It relies on the emailService pulling to_email from updatedOrder.sender.email
        await sendPickupConfirmationEmail(updatedOrder, pickupModal.cargo, pickupModal.awb);
      }

      setOrders(orders.map(o => o.id === pickupModal.orderId ? {
        ...o, status: 'pickedup', cargoAwb: pickupModal.awb, cargoCompany: pickupModal.cargo, timeline: [...(o.timeline || []), newTimelineEvent]
      } : o));

      alert(`✅ Customer Notified via SMS!\n\nMessage Sent:\n"Your Karni Air Courier shipment has been picked up and forwarded via ${pickupModal.cargo}. Tracking AWB: ${pickupModal.awb}"`);
      
      setPickupModal({ open: false, orderId: null, awb: '', cargo: '', timeline: [] });
    } catch (err) {
      console.error(err);
      alert('Error saving pickup details');
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    pickedup: orders.filter(o => o.status === 'pickedup').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <AdminLayout>
      <div className="admin-topbar">
        <div className="admin-topbar-title">Orders Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{displayName}</span>
          <div className="user-avatar" style={{ width: 36, height: 36 }}>{initials}</div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-cards">
          <div className="admin-stat-card">
            <div className="stat-icon-box" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><i className="fa-solid fa-box" /></div>
            <div className="stat-num">{stats.total}</div>
            <div className="stat-lbl">Total Orders</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon-box" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><i className="fa-solid fa-clock" /></div>
            <div className="stat-num">{stats.pending}</div>
            <div className="stat-lbl">Pending Payment</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon-box" style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}><i className="fa-solid fa-truck-fast" /></div>
            <div className="stat-num">{stats.pickedup}</div>
            <div className="stat-lbl">Picked Up</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon-box" style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}><i className="fa-solid fa-circle-xmark" /></div>
            <div className="stat-num">{stats.cancelled}</div>
            <div className="stat-lbl">Cancelled</div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">All Orders</h3>
            <select className="form-select" style={{ width: 'auto', padding: '8px 12px' }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABELS[s].label}</option>)}
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>AWB / Date</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4"><div className="spinner spinner-red mx-auto" /></td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No orders found.</td></tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <div className="fw-600">{order.awbNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{formatDateTime(order.createdAt)}</div>
                      </td>
                      <td>
                        <div>{order.sender?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>+91 {order.sender?.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem' }}>{order.sender?.city} → {order.receiver?.city}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{order.packageType} ({order.weight}kg)</div>
                      </td>
                      <td className="fw-600 text-primary">₹ {order.estimatedPrice}</td>
                      <td>
                        <span className={`badge ${getBadgeClass(order.status)}`}>{STATUS_LABELS[order.status]?.label || order.status}</span>
                      </td>
                      <td>
                        <select 
                          className="form-select" 
                          style={{ padding: '4px 8px', fontSize: '0.8125rem', width: 140 }}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value, order.timeline)}
                        >
                          {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABELS[s].label}</option>)}
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pickupModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Complete Pickup</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-gray)', marginBottom: 'var(--space-lg)' }}>
              Enter the partner AWB and select the logistics company. The customer will be notified via SMS.
            </p>
            
            <div className="form-group">
              <label className="form-label">Partner AWB Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter AWB"
                value={pickupModal.awb}
                onChange={e => setPickupModal({...pickupModal, awb: e.target.value})}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
              <label className="form-label">Cargo Partner</label>
              <select 
                className="form-select"
                value={pickupModal.cargo}
                onChange={e => setPickupModal({...pickupModal, cargo: e.target.value})}
              >
                {cargoPartners.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button 
                className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => setPickupModal({ open: false, orderId: null, awb: '', cargo: '', timeline: [] })}
              >
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitPickupModal}>
                Confirm Pickup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
