import { useBooking } from '../../context/BookingContext';

const StepPackage = () => {
  const { booking, updateBooking, prevStep, nextStep } = useBooking();

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-form-card card">
      <h2 className="step-form-title">
        <i className="fa-solid fa-box" /> Package Details
      </h2>

      <form onSubmit={handleNext}>
        <div className="step-section">
          <div className="step-section-title">Select Packaging</div>
          <div className="package-options">
            <div 
              className={`package-option ${booking.packageType === 'box' ? 'selected' : ''}`}
              onClick={() => updateBooking({ packageType: 'box' })}
            >
              <i className="fa-solid fa-box-open" />
              <span>Box / Carton</span>
            </div>
            <div 
              className={`package-option ${booking.packageType === 'envelope' ? 'selected' : ''}`}
              onClick={() => updateBooking({ packageType: 'envelope' })}
            >
              <i className="fa-solid fa-envelope" />
              <span>Document</span>
            </div>
            <div 
              className={`package-option ${booking.packageType === 'bag' ? 'selected' : ''}`}
              onClick={() => updateBooking({ packageType: 'bag' })}
            >
              <i className="fa-solid fa-bag-shopping" />
              <span>Flyer / Bag</span>
            </div>
          </div>
        </div>

        <div className="step-section">
          <div className="step-section-title">Parcel Weight</div>
          <div className="weight-slider-wrap">
            <div className="weight-display">
              <span className="weight-value">{booking.weight} <span className="weight-unit">kg</span></span>
              <span className="weight-unit" style={{ alignSelf: 'center' }}>Max: 50kg</span>
            </div>
            <input 
              type="range" 
              min="0.1" max="50" step="0.1" 
              value={booking.weight} 
              onChange={e => updateBooking({ weight: parseFloat(e.target.value) })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>
              <span>0.1 kg</span>
              <span>25 kg</span>
              <span>50 kg</span>
            </div>
          </div>
        </div>

        <div className="step-section">
          <div className="step-section-title">Dimensions (Optional)</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-gray)', marginBottom: 'var(--space-md)' }}>
            Volumetric weight may apply if dimensions exceed actual weight.
          </p>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Length (cm)</label>
              <input type="number" className="form-input" min="0" value={booking.length} onChange={e => updateBooking({ length: e.target.value })} placeholder="L" />
            </div>
            <div className="form-group">
              <label className="form-label">Width (cm)</label>
              <input type="number" className="form-input" min="0" value={booking.width} onChange={e => updateBooking({ width: e.target.value })} placeholder="W" />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input type="number" className="form-input" min="0" value={booking.height} onChange={e => updateBooking({ height: e.target.value })} placeholder="H" />
            </div>
          </div>
        </div>

        <div className="step-section" style={{ borderBottom: 'none' }}>
          <div className="step-section-title">Contents & Protection</div>
          
          <div className="form-group mb-md">
            <label className="form-label">Package Contents <span className="form-required">*</span></label>
            <select className="form-select" required value={booking.contents} onChange={e => updateBooking({ contents: e.target.value })}>
              <option value="documents">Documents / Books</option>
              <option value="clothes">Clothes / Apparels</option>
              <option value="electronics">Electronics (Non-battery)</option>
              <option value="household">Household Items</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ background: 'var(--off-white)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                style={{ marginTop: 4, width: 18, height: 18, accentColor: 'var(--primary)' }} 
                checked={booking.insurance}
                onChange={e => updateBooking({ insurance: e.target.checked })}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Protect my package (Insurance)</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-gray)' }}>
                  Add 1% of package value (min ₹50) for total coverage against loss or damage.
                </div>
              </div>
            </label>

            {booking.insurance && (
              <div className="form-group mt-md" style={{ marginLeft: 26 }}>
                <label className="form-label">Declared Value (₹) <span className="form-required">*</span></label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  min="100"
                  value={booking.value} 
                  onChange={e => updateBooking({ value: e.target.value })} 
                  placeholder="e.g. 2000" 
                />
              </div>
            )}
          </div>
        </div>

        <div className="step-nav">
          <button type="button" className="btn btn-secondary" onClick={prevStep}>
            <i className="fa-solid fa-arrow-left" /> Back
          </button>
          <button type="submit" className="btn btn-primary">
            Next: Schedule Pickup <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepPackage;
