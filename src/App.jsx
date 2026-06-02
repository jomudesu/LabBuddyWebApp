import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './backend/Firebase/AuthContext';
import { ProgressProvider } from './backend/Firebase/useProgress'; 

// Layouts
import Sidebar from './components/Layout/Sidebar';
import AdminLayout from './components/Layout/AdminLayout';

// Student Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Experiments from './pages/Experiments';
import Library from './pages/Library';
import ExperimentPage from './pages/ExperimentPage';
import Inventory from './components/Dashboard/Inventory';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageAccounts from './pages/Admin/ManageAccounts';
import ManageExperiments from './pages/Admin/ManageExperiments';

const AdminInventory = () => <div className="p-8 text-2xl font-bold text-slate-200">Global Inventory</div>;
const SystemReports = () => <div className="p-8 text-2xl font-bold text-slate-200">System Reports & Printing</div>;
const AdminSettings = () => <div className="p-8 text-2xl font-bold text-slate-200">System Settings</div>;

// ─── ROUTE PROTECTORS ───

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/" />;
  if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/" />;
  if (currentUser.role !== 'admin') return <Navigate to="/dashboard" />; 
  return children;
};

const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Authenticating...</p>
    </div>
  </div>
);

const AuthenticatedLayout = ({ children }) => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar />
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      {/* ─── STUDENT ROUTES ─── */}
      <Route path="/dashboard" element={<ProtectedRoute><AuthenticatedLayout><Dashboard /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/experiments" element={<ProtectedRoute><AuthenticatedLayout><Experiments /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><AuthenticatedLayout><Library /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/experiment/:id" element={<ProtectedRoute><ExperimentPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><AuthenticatedLayout><Inventory /></AuthenticatedLayout></ProtectedRoute>} />

      {/* ─── ADMIN ROUTES ─── */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/accounts" element={<AdminRoute><AdminLayout><ManageAccounts /></AdminLayout></AdminRoute>} />
      <Route path="/admin/experiments" element={<AdminRoute><AdminLayout><ManageExperiments /></AdminLayout></AdminRoute>} />
      <Route path="/admin/inventory" element={<AdminRoute><AdminLayout><AdminInventory /></AdminLayout></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminLayout><SystemReports /></AdminLayout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
      
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProgressProvider>
          <AppRoutes />
        </ProgressProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;