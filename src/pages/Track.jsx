import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import StatusTimeline from '../components/StatusTimeline';
import { formatDateTime } from '../utils/awbGenerator';

const getRedirectUrl = (company, awb) => {
  company = company.toLowerCase();
  if (company === 'mark' || company.includes('mark')) return `http://crm.markerp.in/Frm_DocTrackWeb.aspx?docno=${awb}`;
  if (company === 'dtdc' || company.includes('dtdc')) return 'https://www.dtdc.com/track-your-shipment/';
  if (company === 'maruti' || company.includes('maruti')) return 'http://marutiair.com/tracking.html';
  if (company === 'dhl' || company.includes('dhl')) return `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${awb}`;
  if (company === 'bluedart' || company.includes('bluedart')) return 'https://www.bluedart.com/tracking';
  if (company.includes('delhivery')) return `https://www.delhivery.com/track/package/${awb}`;
  if (company.includes('mahabali')) return `https://www.trackingmore.com/shree-mahabali-express-tracking.html?number=${awb}`;
  return '';
};

const Track = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const idFromQuery = searchParams.get('id') || '';

  const [trackingId, setTrackingId] = useState(idFromQuery);
  const [cargoCompany, setCargoCompany] = useState('karni');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // For the bottom tracking form inside the order detail view
  const [partnerTrackingId, setPartnerTrackingId] = useState('');
  const [partnerCompany, setPartnerCompany] = useState('mark');

  useEffect(() => {
    if (idFromQuery) {
      handleSearch(idFromQuery);
    }
  }, [idFromQuery]);

  useEffect(() => {
    if (order && order.cargoAwb) {
      setPartnerTrackingId(order.cargoAwb);
      const company = (order.cargoCompany || 'mark').toLowerCase();

      let matchedValue = 'mark';
      if (company.includes('dtdc')) matchedValue = 'dtdc';
      else if (company.includes('maruti')) matchedValue = 'maruti';
      else if (company.includes('dhl')) matchedValue = 'dhl';
      else if (company.includes('bluedart')) matchedValue = 'bluedart';
      else if (company.includes('delhivery')) matchedValue = 'delhivery';
      else if (company.includes('mahabali')) matchedValue = 'mahabali';

      setPartnerCompany(matchedValue);
    }
  }, [order]);

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

        // Redirect if they explicitly searched using the Cargo AWB AND they were using "Karni ID" in the dropdown
        if (matchedByCargo && docData.status === 'pickedup' && docData.cargoCompany) {
          const redirectUrl = getRedirectUrl(docData.cargoCompany, docData.cargoAwb);
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

  const onSubmitMain = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    if (cargoCompany !== 'karni') {
      const redirectUrl = getRedirectUrl(cargoCompany, trackingId.trim());
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
    }

    // Otherwise, it's a Karni ID, so we search our database
    handleSearch(trackingId);
  };

  const onSubmitPartner = (e) => {
    e.preventDefault();
    if (!partnerTrackingId.trim()) return;

    const redirectUrl = getRedirectUrl(partnerCompany, partnerTrackingId.trim());
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      alert("Tracking link for this partner is not configured yet.");
    }
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

              <form className="hero-track-form" onSubmit={onSubmitPartner} style={{ maxWidth: 700, margin: '0 auto' }}>
                <select
                  className="form-input hero-track-select"
                  value={partnerCompany}
                  onChange={(e) => setPartnerCompany(e.target.value)}
                  style={{ border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text-dark)' }}
                >
                  <option value="mark">Mark</option>
                  <option value="dtdc">DTDC</option>
                  <option value="maruti">Maruti</option>
                  <option value="dhl">DHL</option>
                  <option value="bluedart">BlueDart</option>
                  <option value="delhivery">Delhivery</option>
                  <option value="mahabali">Shree Mahabali</option>
                </select>

                <div className="input-icon-wrap" style={{ flex: 1, margin: 0, boxShadow: 'none' }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-gray)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '14px 16px 14px 44px', border: '1px solid var(--border)' }}
                    placeholder="Enter Partner AWB Number"
                    value={partnerTrackingId}
                    onChange={e => setPartnerTrackingId(e.target.value)}
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
        <section className="track-hero" style={{ background: 'var(--primary-dark)', padding: 'var(--space-4xl) 0', color: 'var(--white)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>Track Your Shipment</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: 'var(--space-2xl)' }}>
              Enter your Tracking ID or Partner AWB number to get real-time status updates
            </p>

            <form className="hero-track-form" onSubmit={onSubmitMain} style={{ maxWidth: 800, margin: '0 auto' }}>
              <select
                className="form-input hero-track-select"
                value={cargoCompany}
                onChange={(e) => setCargoCompany(e.target.value)}
                style={{ border: 'none', background: 'var(--white)', color: 'var(--text-dark)' }}
              >
                <option value="karni">Karni ID</option>
                <option value="mark">Mark</option>
                <option value="dtdc">DTDC</option>
                <option value="maruti">Maruti</option>
                <option value="dhl">DHL</option>
                <option value="bluedart">BlueDart</option>
                <option value="delhivery">Delhivery</option>
                <option value="mahabali">Shree Mahabali</option>
              </select>

              <div className="input-icon-wrap" style={{ flex: 1, margin: 0, boxShadow: 'none' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-gray)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '16px 16px 16px 44px', fontSize: '1.0625rem', border: 'none' }}
                  placeholder={cargoCompany === 'karni' ? "Enter Tracking ID..." : "Enter Partner AWB..."}
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ margin: 0, padding: '0 var(--space-2xl)', fontSize: '1.0625rem' }} disabled={loading}>
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
