import { useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { getPickupDates } from '../../utils/awbGenerator';

const StepSchedule = () => {
  const { booking, updateBooking, prevStep, nextStep } = useBooking();
  const dates = getPickupDates();

  // Set default date if not selected
  useEffect(() => {
    if (!booking.pickupDate && dates.length > 0) {
      updateBooking({ pickupDate: dates[0].dateStr });
    }
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-form-card card">
      <h2 className="step-form-title">
        <i className="fa-regular fa-calendar-check" /> Schedule your Pickup
      </h2>

      <form onSubmit={handleNext}>
        <div className="step-section" style={{ borderBottom: 'none' }}>
          <div className="step-section-title">Select Pickup Day</div>
          
          <div className="date-cards">
            {dates.map((d) => (
              <div 
                key={d.dateStr}
                className={`date-card ${booking.pickupDate === d.dateStr ? 'selected' : ''}`}
                onClick={() => updateBooking({ pickupDate: d.dateStr })}
              >
                <div className="date-day">{d.dayName}</div>
                <div className="date-num">{d.dayNum}</div>
                <div className="date-month">{d.month}</div>
                {d.isToday && <div className="date-badge">Today</div>}
              </div>
            ))}
          </div>

          <div className="pickup-info-box mb-lg">
            <i className="fa-solid fa-circle-info" />
            <div>
              {booking.pickupDate === dates[0]?.dateStr ? (
                <strong>Same-Day Pickup:</strong>
              ) : (
                <strong>Scheduled Pickup:</strong>
              )}{' '}
              Our executive will call you before arriving at the pickup location. Pickups generally happen between 10 AM and 6 PM.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Time Slot</label>
            <select 
              className="form-select" 
              value={booking.pickupSlot} 
              onChange={e => updateBooking({ pickupSlot: e.target.value })}
            >
              <option value="morning">Morning (10 AM - 1 PM)</option>
              <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
              <option value="evening">Evening (4 PM - 7 PM)</option>
            </select>
            <div className="form-hint mt-sm">Note: Exact time depends on executive availability in your area.</div>
          </div>
        </div>

        <div className="step-nav">
          <button type="button" className="btn btn-secondary" onClick={prevStep}>
            <i className="fa-solid fa-arrow-left" /> Back
          </button>
          <button type="submit" className="btn btn-primary">
            Next: Review & Pay <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepSchedule;
