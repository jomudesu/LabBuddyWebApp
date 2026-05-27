import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './backend/Firebase/AuthContext';
import { ProgressProvider } from './backend/Firebase/useProgress'; 
import Sidebar from './components/Layout/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Experiments from './pages/Experiments';
import Library from './pages/Library';
import ExperimentPage from './pages/ExperimentPage';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/" />;
};

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  </div>
);

// ProtectedRoute and AuthenticatedLayout components
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><AuthenticatedLayout><Dashboard /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/experiments" element={<ProtectedRoute><AuthenticatedLayout><Experiments /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><AuthenticatedLayout><Library /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/experiment/:id" element={<ProtectedRoute><ExperimentPage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* 2. WRAP YOUR APP WITH THE PROVIDER */}
        <ProgressProvider>
          <AppRoutes />
        </ProgressProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;