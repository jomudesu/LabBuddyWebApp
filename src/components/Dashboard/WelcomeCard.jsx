import React from 'react';
import { Play } from 'lucide-react';
import { useAuth } from '../../backend/Firebase/AuthContext';

const WelcomeCard = () => {
  const { currentUser } = useAuth();
  
  // Get display name from Firebase user
  const displayName = currentUser?.displayName || 
                     currentUser?.email?.split('@')[0] || 
                     'Guest';
  
  // Get first letter for avatar fallback
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Main row - User info on left, button on right */}
      <div className="flex justify-between items-center p-6">
        {/* Left side - User Info */}
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-xl">{firstLetter}</span>
          </div>
          <div>
            <p className="text-blue-100 text-base">Welcome back,</p>
            <h2 className="text-2xl font-bold text-white">{displayName}</h2>
          </div>
        </div>

        {/* Right side - Button */}
        <button className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-lg hover:shadow-xl whitespace-nowrap">
          <Play size={18} />
          Let's Begin
        </button>
      </div>

      {/* Bottom status bar */}
      <div className="bg-white/5 px-6 py-3">
        <p className="text-blue-100 text-sm flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Ready for today's experiment?
        </p>
      </div>
    </div>
  );
};

export default WelcomeCard;