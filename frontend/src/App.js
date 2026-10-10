import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComplaintRaise from './pages/Complaints/ComplaintRaise';
import ComplaintList from './pages/Complaints/ComplaintList';
import ComplaintDetail from './pages/Complaints/ComplaintDetail';
import TechnicianQueue from './pages/TechnicianQueue';
import MasterManagement from './pages/Masters/MasterManagement';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { NotFound, AccessDenied } from './components/ErrorPages';

// Protected Route wrapper
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { token, loading, isAdmin } = useContext(AuthContext);

  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <AccessDenied />;

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="complaints/raise" element={<ComplaintRaise />} />
        <Route path="complaints/my" element={<ComplaintList />} />
        <Route path="complaints" element={<ComplaintList />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="work-queue" element={<TechnicianQueue />} />

        {/* Admin Master Data Routes */}
        <Route
          path="masters/:type"
          element={
            <ProtectedRoute requireAdmin>
              <MasterManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute requireAdmin>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
