import React from 'react';
import WelcomeCard from '../components/Dashboard/WelcomeCard';
import ActivityCards from '../components/Dashboard/ActivityCards';
import QuickLinks from '../components/Dashboard/QuickLinks';
import ProgressCard from '../components/Dashboard/ProgressCard';

const Dashboard = () => {
  return (
    <div className="p-8">
      <WelcomeCard />
      
      <div className="mt-6">
        <ProgressCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <ActivityCards />
        </div>
        <div className="lg:col-span-1">
          <QuickLinks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;