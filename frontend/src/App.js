import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import JobBrowse from './pages/JobBrowse';
import JobDetails from './pages/JobDetails';
import LearnerDashboard from './pages/Learner/LearnerDashboard';
import LearnerProfile from './pages/Learner/LearnerProfile';
import MyApplications from './pages/Learner/MyApplications';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import PostJob from './pages/Employer/PostJob';
import MyJobs from './pages/Employer/MyJobs';
import Subscription from './pages/Employer/Subscription';
import AdminDashboard from './pages/Admin/AdminDashboard';

import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<JobBrowse />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          
          {/* Learner Routes */}
          <Route
            path="/learner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <LearnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/profile"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <LearnerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/applications"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          
          {/* Employer Routes */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/my-jobs"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <MyJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/subscription"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <Subscription />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
