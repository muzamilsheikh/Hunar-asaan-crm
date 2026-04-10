import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Expenses from './pages/Expenses';
import Batches from './pages/Batches';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import LiveClass from './pages/LiveClass';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Users from './pages/Users';
import StudentDashboard from './pages/StudentDashboard';

// Component to decide which dashboard to show based on user role
const DashboardOrStudent = () => {
  const { user } = useApp();
  return user?.role === 'Student' ? <StudentDashboard /> : <Dashboard />;
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, user } = useApp();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Separate component for login page to avoid hooks in AppContent
const LoginWithRedirect = () => {
  const { token } = useApp();
  return token ? <Navigate to="/" replace /> : <Login />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginWithRedirect />} />

        <Route path="/" element={
          <ProtectedRoute>
            <DashboardOrStudent />
          </ProtectedRoute>
        } />

        <Route path="/students" element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Users />
          </ProtectedRoute>
        } />

        <Route path="/batches" element={
          <ProtectedRoute>
            <Batches />
          </ProtectedRoute>
        } />

        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Courses />
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Expenses />
          </ProtectedRoute>
        } />

        <Route path="/roles" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Roles />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/live-class" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Student']}>
            <LiveClass />
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Student']}>
            <Chat />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <Reports />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          success: {
            style: {
              background: '#10B981',
              color: '#fff'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981'
            }
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444'
            }
          }
        }}
      />
      <AppContent />
    </AppProvider>
  );
}

export default App;
