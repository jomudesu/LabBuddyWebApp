import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAuth } from '../../backend/Firebase/AuthContext';

const WelcomeCard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const displayName = currentUser?.displayName || 
                     currentUser?.email?.split('@')[0] || 
                     'Guest';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    // Card now subtly lifts and casts a deep shadow on hover
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group/card">
      <div className="flex justify-between items-center p-6">
        
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-sm shadow-inner group-hover/card:bg-white/30 transition-colors duration-500">
            <span className="text-white font-bold text-xl">{firstLetter}</span>
          </div>
          <div>
            <p className="text-blue-100 text-base font-medium">Welcome back,</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">{displayName}</h2>
          </div>
        </div>

        {/* ✨ "Let's Begin" Button now has a stunning glowing pulse & lift effect ✨ */}
        <button 
          onClick={() => navigate('/experiments')}
          className="group bg-white text-blue-700 px-7 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 whitespace-nowrap active:scale-95"
        >
          <Play size={20} className="transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5 fill-blue-700" />
          Let's Begin
        </button>
      </div>

      <div className="bg-black/10 px-6 py-3 border-t border-white/10">
        <p className="text-blue-100 text-sm flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span>
          Ready for today's experiment?
        </p>
      </div>
    </div>
  );
};

export default WelcomeCard;