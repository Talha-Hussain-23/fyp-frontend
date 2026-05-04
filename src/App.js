
import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ConfirmProvider } from './context/ConfirmContext';
import { NotificationProvider } from './context/NotificationContext';

// Lazy load components
const Login = lazy(() => import('./components/auth/Login'));
const Signup = lazy(() => import('./components/auth/Signup'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const UserDashboard = lazy(() => import('./components/user/UserDashboard'));
const Interview = lazy(() => import('./components/interview/Interview'));
const InterviewReclaim = lazy(() => import('./components/recruiter/InterviewReclaim'));
const ResumeUpload = lazy(() => import('./components/user/ResumeUpload'));
const JobPortal = lazy(() => import('./components/jobs/JobPortal'));
const LandingPage = lazy(() => import('./components/landing/LandingPage'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));
const UserSettings = lazy(() => import('./components/user/UserSettings'));
const NotificationPreferences = lazy(() => import('./components/settings/NotificationPreferences'));

// Protected Route Component (v6 style)
const ProtectedRoute = ({ children, token }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Check (redirect if already logged in)
const PublicRoute = ({ children, token }) => {
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Update token when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // ✅ FIXED: Only set up once, no polling needed

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <NotificationProvider>
      <ConfirmProvider>
        <Toaster position="top-right" richColors theme="light" style={{ zIndex: 99999 }} />
        <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/login" element={
                <PublicRoute token={token}>
                  <Login setToken={setToken} />
                </PublicRoute>
              } />
              
              <Route path="/signup" element={
                <PublicRoute token={token}>
                  <Signup setToken={setToken} />
                </PublicRoute>
              } />
              
              <Route path="/forgot-password" element={
                <PublicRoute token={token}>
                  <ForgotPassword />
                </PublicRoute>
              } />
              
              <Route path="/reset-password/:token" element={
                <PublicRoute token={token}>
                  <ResetPassword />
                </PublicRoute>
              } />
              
              <Route path="/verify-email/:token" element={<VerifyEmail />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute token={token}>
                  <Dashboard onLogout={handleLogout} />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute token={token}>
                  <UserProfile />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute token={token}>
                  <UserSettings />
                </ProtectedRoute>
              } />

              <Route path="/settings/notifications" element={
                <ProtectedRoute token={token}>
                  <NotificationPreferences />
                </ProtectedRoute>
              } />
              
              {/* Job Routes */}
              <Route path="/jobs/:jobId" element={<JobPortal />} />
              <Route path="/jobs" element={<JobPortal />} />
              <Route path="/job-board" element={<UserDashboard />} />
              
              {/* Feature Routes */}
              <Route path="/interview" element={<Interview />} />
              <Route path="/interview-reclaim" element={<InterviewReclaim />} />
              <Route path="/upload" element={<ResumeUpload />} />
              
              {/* Catch all - 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
              
            </Routes>
          </Suspense>
        </ErrorBoundary>
        </Router>
      </ConfirmProvider>
    </NotificationProvider>
  );
}

export default App;