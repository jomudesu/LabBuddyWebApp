import React from 'react';
import WelcomeCard from '../components/Dashboard/WelcomeCard';
import ActivityCards from '../components/Dashboard/ActivityCards';
import QuickLinks from '../components/Dashboard/QuickLinks';
import ProgressCard from '../components/Dashboard/ProgressCard';

const Dashboard = () => {
  return (
    <div className="bg-slate-100 p-5 md:p-6 flex flex-col h-full max-h-screen overflow-hidden gap-4 md:gap-5">
      
      <div className="flex flex-col gap-4 md:gap-5 flex-shrink-0">
        <WelcomeCard />
        <ProgressCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 flex-1 min-h-0 pb-2">
        <div className="lg:col-span-2 overflow-y-auto pr-2 scrollbar-hide">
          <ActivityCards />
        </div>
        <div className="lg:col-span-1 overflow-y-auto pr-2 scrollbar-hide">
          <QuickLinks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;