import { useState, useRef } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';

export const usePhoneAuth = () => {
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const confirmRef = useRef(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => { window.recaptchaVerifier = null; },
      });
    }
  };

  const sendOTP = async (phone) => {
    setError('');
    setSending(true);
    try {
      setupRecaptcha();
      const phoneNumber = `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      confirmRef.current = result;
      setOtpSent(true);
      return true;
    } catch (err) {
      console.error("Firebase Send OTP Error:", err);
      window.recaptchaVerifier = null;
      setError(`Firebase Error: ${err.message}`);
      return false;
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async (otp) => {
    if (!confirmRef.current) { throw new Error('Session expired. Please resend OTP.'); }
    setVerifying(true);
    try {
      await confirmRef.current.confirm(otp);
      return true;
    } catch (err) {
      console.error("Firebase Verify Error:", err);
      throw err; // Throw the exact error so the UI can display its message
    } finally {
      setVerifying(false);
    }
  };

  const reset = () => { setOtpSent(false); setError(''); confirmRef.current = null; };

  return { sending, verifying, otpSent, error, sendOTP, verifyOTP, reset };
};
