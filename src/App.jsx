import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './backend/Firebase/AuthContext';
import { ProgressProvider } from './backend/Firebase/useProgress'; 
import { Bell } from 'lucide-react'; 

// Layouts
import Sidebar from './components/Layout/Sidebar';
import AdminLayout from './components/Layout/AdminLayout';
import InstructorLayout from './components/Layout/InstructorLayout';

// Student Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Experiments from './pages/Experiments';
import Library from './pages/Library';
import ExperimentPage from './pages/ExperimentPage';
import Inventory from './pages/Inventory';
import SafetyGuide from './components/Tools/SafetyGuide';
import PeriodicTable from './components/Tools/PeriodicTable';
import ResourceViewer from './pages/ResourceViewer';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageAccounts from './pages/Admin/ManageAccounts';
import ManageExperiments from './pages/Admin/ManageExperiments';
import GlobalInventory from './pages/Admin/GlobalInventory';
import ReportPrinting from './pages/Admin/ReportPrinting';
import SystemSettings from './pages/Admin/SystemSettings';

// Instructor Pages
import InstructorDashboard from './Pages/Instructor/InstructorDashboard';
import InstructorStudents from './Pages/Instructor/InstructorStudents';
import InstructorExperiments from './Pages/Instructor/InstructorExperiments';
import InstructorAnalytics from './Pages/Instructor/InstructorAnalytics';

// ─── ROUTE PROTECTORS ───

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/" />;
  
  // Catch both admin roles and route them correctly
  if (['admin', 'super_admin'].includes(currentUser.role)) return <Navigate to="/admin/dashboard" replace />;
  if (currentUser.role ===  'instructor') return <Navigate to="/instructor/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/" />;
  
  // Allow both admins and super admins into this layout
  if (!['admin', 'super_admin'].includes(currentUser.role)) return <Navigate to="/dashboard" />; 
  return children;
};

const InstructorRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/" />;
  if (currentUser.role !== 'instructor') {
    return <Navigate to={['admin', 'super_admin'].includes(currentUser.role) ? '/admin/dashboard' : '/dashboard'} />;
  }
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

const AuthenticatedLayout = ({ children }) => {
  const { platformSettings } = useAuth();
  
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Ensure banner only shows if maintenance mode is actually active */}
        {platformSettings?.maintenanceMode && platformSettings?.announcementBanner && (
          <div className="bg-blue-600 text-white px-6 py-3 flex items-center justify-center shrink-0 shadow-md z-20 animate-fade-in-up">
            <Bell size={16} className="mr-2 text-blue-200 shrink-0" />
            <p className="text-sm font-medium tracking-wide text-center">
              {platformSettings.announcementBanner}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><AuthenticatedLayout><Dashboard /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/experiments" element={<ProtectedRoute><AuthenticatedLayout><Experiments /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><AuthenticatedLayout><Library /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/experiment/:id" element={<ProtectedRoute><ExperimentPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><AuthenticatedLayout><Inventory /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/safety-guide" element={<ProtectedRoute><AuthenticatedLayout><SafetyGuide /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/periodic-table" element={<ProtectedRoute><PeriodicTable /></ProtectedRoute>} />
      <Route path="/library/view/:id" element={<ProtectedRoute><AuthenticatedLayout><ResourceViewer /></AuthenticatedLayout></ProtectedRoute>} />
      
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/accounts" element={<AdminRoute><AdminLayout><ManageAccounts /></AdminLayout></AdminRoute>} />
      <Route path="/admin/experiments" element={<AdminRoute><AdminLayout><ManageExperiments /></AdminLayout></AdminRoute>} />
      <Route path="/admin/inventory" element={<AdminRoute><AdminLayout><GlobalInventory /></AdminLayout></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminLayout><ReportPrinting /></AdminLayout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminLayout><SystemSettings /></AdminLayout></AdminRoute>} />
      
      <Route path="/instructor/dashboard" element={<InstructorRoute><InstructorLayout><InstructorDashboard /></InstructorLayout></InstructorRoute>} />
      <Route path="/instructor/students" element={<InstructorRoute><InstructorLayout><InstructorStudents /></InstructorLayout></InstructorRoute>} />
      <Route path="/instructor/experiments" element={<InstructorRoute><InstructorLayout><InstructorExperiments /></InstructorLayout></InstructorRoute>} />
      <Route path="/instructor/analytics" element={<InstructorRoute><InstructorLayout><InstructorAnalytics /></InstructorLayout></InstructorRoute>} />
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