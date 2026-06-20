import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import StatusTimeline from '../components/StatusTimeline';
import { formatDateTime } from '../utils/awbGenerator';

const Track = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const idFromQuery = searchParams.get('id') || '';
  
  const [trackingId, setTrackingId] = useState(idFromQuery);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (idFromQuery) {
      handleSearch(idFromQuery);
    }
  }, [idFromQuery]);

  const handleSearch = async (awb) => {
    if (!awb.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const searchTerm = awb.trim();
      let orderDoc = null;
      let matchedByCargo = false;

      // 1. Search by Karni Tracking ID (awbNumber)
      const qKarni = query(collection(db, 'orders'), where('awbNumber', '==', searchTerm.toUpperCase()));
      const snapKarni = await getDocs(qKarni);
      
      if (!snapKarni.empty) {
        orderDoc = snapKarni.docs[0];
      } else {
        // 2. Search by Cargo Partner AWB (cargoAwb)
        const qCargo = query(collection(db, 'orders'), where('cargoAwb', '==', searchTerm));
        const snapCargo = await getDocs(qCargo);
        if (!snapCargo.empty) {
          orderDoc = snapCargo.docs[0];
          matchedByCargo = true;
        }
      }
      
      if (orderDoc) {
        const docData = orderDoc.data();
        
        // Redirect if they explicitly searched using the Cargo AWB
        if (matchedByCargo && docData.status === 'pickedup' && docData.cargoCompany) {
          const company = docData.cargoCompany.toLowerCase();
          const trackingAwb = docData.cargoAwb;
          let redirectUrl = '';
          
          if (company === 'mark') {
            redirectUrl = `http://crm.markerp.in/Frm_DocTrackWeb.aspx?docno=${trackingAwb}`;
          } else if (company === 'dtdc') {
            redirectUrl = 'https://www.dtdc.com/track-your-shipment/';
          } else if (company === 'maruti') {
            redirectUrl = 'http://marutiair.com/tracking.html';
          } else if (company === 'dhl') {
            redirectUrl = `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${trackingAwb}`;
          } else if (company === 'bluedart') {
            redirectUrl = 'https://www.bluedart.com/tracking';
          }

          if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
          }
        }

        // Show Karni Order Status Page
        setOrder({ id: orderDoc.id, ...docData });
        setTrackingId(docData.cargoAwb || docData.awbNumber);
        setSearchParams({ id: docData.awbNumber }, { replace: true });
      } else {
        setError('No shipment found. Please check your Tracking ID or Partner AWB and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while tracking. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(trackingId);
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--off-white)', minHeight: 'calc(100vh - var(--navbar-height))' }}>
      
      {/* Order Status Display at the top if exists */}
      {order && (
        <div className="container" style={{ padding: 'var(--space-3xl) var(--container-px)' }}>
          <h2 style={{ marginBottom: 'var(--space-xl)', textAlign: 'center', fontSize: '2rem' }}>Shipment Status</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-xl)' }} className="booking-layout">
            {/* Timeline Column */}
            <div className="card track-result-card">
              <div className="flex-between mb-lg">
                <div className="awb-badge mb-0">
                  <i className="fa-solid fa-barcode" /> {order.cargoAwb ? `AWB: ${order.cargoAwb}` : `Temp AWB: ${order.awbNumber}`}
                </div>
                {order.status === 'cancelled' && (
                  <span className="badge badge-cancelled" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>Cancelled</span>
                )}
              </div>
              
              <StatusTimeline 
                currentStatus={order.status} 
                timeline={order.timeline || []} 
              />
            </div>

            {/* Details Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="card" style={{ padding: 'var(--space-lg)' }}>
                <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem', color: 'var(--text-gray)', textTransform: 'uppercase' }}>Shipment Details</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  <i className="fa-solid fa-box text-primary" style={{ fontSize: '1.5rem' }} />
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.packageType} - {order.contents}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>Weight: {order.weight} kg</div>
                  </div>
                </div>
                <hr className="widget-divider" style={{ margin: '12px 0' }} />
                <div style={{ fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="text-gray">Booked On:</span>
                    <span className="fw-600">{formatDateTime(order.createdAt)}</span>
                  </div>
                  {order.pickupDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className="text-gray">Pickup Date:</span>
                      <span className="fw-600">{order.pickupDate} ({order.pickupSlot})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{ padding: 'var(--space-lg)' }}>
                <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem', color: 'var(--text-gray)', textTransform: 'uppercase' }}>Route Info</h4>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 8px 0' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                    <div style={{ width: 2, height: 40, background: 'var(--border)' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-dark)' }} />
                  </div>
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 600 }}>FROM</div>
                      <div className="fw-600">{order.sender?.city}, {order.sender?.state}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 600 }}>TO</div>
                      <div className="fw-600">{order.receiver?.city}, {order.receiver?.state}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Input Section Inside Order View if Picked Up */}
          {order.status === 'pickedup' && order.cargoAwb && (
            <div className="card" style={{ padding: 'var(--space-2xl)', marginTop: 'var(--space-2xl)', textAlign: 'center', background: 'var(--primary-bg)', border: '2px dashed var(--primary)' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--space-sm)' }}>Track with Cargo Partner</h3>
              <p style={{ color: 'var(--text-gray)', marginBottom: 'var(--space-lg)' }}>
                Your parcel was forwarded via <strong>{order.cargoCompany}</strong>. Enter your Partner AWB number (<strong>{order.cargoAwb}</strong>) below to view live tracking.
              </p>
              <form className="track-search-box" onSubmit={onSubmit} style={{ maxWidth: 500, margin: '0 auto', display: 'flex', gap: 'var(--space-sm)' }}>
                <div className="input-icon-wrap" style={{ flex: 1, margin: 0, boxShadow: 'none' }}>
                  <i className="fa-solid fa-magnifying-glass" />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ padding: '14px 16px 14px 44px' }}
                    placeholder="Enter Partner AWB Number"
                    value={trackingId}
                    onChange={e => setTrackingId(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ margin: 0, padding: '0 var(--space-xl)' }} disabled={loading}>
                  {loading ? 'Searching...' : 'Track Partner AWB'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Default Hero Search (only show if NO order is loaded) */}
      {!order && (
        <section className="track-hero">
          <div className="container">
            <h1>Track Your Shipment</h1>
            <p>Enter your Tracking ID or Partner AWB number to get real-time status updates</p>
            
            <form className="track-search-box" onSubmit={onSubmit}>
              <div className="input-icon-wrap" style={{ flex: 1 }}>
                <i className="fa-solid fa-magnifying-glass" />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ padding: '16px 16px 16px 44px', fontSize: '1.0625rem' }}
                  placeholder="Enter Tracking ID or Partner AWB..."
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Searching...' : 'Track Parcel'}
              </button>
            </form>
          </div>
        </section>
      )}

      {error && !order && (
        <div className="container mt-xl">
          <div className="alert alert-warning" style={{ justifyContent: 'center' }}>
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default Track;
