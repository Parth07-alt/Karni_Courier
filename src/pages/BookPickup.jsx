import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useBooking, BookingProvider } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import StepAddress from '../components/BookingSteps/StepAddress';
import StepPackage from '../components/BookingSteps/StepPackage';
import StepSchedule from '../components/BookingSteps/StepSchedule';
import StepSummary from '../components/BookingSteps/StepSummary';

const BookPickupContent = () => {
  const { step, goToStep, booking, updateSender, updateReceiver } = useBooking();
  const location = useLocation();

  // Pre-fill pincodes if passed from Homepage widget
  useEffect(() => {
    if (location.state?.fromPin) updateSender({ pincode: location.state.fromPin });
    if (location.state?.toPin) updateReceiver({ pincode: location.state.toPin });
  }, [location.state]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const renderStep = () => {
    switch(step) {
      case 1: return <StepAddress />;
      case 2: return <StepPackage />;
      case 3: return <StepSchedule />;
      case 4: return <StepSummary />;
      default: return <StepAddress />;
    }
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--off-white)', paddingBottom: 'var(--space-4xl)' }}>
      {/* Step Indicator Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 'var(--navbar-height)', zIndex: 10 }}>
        <div className="container">
          <div className="step-indicator">
            {[
              { num: 1, label: 'Address' },
              { num: 2, label: 'Package' },
              { num: 3, label: 'Schedule' },
              { num: 4, label: 'Summary' }
            ].map((s, i) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i === 3 ? '0' : '1' }}>
                <div 
                  className={`step-item ${step > s.num ? 'done' : ''} ${step === s.num ? 'active' : ''}`}
                  onClick={() => step > s.num ? goToStep(s.num) : null}
                  style={{ cursor: step > s.num ? 'pointer' : 'default', flex: 1 }}
                >
                  <div className="step-circle">
                    {step > s.num ? <i className="fa-solid fa-check" /> : s.num}
                  </div>
                  <div className="step-label" style={{ position: 'absolute', top: 48, width: 100, marginLeft: -30 }}>{s.label}</div>
                </div>
                {i < 3 && <div className={`step-connector ${step > s.num ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mt-xl">
        <div className="booking-layout">
          
          {/* Form Area */}
          <div style={{ gridColumn: 'span 1' }}>
            {renderStep()}
          </div>

          {/* Sticky Side Summary widget (only shown on Desktop) */}
          <div className="order-summary-card card hidden-mobile" style={{ alignSelf: 'start' }}>
            <h3 className="order-summary-title">Booking Overview</h3>
            
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="summary-section-label">Route</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{booking.sender.pincode || '----'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Pickup</div>
                </div>
                <i className="fa-solid fa-arrow-right-long text-primary" />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{booking.receiver.pincode || '----'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Delivery</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="summary-section-label">Package</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <i className="fa-solid fa-box text-primary" />
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{booking.packageType}</span>
                <span className="badge" style={{ background: 'var(--light-gray)', marginLeft: 'auto' }}>{booking.weight} kg</span>
              </div>
            </div>

            {booking.estimatedPrice > 0 && (
              <div style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-light)' }}>
                <div className="summary-section-label">Estimated Rate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹ {booking.estimatedPrice}
                </div>
              </div>
            )}

            {/* Ad Banner */}
            <div style={{ marginTop: 'var(--space-xl)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop" alt="Promo" style={{ height: 160, width: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'var(--space-md)' }}>
                <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: '1.1rem' }}>Ship Heavy Parcels</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem' }}>Get 20% off on Surface Cargo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookPickup = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="page-loading"><div className="spinner spinner-red"/></div>;
  if (!user) return <Navigate to="/login" state={{ from: { pathname: '/book' } }} replace />;

  return (
    <BookingProvider>
      <BookPickupContent />
    </BookingProvider>
  );
};

export default BookPickup;
