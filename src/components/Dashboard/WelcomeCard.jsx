import React from 'react';
import { User, Play } from 'lucide-react';
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
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl">{firstLetter}</span>
            )}
          </div>
          <div className="ml-4">
            <p className="text-blue-200 text-sm">Welcome back,</p>
            <h2 className="text-3xl font-bold">{displayName}</h2>
          </div>
        </div>
        <button className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold flex items-center hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <Play size={20} className="mr-2" />
          Let's Begin
        </button>
      </div>
      <p className="text-blue-200 mt-4 flex items-center">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
        Ready for today's experiment?
      </p>
    </div>
  );
};

export default WelcomeCard;