import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Complaint = () => {
  const { user, userProfile } = useAuth();
  const [form, setForm] = useState({
    type: 'delivery_delay',
    awb: '',
    subject: '',
    description: '',
    contactPhone: userProfile?.phone || '',
    contactEmail: userProfile?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const complaintTypes = [
    { value: 'delivery_delay', label: 'Delivery Delay' },
    { value: 'damaged_parcel', label: 'Damaged Parcel' },
    { value: 'lost_shipment', label: 'Lost Shipment' },
    { value: 'wrong_delivery', label: 'Wrong Delivery' },
    { value: 'billing_issue', label: 'Billing / Payment Issue' },
    { value: 'staff_behaviour', label: 'Staff Behaviour' },
    { value: 'pickup_issue', label: 'Pickup Not Done' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'complaints'), {
        ...form,
        userId: user?.uid || 'guest',
        userName: userProfile?.name || 'Guest',
        status: 'open',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--navbar-height))', background: 'var(--off-white)', padding: 'var(--space-2xl) 0' }}>
        <div className="card" style={{ width: '100%', maxWidth: 520, padding: 'var(--space-3xl)', margin: 'var(--space-md)', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, margin: '0 auto var(--space-lg)', background: 'var(--success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--success)' }}>
            <i className="fa-solid fa-check" />
          </div>
          <h2 style={{ marginBottom: 'var(--space-sm)' }}>Complaint Registered</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: 'var(--space-xl)', lineHeight: 1.7 }}>
            Your complaint has been successfully submitted. Our team will review it and get back to you within <strong>24-48 hours</strong>.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ type: 'delivery_delay', awb: '', subject: '', description: '', contactPhone: userProfile?.phone || '', contactEmail: userProfile?.email || '' }); }}>
              Submit Another
            </button>
            <a href="/" className="btn btn-secondary">Go Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--off-white)', minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container" style={{ padding: 'var(--space-3xl) var(--container-px)', maxWidth: 680 }}>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto var(--space-md)', background: 'var(--primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.5rem' }}>
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-xs)' }}>File a Complaint</h1>
          <p style={{ color: 'var(--text-gray)' }}>We take your concerns seriously. Fill in the details below and our team will resolve it promptly.</p>
        </div>

        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <form onSubmit={handleSubmit}>
            {/* Complaint Type */}
            <div className="form-group mb-lg">
              <label className="form-label" htmlFor="type">Complaint Type</label>
              <select id="type" name="type" className="form-input" value={form.type} onChange={handleChange}>
                {complaintTypes.map(ct => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>

            {/* AWB / Tracking ID */}
            <div className="form-group mb-lg">
              <label className="form-label" htmlFor="awb">AWB / Tracking ID <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></label>
              <input id="awb" name="awb" type="text" className="form-input" placeholder="Enter your AWB or Tracking ID if applicable" value={form.awb} onChange={handleChange} />
            </div>

            {/* Subject */}
            <div className="form-group mb-lg">
              <label className="form-label" htmlFor="subject">Subject</label>
              <input id="subject" name="subject" type="text" className="form-input" placeholder="Brief summary of your issue" value={form.subject} onChange={handleChange} required />
            </div>

            {/* Description */}
            <div className="form-group mb-lg">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea id="description" name="description" className="form-input" rows={5} placeholder="Describe your issue in detail..." value={form.description} onChange={handleChange} required style={{ resize: 'vertical', minHeight: 120 }} />
            </div>

            {/* Contact Info Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }} className="booking-layout">
              <div className="form-group mb-lg">
                <label className="form-label" htmlFor="contactPhone">Contact Phone</label>
                <input id="contactPhone" name="contactPhone" type="tel" className="form-input" placeholder="Your phone number" value={form.contactPhone} onChange={handleChange} />
              </div>
              <div className="form-group mb-lg">
                <label className="form-label" htmlFor="contactEmail">Contact Email</label>
                <input id="contactEmail" name="contactEmail" type="email" className="form-input" placeholder="Your email address" value={form.contactEmail} onChange={handleChange} />
              </div>
            </div>

            {error && (
              <div className="alert alert-error mb-lg" style={{ padding: '10px 14px' }}>
                <i className="fa-solid fa-circle-exclamation" /> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting...</>
              ) : (
                <><i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} /> Submit Complaint</>
              )}
            </button>
          </form>
        </div>

        {/* Contact Alternate */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: 'var(--space-sm)' }}>
            Need urgent help? Reach us directly:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
            <a href="tel:+918306396840" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9375rem' }}>
              <i className="fa-solid fa-phone" style={{ color: 'var(--primary)' }} /> +91 83063 96840
            </a>
            <a href="https://wa.me/918306396840" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9375rem' }}>
              <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaint;
