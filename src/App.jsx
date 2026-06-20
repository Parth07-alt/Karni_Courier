import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import BookPickup from './pages/BookPickup';
import Payment from './pages/Payment';
import Track from './pages/Track';
import Complaint from './pages/Complaint';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import AdminPricing from './pages/admin/AdminPricing';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes (No Standard Navbar/Footer) */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/staff" element={<AdminRoute><StaffManagement /></AdminRoute>} />
        <Route path="/admin/pricing" element={<AdminRoute><AdminPricing /></AdminRoute>} />
        
        {/* Customer Routes */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/track" element={<Track />} />
              <Route path="/complaint" element={<Complaint />} />
              
              {/* Protected Routes */}
              <Route path="/book" element={<ProtectedRoute><BookPickup /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
