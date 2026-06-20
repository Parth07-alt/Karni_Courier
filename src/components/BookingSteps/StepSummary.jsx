import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { calculatePrice, getZone, fetchPricingConfig } from '../../utils/pricing';
import { generateAWB } from '../../utils/awbGenerator';

const StepSummary = () => {
  const { user } = useAuth();
  const { booking, updateBooking, prevStep, resetBooking } = useBooking();
  const navigate = useNavigate();

  // Calculate price whenever booking details change
  useEffect(() => {
    const calcWithConfig = async () => {
      const config = await fetchPricingConfig();
      const zone = getZone(booking.sender.state, booking.receiver.state);
      const pricing = calculatePrice({
        weight: booking.weight,
        length: booking.length,
        width: booking.width,
        height: booking.height,
        zone,
        insurance: booking.insurance,
        value: booking.value,
        packageType: booking.packageType,
        config,
      });
      
      updateBooking({ 
        estimatedPrice: pricing.total,
        priceBreakdown: pricing
      });
    };
    calcWithConfig();
  }, [
    booking.sender.state, booking.receiver.state, 
    booking.weight, booking.length, booking.width, booking.height,
    booking.insurance, booking.value, booking.packageType
  ]);

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    
    // Generate AWB and save order to Firestore
    const awb = generateAWB();
    const orderData = {
      ...booking,
      userId: user.uid,
      userEmail: user.email || null,
      awbNumber: awb,
      status: 'pending', // Will update to confirmed after payment
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed, awaiting payment/confirmation.'
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      // Navigate to Payment Page with Order ID
      navigate('/payment', { state: { orderId: docRef.id, awb } });
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to create booking. Please try again.");
    }
  };

  return (
    <div className="step-form-card card">
      <h2 className="step-form-title">
        <i className="fa-solid fa-list-check" /> Order Summary
      </h2>

      <div className="step-section">
        <div className="summary-section-label">Address Details</div>
        <div style={{ padding: 'var(--space-md)', background: 'var(--off-white)', borderRadius: 'var(--radius-md)' }}>
          <div className="summary-address-row">
            <div className="addr-dot pickup" />
            <div>
              <div className="summary-name">{booking.sender.name} (Pickup)</div>
              <div className="summary-loc">{booking.sender.address}, {booking.sender.city} {booking.sender.state} - {booking.sender.pincode}</div>
              <div className="summary-loc" style={{ marginTop: 2 }}><i className="fa-solid fa-phone" style={{ fontSize: '0.75rem' }}/> +91 {booking.sender.phone}</div>
            </div>
          </div>
          
          <div style={{ marginLeft: 4, paddingLeft: 18, borderLeft: '2px dashed var(--border)', height: 20 }} />
          
          <div className="summary-address-row">
            <div className="addr-dot delivery" />
            <div>
              <div className="summary-name">{booking.receiver.name} (Delivery)</div>
              <div className="summary-loc">{booking.receiver.address}, {booking.receiver.city} {booking.receiver.state} - {booking.receiver.pincode}</div>
              <div className="summary-loc" style={{ marginTop: 2 }}><i className="fa-solid fa-phone" style={{ fontSize: '0.75rem' }}/> +91 {booking.receiver.phone}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <div>
          <div className="summary-section-label">Package Details</div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--off-white)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <i className={booking.packageType === 'envelope' ? 'fa-solid fa-envelope' : booking.packageType === 'bag' ? 'fa-solid fa-bag-shopping' : 'fa-solid fa-box-open'} style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{booking.packageType}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-gray)', textTransform: 'capitalize' }}>{booking.contents}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.8125rem' }}>
              <div style={{ background: 'var(--white)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <strong>{booking.weight}</strong> kg
              </div>
              {(booking.length && booking.width && booking.height) && (
                <div style={{ background: 'var(--white)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  {booking.length}x{booking.width}x{booking.height} cm
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="summary-section-label">Pickup Schedule</div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--off-white)', borderRadius: 'var(--radius-md)', height: 'calc(100% - 22px)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
              {new Date(booking.pickupDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-gray)', textTransform: 'capitalize' }}>
              <i className="fa-regular fa-clock" /> {booking.pickupSlot} Slot
            </div>
          </div>
        </div>
      </div>

      {booking.priceBreakdown && (
        <div className="step-section" style={{ borderBottom: 'none' }}>
          <div className="summary-section-label">Price Estimate</div>
          <div style={{ background: 'var(--primary-bg)', border: '1px solid rgba(204,0,0,0.2)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
            <div className="summary-price-row">
              <span>Base Shipping Rate ({booking.priceBreakdown.chargeableWeight}kg charged)</span>
              <span>₹ {booking.priceBreakdown.base}</span>
            </div>
            {booking.insurance && (
              <div className="summary-price-row">
                <span>Karni Protect (Insurance)</span>
                <span>₹ {booking.priceBreakdown.insurance}</span>
              </div>
            )}
            <div className="summary-price-row">
              <span>GST (18%)</span>
              <span>₹ {booking.priceBreakdown.gst}</span>
            </div>
            <div className="summary-price-row total">
              <span>Estimated Total Amount</span>
              <span className="amount">₹ {booking.estimatedPrice}</span>
            </div>
          </div>
        </div>
      )}

      <div className="step-nav">
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          <i className="fa-solid fa-arrow-left" /> Back
        </button>
        <button type="button" className="btn btn-primary btn-lg" onClick={handleConfirmAndPay}>
          Proceed to Payment <i className="fa-solid fa-credit-card" />
        </button>
      </div>
    </div>
  );
};

export default StepSummary;
