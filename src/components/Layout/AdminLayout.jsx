import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => (
  // The dark slate background sets the neutral simulation theme
  <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
    <AdminSidebar />
    <div className="flex-1 overflow-auto scrollbar-hide">
      {children}
    </div>
  </div>
);

export default AdminLayout;