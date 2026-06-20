import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, userProfile, updateProfile, displayName, initials } = useAuth();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await updateProfile({ name, email });
      setMsg('Profile updated successfully!');
    } catch (err) {
      setMsg('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--off-white)', minHeight: 'calc(100vh - var(--navbar-height))' }}>
      
      <div className="profile-hero">
        <div className="profile-avatar-lg">{initials}</div>
        <h2>{displayName}</h2>
        <p>+91 {userProfile?.phone}</p>
      </div>

      <div className="container mt-xl pb-xl" style={{ maxWidth: 600 }}>
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-sm)' }}>
            Personal Information
          </h3>

          <form onSubmit={handleSave}>
            <div className="form-group mb-lg">
              <label className="form-label">Phone Number (Verified)</label>
              <input type="text" className="form-input" value={`+91 ${userProfile?.phone}`} disabled style={{ background: 'var(--light-gray)', color: 'var(--text-gray)' }} />
            </div>

            <div className="form-group mb-lg">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
            </div>

            <div className="form-group mb-xl">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
            </div>

            {msg && (
              <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'} mb-md`}>
                {msg}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Profile;
