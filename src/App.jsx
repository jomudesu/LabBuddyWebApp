import React from 'react';
import Sidebar from './components/Layout/Sidebar';
import WelcomeCard from './components/Dashboard/WelcomeCard';
import ActivityCards from './components/Dashboard/ActivityCards';
import QuickLinks from './components/Dashboard/QuickLinks';

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Welcome Section */}
          <WelcomeCard />
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Column - Activities */}
            <div className="lg:col-span-2">
              <ActivityCards />
            </div>
            
            {/* Right Column - Quick Links */}
            <div className="lg:col-span-1">
              <QuickLinks />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;