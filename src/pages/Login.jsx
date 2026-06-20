import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePhoneAuth } from '../hooks/usePhoneAuth';
import { useAuth } from '../context/AuthContext';
import OTPModal from '../components/OTPModal';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { sendOTP, verifyOTP, sending, error, reset } = usePhoneAuth();
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    const success = await sendOTP(phone);
    if (success) {
      setShowOtpModal(true);
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      await verifyOTP(otp);
      setShowOtpModal(false);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleCloseModal = () => {
    setShowOtpModal(false);
    reset();
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--navbar-height))', background: 'var(--off-white)', padding: 'var(--space-2xl) 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-3xl)', margin: 'var(--space-md)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto var(--space-md)', background: 'var(--primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.5rem' }}>
            <i className="fa-solid fa-user-shield" />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-gray)', marginTop: 4 }}>Login or register to book and track shipments securely.</p>
        </div>

        <form onSubmit={handleSendOTP}>
          <div className="form-group mb-xl">
            <label className="form-label" htmlFor="phone">Mobile Number</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ 
                background: 'var(--light-gray)', border: '1.5px solid var(--border)', 
                borderRadius: 'var(--radius-md)', padding: '0 16px', 
                display: 'flex', alignItems: 'center', color: 'var(--text-medium)',
                fontWeight: 600, flexShrink: 0
              }}>
                +91
              </div>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                style={{ flex: 1, fontWeight: 500, letterSpacing: 1 }}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-lg" style={{ padding: '10px 14px' }}>
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg"
            disabled={phone.length !== 10 || sending}
          >
            {sending ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending OTP...</>
            ) : (
              'Get OTP'
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-xl) 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <div style={{ padding: '0 var(--space-md)', color: 'var(--text-gray)', fontSize: '0.875rem', fontWeight: 600 }}>OR</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button 
          className="btn btn-block btn-lg" 
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          style={{ background: 'var(--white)', border: '1.5px solid var(--border)', color: 'var(--text-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {googleLoading ? (
            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'var(--text-dark)', borderRightColor: 'transparent', marginRight: 10 }} /> Connecting...</>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, marginRight: 10, position: 'relative', top: -1 }} /> 
              Continue with Google
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.8125rem', color: 'var(--text-light)' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>

      <OTPModal 
        isOpen={showOtpModal} 
        onClose={handleCloseModal} 
        onVerify={handleVerifyOTP} 
        phone={phone} 
      />
    </div>
  );
};

export default Login;
