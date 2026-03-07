import React from 'react';
import WelcomeCard from '../components/Dashboard/WelcomeCard';
import ActivityCards from '../components/Dashboard/ActivityCards';
import QuickLinks from '../components/Dashboard/QuickLinks';

const Dashboard = () => {
  return (
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
  );
};

export default Dashboard;