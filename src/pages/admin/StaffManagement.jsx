import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';

const StaffManagement = () => {
  const { initials, displayName } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setUsers(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user to ${newRole}?`)) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert('Error updating user role');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return 'Unknown';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <AdminLayout>
      <div className="admin-topbar">
        <div className="admin-topbar-title">Staff Management</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{displayName}</span>
          <div className="user-avatar" style={{ width: 36, height: 36 }}>{initials}</div>
        </div>
      </div>

      <div className="admin-content">
        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">All Registered Users</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID / Joined Date</th>
                  <th>Phone Number</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4"><div className="spinner spinner-red mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4">No users found.</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{user.uid}</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="fw-600">{user.phone}</td>
                      <td>{user.name || <span className="text-muted">Not provided</span>}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-processing' : 'badge-pending'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="form-select" 
                          style={{ padding: '4px 8px', fontSize: '0.8125rem', width: 120 }}
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StaffManagement;
