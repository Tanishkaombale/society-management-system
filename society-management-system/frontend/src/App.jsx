import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Loader from './components/Loader';

import Home from './pages/marketing/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Overview from './pages/shared/Overview';
import Notices from './pages/shared/Notices';
import Complaints from './pages/shared/Complaints';
import Visitors from './pages/shared/Visitors';
import Payments from './pages/shared/Payments';
import Amenities from './pages/shared/Amenities';
import Profile from './pages/shared/Profile';
import Residents from './pages/admin/Residents';
import Flats from './pages/admin/Flats';

function AppGate({ children }) {
  const { loading } = useAuth();
  if (loading) return <Loader full />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppGate><Home /></AppGate>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="notices" element={<Notices />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="payments" element={<Payments />} />
        <Route path="amenities" element={<Amenities />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="residents"
          element={
            <ProtectedRoute roles={['admin']}>
              <Residents />
            </ProtectedRoute>
          }
        />
        <Route
          path="flats"
          element={
            <ProtectedRoute roles={['admin']}>
              <Flats />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontSize: '14px', borderRadius: '10px' },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
