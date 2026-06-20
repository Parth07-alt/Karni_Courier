import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { sendOrderConfirmationEmail } from '../utils/emailService';

const Payment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, awb } = location.state || {};
  
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('razorpay');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().userId === user.uid) {
          setOrder(snap.data());
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, user, navigate]);

  const confirmOrderPayment = async (paymentRef) => {
    setProcessing(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'confirmed',
        paymentMethod: method,
        paymentRef: paymentRef,
        'timeline': [
          ...(order.timeline || []),
          { status: 'confirmed', timestamp: new Date(), note: `Payment successful (${method}). Booking confirmed.` }
        ]
      });
      
      // Send EmailJS Confirmation Email
      await sendOrderConfirmationEmail(order, user.email);

      navigate(`/dashboard`, { state: { paid: true } });
    } catch (err) {
      console.error(err);
      alert('Error updating order status. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpay = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
      amount: order.estimatedPrice * 100, // Amount in paise
      currency: 'INR',
      name: 'Karni Air Courier',
      description: `Payment for AWB: ${awb}`,
      image: '/logo.png',
      handler: function (response) {
        confirmOrderPayment(response.razorpay_payment_id);
      },
      prefill: {
        name: user.displayName || 'Customer',
        contact: user.phoneNumber || '',
        email: user.email || ''
      },
      theme: { color: '#CC0000' }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleUPI = () => {
    // In a real app, this would verify via Webhook. Here we mock it.
    setTimeout(() => {
      const mockRef = `UPI_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      confirmOrderPayment(mockRef);
    }, 2000);
  };

  if (loading) return <div className="page-loading"><div className="spinner spinner-red"/></div>;
  if (!order) return null;

  return (
    <div className="page-wrapper" style={{ background: 'var(--off-white)', padding: 'var(--space-3xl) 0', minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)' }}>Complete Payment</h2>
            <p style={{ color: 'var(--text-gray)' }}>Secure checkout for AWB: <strong style={{ color: 'var(--text-dark)' }}>{awb}</strong></p>
          </div>

          <div style={{ background: 'var(--primary-bg)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>TOTAL AMOUNT TO PAY</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-dark)', lineHeight: 1 }}>
              ₹ {order.estimatedPrice}
            </div>
          </div>

          <h4 style={{ marginBottom: 'var(--space-md)' }}>Select Payment Method</h4>
          
          <div className="payment-methods">
            <div className={`pay-method ${method === 'razorpay' ? 'active' : ''}`} onClick={() => setMethod('razorpay')}>
              <i className="fa-regular fa-credit-card pay-method-icon" />
              <h4>Cards, NetBanking, Wallets</h4>
              <p>Powered by Razorpay</p>
            </div>
            
            <div className={`pay-method ${method === 'upi' ? 'active' : ''}`} onClick={() => setMethod('upi')}>
              <i className="fa-solid fa-qrcode pay-method-icon" />
              <h4>UPI QR Code</h4>
              <p>Google Pay, PhonePe, Paytm</p>
            </div>

            <div className={`pay-method ${method === 'cod' ? 'active' : ''}`} onClick={() => setMethod('cod')}>
              <i className="fa-solid fa-money-bill-wave pay-method-icon" />
              <h4>Cash on Delivery</h4>
              <p>Pay when you receive</p>
            </div>
          </div>

          {method === 'upi' && (
            <div className="upi-qr-box">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="UPI QR Code" className="upi-qr-img" />
              <div className="upi-id-text">Scan & Pay to:</div>
              <div className="upi-id-val">karni.courier@upi</div>
              <div style={{ marginTop: 'var(--space-md)' }}>
                <button className="btn btn-secondary" onClick={handleUPI} disabled={processing}>
                  {processing ? 'Verifying...' : 'I have completed the payment'}
                </button>
              </div>
            </div>
          )}

          {method === 'razorpay' && (
            <button className="btn btn-primary btn-block btn-lg" onClick={handleRazorpay} disabled={processing}>
              <i className="fa-solid fa-lock" /> Pay Securely ₹ {order.estimatedPrice}
            </button>
          )}

          {method === 'cod' && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
              <p style={{ color: 'var(--text-gray)', marginBottom: 'var(--space-md)' }}>
                You will pay <strong style={{ color: 'var(--text-dark)' }}>₹ {order.estimatedPrice}</strong> in cash at the time of delivery.
              </p>
              <button className="btn btn-primary btn-block btn-lg" onClick={() => confirmOrderPayment('COD')} disabled={processing}>
                <i className="fa-solid fa-truck" /> Confirm Cash on Delivery
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Payment;
