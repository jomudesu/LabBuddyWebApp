import React from 'react';
import WelcomeCard from '../components/Dashboard/WelcomeCard';
import ActivityCards from '../components/Dashboard/ActivityCards';
import QuickLinks from '../components/Dashboard/QuickLinks';
import ProgressCard from '../components/Dashboard/ProgressCard';

const Dashboard = () => {
  return (
    // 1. Reduced outer padding to p-5 to reclaim screen edges
    // 2. Added h-full/max-h-screen and flex-col to force it to fit the viewport
    <div className="p-5 md:p-6 flex flex-col h-full max-h-screen overflow-hidden gap-4 md:gap-5">
      
      {/* Top Section: Grouped Welcome and Progress with tighter spacing */}
      <div className="flex flex-col gap-4 md:gap-5 flex-shrink-0">
        <WelcomeCard />
        <ProgressCard />
      </div>

      {/* Bottom Section: Grid takes up the exact remaining vertical space */}
      {/* flex-1 and min-h-0 prevent this grid from pushing the page down */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 flex-1 min-h-0 pb-2">
        
        {/* overflow-y-auto allows internal scrolling ONLY if the cards exceed the remaining space */}
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