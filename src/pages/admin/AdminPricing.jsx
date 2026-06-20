import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_PRICING = {
  local:    { base: 60,  perKg: 20,  minWeight: 0.5 },
  metro:    { base: 90,  perKg: 30,  minWeight: 0.5 },
  national: { base: 110, perKg: 40,  minWeight: 0.5 },
  insuranceRate: 0.01,
  minInsurance: 50,
  gstRate: 0.18,
  volumetricDivisor: 5000,
  envelopeDiscount: 0.8,
};

const AdminPricing = () => {
  const { initials, displayName } = useAuth();
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'pricing'));
        if (snap.exists()) {
          setPricing({ ...DEFAULT_PRICING, ...snap.data() });
        }
      } catch (err) {
        console.error('Error fetching pricing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const updateZone = (zone, field, value) => {
    setPricing(prev => ({
      ...prev,
      [zone]: { ...prev[zone], [field]: parseFloat(value) || 0 }
    }));
    setSaved(false);
  };

  const updateGlobal = (field, value) => {
    setPricing(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'pricing'), pricing);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving pricing:', err);
      alert('Failed to save pricing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const zoneLabels = {
    local: { name: 'Local (Same State)', icon: 'fa-map-pin', color: '#16A34A' },
    metro: { name: 'Metro-to-Metro', icon: 'fa-city', color: '#2563EB' },
    national: { name: 'National (Rest of India)', icon: 'fa-earth-asia', color: '#DC2626' },
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-topbar">
          <div className="admin-topbar-title">Pricing Settings</div>
        </div>
        <div className="admin-content" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner spinner-red" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-topbar">
        <div className="admin-topbar-title">Pricing Settings</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{displayName}</span>
          <div className="user-avatar" style={{ width: 36, height: 36 }}>{initials}</div>
        </div>
      </div>

      <div className="admin-content">
        {/* Zone Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
          {Object.entries(zoneLabels).map(([zone, info]) => (
            <div className="table-card" key={zone} style={{ marginBottom: 0 }}>
              <div className="table-card-header" style={{ borderBottom: '3px solid ' + info.color }}>
                <h3 className="table-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`fa-solid ${info.icon}`} style={{ color: info.color }} />
                  {info.name}
                </h3>
              </div>
              <div style={{ padding: 'var(--space-lg)' }}>
                <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="form-label">Base Rate (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)', fontWeight: 600 }}>₹</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ paddingLeft: 28 }}
                      value={pricing[zone].base} 
                      onChange={e => updateZone(zone, 'base', e.target.value)} 
                      min="0" step="5"
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Starting price for minimum weight</span>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="form-label">Per Kg Rate (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)', fontWeight: 600 }}>₹</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ paddingLeft: 28 }}
                      value={pricing[zone].perKg} 
                      onChange={e => updateZone(zone, 'perKg', e.target.value)} 
                      min="0" step="5"
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Additional charge per extra kg above min weight</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Weight (kg)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={pricing[zone].minWeight} 
                    onChange={e => updateZone(zone, 'minWeight', e.target.value)} 
                    min="0.1" step="0.1"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Weight included in the base rate</span>
                </div>

                {/* Live Example */}
                <div style={{ 
                  marginTop: 'var(--space-md)', padding: 'var(--space-md)', 
                  background: 'var(--off-white)', borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-gray)', marginBottom: 4 }}>
                    <i className="fa-solid fa-calculator" style={{ marginRight: 4 }} /> LIVE EXAMPLE
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    A <strong>2 kg</strong> box would cost: <strong style={{ color: info.color }}>
                      ₹{Math.ceil((pricing[zone].base + Math.max(0, 2 - pricing[zone].minWeight) * pricing[zone].perKg) * 1.18)}
                    </strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>(incl. GST)</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Settings */}
        <div className="table-card" style={{ marginTop: 'var(--space-lg)' }}>
          <div className="table-card-header">
            <h3 className="table-card-title">
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: 'var(--primary)' }} />
              Global Settings
            </h3>
          </div>
          <div style={{ padding: 'var(--space-lg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Insurance Rate (%)</label>
              <input 
                type="number" 
                className="form-input" 
                value={(pricing.insuranceRate * 100)} 
                onChange={e => updateGlobal('insuranceRate', parseFloat(e.target.value) / 100)} 
                min="0" max="100" step="0.1"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>% of declared value</span>
            </div>

            <div className="form-group">
              <label className="form-label">Min. Insurance (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={pricing.minInsurance} 
                onChange={e => updateGlobal('minInsurance', e.target.value)} 
                min="0" step="10"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Minimum insurance charge</span>
            </div>

            <div className="form-group">
              <label className="form-label">GST Rate (%)</label>
              <input 
                type="number" 
                className="form-input" 
                value={(pricing.gstRate * 100)} 
                onChange={e => updateGlobal('gstRate', parseFloat(e.target.value) / 100)} 
                min="0" max="100" step="0.5"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Tax applied on shipping</span>
            </div>

            <div className="form-group">
              <label className="form-label">Volumetric Divisor</label>
              <input 
                type="number" 
                className="form-input" 
                value={pricing.volumetricDivisor} 
                onChange={e => updateGlobal('volumetricDivisor', e.target.value)} 
                min="1000" step="500"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>L×W×H ÷ this = vol. weight</span>
            </div>

            <div className="form-group">
              <label className="form-label">Envelope Discount (%)</label>
              <input 
                type="number" 
                className="form-input" 
                value={Math.round((1 - pricing.envelopeDiscount) * 100)} 
                onChange={e => updateGlobal('envelopeDiscount', 1 - (parseFloat(e.target.value) / 100))} 
                min="0" max="50" step="5"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Discount for document/envelope shipments</span>
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div style={{ 
          position: 'sticky', bottom: 0, 
          padding: 'var(--space-lg)', 
          background: 'var(--white)', 
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-md)',
          marginTop: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
        }}>
          {saved && (
            <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fa-solid fa-circle-check" /> Pricing saved successfully!
            </span>
          )}
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleSave} 
            disabled={saving}
            style={{ minWidth: 180 }}
          >
            {saving ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</>
            ) : (
              <><i className="fa-solid fa-floppy-disk" /> Save Pricing</>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
