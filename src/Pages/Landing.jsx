import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, FlaskRound as Flask, Atom, Shield, ChevronRight, 
  ChevronDown, ChevronUp, BookOpen, AlertCircle, Sparkles,
  Microscope, TestTube, Brain, CheckCircle, Wrench, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../backend/Firebase/AuthContext';

const Landing = () => {
  const { login, register, resetPassword, error: authError, platformSettings } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('student');
  const [section, setSection] = useState('');
  const [resetEmail, setResetEmail] = useState(''); 
  
  // UI State
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (platformSettings && !platformSettings.allowRegistrations) {
      setIsLogin(true);
    }
  }, [platformSettings]);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await login(email, password);
        const userRole = response?.role || 'student'; 
        
        if (userRole === 'admin') navigate('/admin/dashboard');
        else if (userRole === 'instructor') navigate('/instructor/dashboard');
        else navigate('/dashboard');
        
      } else {
        // Registration Validation
        if (password !== confirmPassword) { setLocalError("Passwords don't match"); setLoading(false); return; }
        if (password.length < 6) { setLocalError('Password must be at least 6 characters'); setLoading(false); return; }
        if (role === 'student' && !section.trim()) { setLocalError('Class Section is required for students'); setLoading(false); return; }

        const finalSection = role === 'student' ? section.trim().toUpperCase() : '-';
        
        // Execute Shielded Registration
        const response = await register(email, password, displayName, role, finalSection);

        if (response && response.status === 'pending') {
          const msg = role === 'instructor'
            ? 'Instructor account created! Please wait for an Admin to approve your account.'
            : `Student account created! Please wait for an Admin to verify your Class Section (${finalSection}).`;
            
          setSuccessMessage(msg);
          setIsLogin(true); 
          setEmail(''); setPassword(''); setConfirmPassword(''); setDisplayName(''); setSection('');
        }
      }
    } catch (err) {
      // Using localError to show specifically trapped issues
      setLocalError(err.message || 'An unexpected error occurred.');
    } finally {
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

  const registrationsOpen = platformSettings?.allowRegistrations ?? true;
  const isMaintenanceMode = platformSettings?.maintenanceMode ?? false;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      
      <style>{`
        .form-scrollbar::-webkit-scrollbar { width: 5px; }
        .form-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .form-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .form-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}</style>

      {/* Left Side - 60% Scrollable Preview */}
      <div 
        ref={scrollContainerRef}
        className="w-3/5 overflow-y-auto bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 scrollbar-hide relative"
      >
        <div className="relative text-white p-12 overflow-hidden min-h-screen flex items-center">
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

      {/* Right Side - 40% Login/Register/Reset */}
      <div className="w-2/5 flex items-center justify-center p-8 relative">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md max-h-[90vh] flex flex-col">
          
          {isMaintenanceMode && (
            <div className="mb-6 bg-amber-100 text-amber-800 p-3 rounded-lg flex items-center shadow-inner border border-amber-200 text-sm font-bold shrink-0">
              <Wrench className="mr-2 shrink-0 text-amber-600" size={18} />
              System Under Maintenance. Only Admins may log in.
            </div>
          )}

          {!isForgotPassword && registrationsOpen && (
            <div className="relative mb-6 shrink-0">
              <div className="absolute inset-0 bg-gray-100 rounded-lg"></div>
              <div className={`absolute top-0 bottom-0 w-1/2 bg-white rounded-lg shadow-md transition-transform duration-300 ease-in-out ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}></div>
              <div className="relative flex">
                <button onClick={() => { setIsLogin(true); resetMessages(); }} className={`flex-1 py-2 text-center font-medium transition-colors duration-300 z-10 ${isLogin ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Login</button>
                <button onClick={() => { setIsLogin(false); resetMessages(); }} className={`flex-1 py-2 text-center font-medium transition-colors duration-300 z-10 ${!isLogin ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Register</button>
              </div>
            </div>
          )}

          {!isForgotPassword && !registrationsOpen && (
            <div className="mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
              <p className="text-sm text-gray-500 mt-1">Registrations are currently closed by the administrator.</p>
            </div>
          )}

          {/* Error Message */}
          {(localError || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700 animate-shake shrink-0">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{localError || authError}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start text-emerald-800 animate-fade-in-up shrink-0">
              <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden form-scrollbar pr-2 -mr-2 pb-2">
            {isForgotPassword ? (
              <div className="animate-fade-in flex flex-col h-full justify-center">
                <button onClick={() => { setIsForgotPassword(false); resetMessages(); }} className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6 w-fit">
                  <ArrowLeft size={16} className="mr-1" /> Back to Login
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
                <p className="text-sm text-gray-500 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" placeholder="name@earist.edu" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            ) : isLogin ? (
              <div className="animate-fade-in">
                {registrationsOpen && <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back!</h2>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" placeholder="name@earist.edu" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <p className="text-center text-sm text-gray-600">
                    <button type="button" onClick={() => { setIsForgotPassword(true); resetMessages(); }} className="text-blue-600 hover:underline transition-colors focus:outline-none">Forgot password?</button>
                  </p>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Role</label>
                    <div className="flex gap-4">
                      <label className="flex-1 relative">
                        <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="peer sr-only" />
                        <div className="p-3 text-center border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-medium transition-all text-sm text-gray-500">Student</div>
                      </label>
                      <label className="flex-1 relative">
                        <input type="radio" name="role" value="instructor" checked={role === 'instructor'} onChange={() => setRole('instructor')} className="peer sr-only" />
                        <div className="p-3 text-center border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:text-purple-700 font-medium transition-all text-sm text-gray-500">Instructor</div>
                      </label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" placeholder="Juan Dela Cruz" />
                  </div>
                  {role === 'student' && (
                    <div className="mb-4 animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class Section</label>
                      <input type="text" required value={section} onChange={(e) => setSection(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 uppercase" placeholder="e.g. BSXX-XX" />
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" placeholder="student@earist.edu" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" placeholder="••••••••" minLength="6" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <p className="text-center text-sm text-gray-600">By signing up, you agree to our <a href="#" className="text-blue-600 hover:underline transition-colors">Terms</a></p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;