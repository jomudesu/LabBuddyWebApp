import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, FlaskRound as Flask, Atom, Shield, ChevronRight, 
  ChevronDown, ChevronUp, BookOpen, AlertCircle, Sparkles,
  Microscope, TestTube, Brain, Wrench, ArrowLeft, ShieldCheck, Check,
  CheckCircle // ✨ NEW: Import CheckCircle for the success box
} from 'lucide-react';
import { useAuth } from '../backend/Firebase/AuthContext';
import { supabase } from '../backend/Firebase/firebase';

const Landing = () => {
  const { login, resetPassword, error: authError, platformSettings } = useAuth();
  
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState(''); 
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  const [showDPAModal, setShowDPAModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const [shouldScroll, setShouldScroll] = useState(false);
  const bannerContainerRef = useRef(null);
  const bannerTextRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const isMaintenanceMode = platformSettings?.maintenanceMode === true && platformSettings?.announcementBanner?.length > 0;

  useEffect(() => {
    const checkWidth = () => {
      if (isMaintenanceMode && bannerContainerRef.current && bannerTextRef.current) {
        const containerWidth = bannerContainerRef.current.offsetWidth;
        const textWidth = bannerTextRef.current.scrollWidth;
        setShouldScroll(textWidth > containerWidth);
      }
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [isMaintenanceMode, platformSettings?.announcementBanner]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const bottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
        setIsAtBottom(bottom);
      }
    };
    const container = scrollContainerRef.current;
    if (container) { container.addEventListener('scroll', handleScroll); handleScroll(); }
    return () => { if (container) container.removeEventListener('scroll', handleScroll); };
  }, []);

  const resetMessages = () => {
    setLocalError('');
    setSuccessMessage('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setSuccessMessage('Password reset link sent! Please check your inbox.');
      setResetEmail('');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const routeUser = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'instructor') navigate('/instructor/dashboard');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await login(email, password);
      const { userData } = response;
      
      if (userData.role !== 'admin' && !userData.has_accepted_dpa) {
        setPendingUser(userData);
        setShowDPAModal(true);
        setLoading(false);
      } else {
        routeUser(userData.role);
      }
    } catch (err) {
      // ✨ NEW: Catch the forced reset flag and show it as a success/info box instead of an error!
      if (err.message.startsWith("FIRST_LOGIN_RESET:")) {
        setSuccessMessage(err.message.replace("FIRST_LOGIN_RESET:", "").trim());
        setLocalError('');
      } else {
        setLocalError(err.message || 'An unexpected error occurred.');
        setSuccessMessage('');
      }
      setLoading(false);
    }
  };

  const handleAcceptDPA = async () => {
    if (!pendingUser) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({ has_accepted_dpa: true }).eq('id', pendingUser.id);
      if (error) throw error;
      setShowDPAModal(false);
      routeUser(pendingUser.role);
    } catch (error) {
      setLocalError("Failed to update agreement status. Please try again.");
      setLoading(false);
    }
  };

  const smoothScrollTo = (element, targetPosition, duration = 1000) => {
    const startPosition = element.scrollTop;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const animation = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      element.scrollTop = startPosition + distance * easeProgress;
      if (progress < 1) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
  };

  const handleScrollClick = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      if (isAtBottom) smoothScrollTo(container, 0, 1000);
      else smoothScrollTo(container, container.scrollHeight, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen relative bg-slate-900">
      
      <style>{`
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-scroll 25s linear infinite;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {isMaintenanceMode && (
        <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-3 px-6 flex items-center shadow-lg z-50">
          <div className="flex items-center gap-3 mr-4">
             <div className="bg-white/20 p-1.5 rounded-full"><Wrench size={16} /></div>
             <span className="font-bold text-xs uppercase tracking-widest opacity-95">Maintenance Notice</span>
          </div>
          <div className="h-6 w-px bg-white/30 mr-6" />
          <div ref={bannerContainerRef} className="flex-1 overflow-hidden whitespace-nowrap flex items-center relative">
            <div 
              ref={bannerTextRef} 
              className={`font-bold text-sm ${shouldScroll ? 'animate-marquee' : 'w-full text-center'}`}
            >
              {platformSettings.announcementBanner}
            </div>
          </div>
        </div>
      )}

      {showDPAModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <ShieldCheck className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">Data Privacy Agreement</h2>
            <p className="text-slate-500 text-sm text-center mb-6">Republic Act No. 10173 (Data Privacy Act of 2012)</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 mb-6 h-48 overflow-y-auto leading-relaxed text-justify">
              By accessing the Lab Buddy platform, you explicitly consent to the collection, processing, and storage of your personal information (including Name, Email, Class Section, and System Activity) by the institution for academic and administrative purposes. 
              <br/><br/>
              Your simulation telemetry, grades, and interaction data will be logged to evaluate academic performance and system reliability. This data will be maintained securely and will not be shared with external third parties without your explicit consent, except as required by law.
              <br/><br/>
              By clicking "I Agree", you acknowledge that you have read and understood these terms and agree to be bound by our data processing protocols.
            </div>

            <button 
              onClick={handleAcceptDPA}
              disabled={loading}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
            >
              {loading ? 'Processing...' : <><Check size={20} className="mr-2"/> I Agree to the Terms</>}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        <div ref={scrollContainerRef} className="w-3/5 overflow-y-auto scrollbar-hide relative">
          <div className="relative text-white p-12 overflow-hidden min-h-full flex items-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 animate-pulse"><Beaker size={60} className="text-white" /></div>
              <div className="absolute bottom-10 left-10 animate-bounce"><Atom size={60} className="text-white" /></div>
              <div className="absolute top-20 right-20 animate-spin-slow"><Microscope size={40} className="text-white" /></div>
            </div>
            <div className="absolute inset-0">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-30 animate-float"
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 5}s` }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-center mb-8 cursor-pointer group">
                <Beaker size={40} className="mr-3 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                <h1 className="text-4xl font-bold text-white group-hover:scale-105 transition-transform">Lab Buddy</h1>
                <Sparkles className="ml-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
              </div>
              <h2 className="text-5xl font-bold text-white mb-4 leading-tight animate-fade-in-up">Virtual Chemistry<br />Laboratory</h2>
              <p className="text-xl text-blue-100 max-w-2xl mb-8 animate-fade-in-up animation-delay-200">
                Experience immersive science learning with interactive experiments, virtual lab equipment, and real-time simulations.
              </p>
            </div>
          </div>
          
          <div className="p-12 pt-0">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center"><Sparkles className="mr-2 text-yellow-300" size={28} />Why Choose Lab Buddy?</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Flask, title: 'Interactive Experiments', desc: 'Hands-on virtual lab experience with real-time reactions' },
                { icon: Atom, title: 'Periodic Table', desc: 'Interactive element explorer with detailed properties' },
                { icon: Shield, title: 'Safety First', desc: 'Learn proper lab safety protocols and procedures' },
                { icon: BookOpen, title: 'Rich Library', desc: 'Access study materials, guides, and video tutorials' },
                { icon: TestTube, title: 'Virtual Lab', desc: 'Simulate experiments without risk or cost' },
                { icon: Brain, title: 'Smart Learning', desc: 'Adaptive quizzes and personalized recommendations' }
              ].map((item, index) => (
                <div key={index} className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-white/20 hover:border-white/40">
                  <div className="bg-white/20 p-3 rounded-lg w-fit mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"><item.icon className="text-white" size={32} /></div>
                  <h4 className="font-semibold text-white group-hover:text-yellow-300 transition-colors">{item.title}</h4>
                  <p className="text-blue-100 text-sm mt-2">{item.desc}</p>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-white mt-12 mb-6 flex items-center"><Microscope className="mr-2 text-yellow-300" size={28} />What You'll Experience</h3>
            <div className="space-y-4">
              {[
                { icon: Flask, title: 'Acid-Base Titration', desc: 'Learn about pH indicators and neutralization reactions' },
                { icon: Atom, title: 'Periodic Table Explorer', desc: 'Interactive element details with properties and uses' },
                { icon: Shield, title: 'Safety Simulation', desc: 'Practice lab safety in a risk-free environment' }
              ].map((item, index) => (
                <div key={index} className="group flex items-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 hover:border-yellow-300/50 cursor-pointer transform hover:scale-[1.02]">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4 group-hover:rotate-6 transition-transform"><item.icon className="text-white group-hover:scale-110 transition-transform" size={28} /></div>
                  <div className="flex-1"><h4 className="font-semibold text-white group-hover:text-yellow-300 transition-colors">{item.title}</h4><p className="text-blue-100 text-sm">{item.desc}</p></div>
                  <ChevronRight className="text-blue-200 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-8 flex justify-end pr-8 pointer-events-none z-20">
            <div onClick={handleScrollClick} className="group bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/30 hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer pointer-events-auto animate-bounce-slow">
              {isAtBottom ? <ChevronUp className="text-white group-hover:-translate-y-1 transition-transform duration-300" size={24} /> : <ChevronDown className="text-white group-hover:translate-y-1 transition-transform duration-300" size={24} />}
            </div>
          </div>
        </div>

        <div className="w-2/5 flex items-center justify-center p-8 relative bg-white">
          <div className="w-full max-w-sm flex flex-col">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sign In</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Please enter your institutional credentials to access your laboratory modules.</p>
            </div>

            {(localError || authError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start text-red-700 animate-shake shadow-sm">
                <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5 text-red-500" />
                <span className="text-sm font-medium">{localError || authError}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start text-emerald-800 animate-fade-in-up shadow-sm">
                <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5 text-emerald-600" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}

            {isForgotPassword ? (
              <div className="animate-fade-in flex flex-col">
                <button onClick={() => { setIsForgotPassword(false); resetMessages(); }} className="flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 w-fit">
                  <ArrowLeft size={16} className="mr-1" /> Back to Login
                </button>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Reset Password</h3>
                <p className="text-sm text-slate-500 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700" placeholder="name@earist.edu" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50">
                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700" placeholder="name@earist.edu" />
                  </div>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700" placeholder="••••••••" />                  
                    <div className="flex justify-start mt-2">
                      <button type="button" onClick={() => { setIsForgotPassword(true); resetMessages(); }} className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors focus:outline-none">
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                    {loading ? 'Authenticating...' : 'Secure Login'}
                  </button>
                </form>
                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    Need an account? <br/>
                    <span className="text-slate-600 font-bold mt-1 block">Please contact your System Administrator to request platform access.</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;