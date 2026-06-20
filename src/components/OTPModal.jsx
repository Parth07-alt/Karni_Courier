import { useState, useEffect } from 'react';

const OTPModal = ({ isOpen, onClose, onVerify, phone }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    // Allow pasting full OTP
    if (value.length === 6) {
      const pasted = value.split('');
      setOtp(pasted);
      document.getElementById(`otp-5`)?.focus();
      return;
    }
    
    // Single digit input
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await onVerify(otpString);
      if (!result.success) {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto var(--space-md)'
          }}>
            <i className="fa-solid fa-mobile-screen-button" />
          </div>
          <h3 style={{ marginBottom: 4 }}>Verify Phone Number</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>
            We sent a 6-digit code to <strong>+91 {phone}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="6" // To allow pasting
                value={digit}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                className="otp-box"
                autoComplete="off"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="alert alert-error mb-md" style={{ padding: '8px 12px' }}>
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Verifying...</>
            ) : (
              'Verify & Continue'
            )}
          </button>
          
          <button type="button" className="btn btn-ghost btn-block mt-sm" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;
