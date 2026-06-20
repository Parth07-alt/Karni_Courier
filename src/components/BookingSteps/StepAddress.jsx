import { useBooking } from '../../context/BookingContext';

const StepAddress = () => {
  const { booking, updateSender, updateReceiver, nextStep } = useBooking();

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-form-card card">
      <h2 className="step-form-title">
        <i className="fa-solid fa-location-dot" /> Address Details
      </h2>

      <form onSubmit={handleNext}>
        <div className="step-section">
          <div className="step-section-title">
            <i className="fa-solid fa-house-chimney" /> Pickup Address (Sender)
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name <span className="form-required">*</span></label>
              <input type="text" className="form-input" required value={booking.sender.name} onChange={e => updateSender({ name: e.target.value })} placeholder="Sender Name" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number <span className="form-required">*</span></label>
              <input type="tel" className="form-input" required maxLength={10} value={booking.sender.phone} onChange={e => updateSender({ phone: e.target.value.replace(/\D/g,'') })} placeholder="10-digit Mobile" />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Address (House No, Street, Landmark) <span className="form-required">*</span></label>
            <input type="text" className="form-input" required value={booking.sender.address} onChange={e => updateSender({ address: e.target.value })} placeholder="Full Pickup Address" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pincode <span className="form-required">*</span></label>
              <input type="text" className="form-input" required maxLength={6} value={booking.sender.pincode} onChange={e => updateSender({ pincode: e.target.value.replace(/\D/g,'') })} placeholder="6-digit Pincode" />
            </div>
            <div className="form-group">
              <label className="form-label">State <span className="form-required">*</span></label>
              <input type="text" className="form-input" required value={booking.sender.state} onChange={e => updateSender({ state: e.target.value })} placeholder="State" />
            </div>
          </div>
        </div>

        <div className="step-section" style={{ borderBottom: 'none' }}>
          <div className="step-section-title">
            <i className="fa-solid fa-map-location-dot" /> Delivery Address (Receiver)
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name <span className="form-required">*</span></label>
              <input type="text" className="form-input" required value={booking.receiver.name} onChange={e => updateReceiver({ name: e.target.value })} placeholder="Receiver Name" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number <span className="form-required">*</span></label>
              <input type="tel" className="form-input" required maxLength={10} value={booking.receiver.phone} onChange={e => updateReceiver({ phone: e.target.value.replace(/\D/g,'') })} placeholder="10-digit Mobile" />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Address (House No, Street, Landmark) <span className="form-required">*</span></label>
            <input type="text" className="form-input" required value={booking.receiver.address} onChange={e => updateReceiver({ address: e.target.value })} placeholder="Full Delivery Address" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pincode <span className="form-required">*</span></label>
              <input type="text" className="form-input" required maxLength={6} value={booking.receiver.pincode} onChange={e => updateReceiver({ pincode: e.target.value.replace(/\D/g,'') })} placeholder="6-digit Pincode" />
            </div>
            <div className="form-group">
              <label className="form-label">State <span className="form-required">*</span></label>
              <input type="text" className="form-input" required value={booking.receiver.state} onChange={e => updateReceiver({ state: e.target.value })} placeholder="State" />
            </div>
          </div>
        </div>

        <div className="step-nav" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Next: Package Details <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepAddress;
