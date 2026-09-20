import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/Guards';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import RoomTypes from './pages/RoomTypes';
import Bookings from './pages/Bookings';
import CheckIn from './pages/CheckIn';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Staff from './pages/Staff';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout pageTitle="Dashboard Overview">
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <AppLayout pageTitle="Room Management">
                  <Rooms />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/room-types"
            element={
              <ProtectedRoute roles={['admin', 'manager', 'receptionist']}>
                <AppLayout pageTitle="Room Categories & Pricing">
                  <RoomTypes />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <AppLayout pageTitle="Guest Reservations">
                  <Bookings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/check-in"
            element={
              <ProtectedRoute>
                <AppLayout pageTitle="Front Desk Check-In / Check-Out">
                  <CheckIn />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <AppLayout pageTitle="Billing & Invoicing">
                  <Billing />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['admin', 'manager']}>
                <AppLayout pageTitle="Analytics & Reports">
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppLayout pageTitle="Staff & User Management">
                  <Staff />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
