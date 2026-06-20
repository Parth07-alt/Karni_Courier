import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

const initialBooking = {
  // Step 1 — Address
  sender: { name: '', phone: '', address: '', pincode: '', city: '', state: '' },
  receiver: { name: '', phone: '', address: '', pincode: '', city: '', state: '' },
  // Step 2 — Package
  packageType: 'box',
  weight: 1,
  length: '',
  width: '',
  height: '',
  contents: 'documents',
  value: '',
  insurance: false,
  // Step 3 — Schedule
  pickupDate: '',
  pickupSlot: 'morning',
  // Step 4 — Payment
  paymentMethod: 'online',
  // Meta
  estimatedPrice: 0,
  awbNumber: '',
};

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(initialBooking);
  const [step, setStep] = useState(1);

  const updateBooking = (updates) => setBooking((prev) => ({ ...prev, ...updates }));
  const updateSender = (updates) => setBooking((prev) => ({ ...prev, sender: { ...prev.sender, ...updates } }));
  const updateReceiver = (updates) => setBooking((prev) => ({ ...prev, receiver: { ...prev.receiver, ...updates } }));

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const goToStep = (n) => setStep(n);

  const resetBooking = () => {
    setBooking(initialBooking);
    setStep(1);
  };

  return (
    <BookingContext.Provider value={{
      booking, step, updateBooking, updateSender, updateReceiver,
      nextStep, prevStep, goToStep, resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be inside BookingProvider');
  return ctx;
};
