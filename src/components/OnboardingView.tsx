import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Mail, Lock, User, BookOpen, Sparkles, 
  ArrowRight, ShieldCheck, Landmark, ShieldAlert, CheckCircle2, ChevronLeft
} from 'lucide-react';

export const BOARD_MEDIUMS: Record<string, string[]> = {
  "CBSE": ["English Medium", "Hindi Medium"],
  "ICSE": ["English Medium"],
  "GSEB": ["English Medium", "Gujarati Medium", "Hindi Medium"],
  "Maharashtra Board": ["English Medium", "Marathi Medium", "Hindi Medium"],
  "UP Board": ["Hindi Medium", "English Medium"],
  "Bihar Board": ["Hindi Medium", "English Medium"],
  "Rajasthan Board": ["Hindi Medium", "English Medium"],
  "MP Board": ["Hindi Medium", "English Medium"],
  "Tamil Nadu Board": ["English Medium", "Tamil Medium"],
  "Karnataka Board": ["English Medium", "Kannada Medium"],
  "Telangana Board": ["English Medium", "Telugu Medium"],
  "Andhra Pradesh Board": ["English Medium", "Telugu Medium"],
  "Punjab Board": ["English Medium", "Punjabi Medium"],
  "Haryana Board": ["Hindi Medium", "English Medium"],
  "West Bengal Board": ["English Medium", "Bengali Medium"]
};

export default function OnboardingView() {
  const { 
    loginWithEmail, signUpWithEmail, signInWithGoogle, loginGuest, passwordReset 
  } = useAuth();

  const [mode, setMode] = useState<'welcome' | 'register' | 'login' | 'forgot' | 'guest_setup'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [grade, setGrade] = useState('10'); // used for grade
  const [board, setBoard] = useState('CBSE');
  const [medium, setMedium] = useState('English Medium');
  const [classLevel, setClassLevel] = useState('10');
  const [school, setSchool] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        if (!fullName || !username) {
          throw new Error('Please fill in your Full Name and Username.');
        }
        await signUpWithEmail(email, password, {
          fullName,
          username,
          grade: classLevel,
          board,
          classLevel,
          medium,
          school,
          avatarUrl
        });
      } else if (mode === 'forgot') {
        if (!email) throw new Error('Please enter your email address.');
        await passwordReset(email);
        setSuccess('Password reset link sent to your email.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120'
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0B0F19] text-white overflow-hidden font-sans relative">
      
      {/* Immersive Background Blur Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md px-6 py-8 relative z-10 flex flex-col min-h-[100dvh] justify-center">
        
        {/* View Mode Header w/ Back Button */}
        {mode !== 'welcome' && (
          <div className="absolute top-8 left-6">
            <button 
              onClick={() => {
                setError('');
                setSuccess('');
                setMode('welcome');
              }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-300" />
            </button>
          </div>
        )}

        <div className={`space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in ${mode !== 'welcome' ? 'mt-12' : ''}`}>
          
          {/* Brand Presentation */}
          <div className="text-center space-y-4">
            {mode === 'welcome' && (
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-[24px] mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3 transform mb-6">
                <GraduationCap className="w-10 h-10 text-white -rotate-3" />
              </div>
            )}
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{textWrap: 'balance'}}>
              {mode === 'welcome' && "Learn completely on your terms."}
              {mode === 'register' && "Create an Account"}
              {mode === 'login' && "Welcome Back"}
              {mode === 'forgot' && "Reset Password"}
              {mode === 'guest_setup' && "Let's Personalize"}
            </h1>
            
            <p className="text-sm text-slate-400 font-medium px-4">
              {mode === 'welcome' && "Join Student Hub for interactive quizzes, AI doubting solving, and smart planners."}
              {mode === 'register' && "Fill out the details below to join the academy."}
              {mode === 'login' && "Sign in to pick up where you left off."}
              {mode === 'forgot' && "Enter your email and we'll send a link to reset your password."}
              {mode === 'guest_setup' && "Tell us a bit about your studies so we can customize your experience."}
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">{success}</span>
            </div>
          )}

          {/* WELCOME SCREEN */}
          {mode === 'welcome' && (
            <div className="space-y-3 pt-6">
              <button 
                onClick={() => setMode('register')}
                className="w-full py-4 px-4 bg-white text-black font-black rounded-full text-[15px] shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
              </button>

              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-4 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-[15px] transition-colors border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
              
              <div className="py-4 text-center">
                 <button 
                    onClick={() => setMode('login')}
                    className="text-white font-extrabold text-[15px] hover:text-indigo-400 transition-colors"
                 >
                    I already have an account
                 </button>
              </div>

              <div className="text-center pt-8">
                 <button
                   onClick={() => setMode('guest_setup')}
                   className="text-[12px] text-slate-500 font-bold uppercase tracking-widest hover:text-slate-300"
                 >
                   Explore as Guest
                 </button>
              </div>
            </div>
          )}

          {/* REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleEmailAction} className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 space-y-4">
                 
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Maya Lin"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors placeholder:text-slate-600"
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Username</label>
                    <input 
                      type="text" 
                      required
                      placeholder="mayalin"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors placeholder:text-slate-600"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Board</label>
                       <select 
                         value={board}
                         onChange={e => {
                           setBoard(e.target.value);
                           setMedium(BOARD_MEDIUMS[e.target.value]?.[0] || 'English Medium');
                         }}
                         className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors text-white appearance-none"
                       >
                         <option className="bg-[#12121a]" value="CBSE">CBSE</option>
                         <option className="bg-[#12121a]" value="ICSE">ICSE</option>
                         <option className="bg-[#12121a]" value="GSEB">GSEB (Gujarat Board)</option>
                         <option className="bg-[#12121a]" value="Maharashtra Board">Maharashtra Board</option>
                         <option className="bg-[#12121a]" value="UP Board">UP Board</option>
                         <option className="bg-[#12121a]" value="Bihar Board">Bihar Board</option>
                         <option className="bg-[#12121a]" value="Rajasthan Board">Rajasthan Board</option>
                         <option className="bg-[#12121a]" value="MP Board">MP Board</option>
                         <option className="bg-[#12121a]" value="Tamil Nadu Board">Tamil Nadu Board</option>
                         <option className="bg-[#12121a]" value="Karnataka Board">Karnataka Board</option>
                         <option className="bg-[#12121a]" value="Telangana Board">Telangana Board</option>
                         <option className="bg-[#12121a]" value="Andhra Pradesh Board">Andhra Pradesh Board</option>
                         <option className="bg-[#12121a]" value="Punjab Board">Punjab Board</option>
                         <option className="bg-[#12121a]" value="Haryana Board">Haryana Board</option>
                         <option className="bg-[#12121a]" value="West Bengal Board">West Bengal Board</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Class</label>
                       <select 
                         value={classLevel}
                         onChange={e => setClassLevel(e.target.value)}
                         className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors text-white appearance-none"
                       >
                         {[...Array(12)].map((_, i) => (
                           <option key={i+1} className="bg-[#12121a]" value={`${i+1}`}>Class {i+1}</option>
                         ))}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Medium</label>
                    <select 
                      value={medium}
                      onChange={e => setMedium(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors text-white appearance-none"
                    >
                      {(BOARD_MEDIUMS[board] || ['English Medium']).map((med) => (
                        <option key={med} className="bg-[#12121a]" value={med}>{med}</option>
                      ))}
                    </select>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Avatar</label>
                    <div className="flex justify-between items-center bg-black/40 border border-white/5 p-2 rounded-2xl">
                      {sampleAvatars.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(av)}
                          className={`w-10 h-10 rounded-full overflow-hidden border-[3px] transition-all ${avatarUrl === av ? 'border-indigo-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                          <img src={av} alt="Avatar profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                 </div>

                 <hr className="border-white/10" />

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@school.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors placeholder:text-slate-600"
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors placeholder:text-slate-600"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-full text-[15px] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? 'Creating Account...' : 'Continue'}
              </button>
            </form>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleEmailAction} className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@school.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-black/40 border border-white/5 rounded-[20px] focus:border-indigo-500 focus:bg-indigo-500/5 text-[15px] font-semibold outline-none transition-colors placeholder:text-slate-600"
                    />
                 </div>

                 <div className="space-y-1">
                    <div className="flex justify-between items-center pr-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Password</label>
                      <button 
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-indigo-400 font-bold hover:text-indigo-300"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-4 bg-black/40 border border-white/5 rounded-[20px] focus:border-indigo-500 focus:bg-indigo-500/5 text-[15px] font-semibold outline-none transition-colors placeholder:text-slate-600"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-full text-[15px] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full text-[15px] transition-colors border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Sign In with Google
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleEmailAction} className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Account Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@school.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-black/40 border border-white/5 rounded-[20px] focus:border-indigo-500 focus:bg-indigo-500/5 text-[15px] font-semibold outline-none transition-colors placeholder:text-slate-600"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-full text-[15px] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* GUEST SETUP FORM */}
          {mode === 'guest_setup' && (
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Board</label>
                       <select 
                         value={board}
                         onChange={e => {
                           setBoard(e.target.value);
                           setMedium(BOARD_MEDIUMS[e.target.value]?.[0] || 'English Medium');
                         }}
                         className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors text-white appearance-none"
                       >
                         <option className="bg-[#12121a]" value="CBSE">CBSE</option>
                         <option className="bg-[#12121a]" value="ICSE">ICSE</option>
                         <option className="bg-[#12121a]" value="GSEB">GSEB</option>
                         <option className="bg-[#12121a]" value="Maharashtra Board">Maharashtra Board</option>
                         <option className="bg-[#12121a]" value="UP Board">UP Board</option>
                         <option className="bg-[#12121a]" value="Bihar Board">Bihar Board</option>
                         <option className="bg-[#12121a]" value="Rajasthan Board">Rajasthan Board</option>
                         <option className="bg-[#12121a]" value="MP Board">MP Board</option>
                         <option className="bg-[#12121a]" value="Tamil Nadu Board">Tamil Nadu Board</option>
                         <option className="bg-[#12121a]" value="Karnataka Board">Karnataka Board</option>
                         <option className="bg-[#12121a]" value="Telangana Board">Telangana</option>
                         <option className="bg-[#12121a]" value="Andhra Pradesh Board">Andhra Pradesh</option>
                         <option className="bg-[#12121a]" value="Punjab Board">Punjab</option>
                         <option className="bg-[#12121a]" value="Haryana Board">Haryana</option>
                         <option className="bg-[#12121a]" value="West Bengal Board">West Bengal</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Class</label>
                       <select 
                         value={classLevel}
                         onChange={e => setClassLevel(e.target.value)}
                         className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors text-white appearance-none"
                       >
                         {[...Array(12)].map((_, i) => (
                           <option key={i+1} className="bg-[#12121a]" value={`${i+1}`}>Class {i+1}</option>
                         ))}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 pl-2">Medium</label>
                    <select 
                      value={medium}
                      onChange={e => setMedium(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl focus:border-indigo-500 focus:bg-indigo-500/5 text-sm font-semibold outline-none transition-colors text-white appearance-none"
                    >
                      {(BOARD_MEDIUMS[board] || ['English Medium']).map((med) => (
                        <option key={med} className="bg-[#12121a]" value={med}>{med}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <button 
                onClick={() => loginGuest({ board, classLevel, medium })}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-full text-[15px] transition-transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/20"
              >
                Start Exploring
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
