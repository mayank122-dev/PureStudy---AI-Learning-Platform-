import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Target, Zap, Clock, Compass, Maximize, Minimize,
  TreePine, BarChart3, Calendar, Music, CheckCircle2, Leaf, Trophy, Quote, Settings, BookOpen, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FOCUS_MODES = {
  pomodoro: { name: 'Pomodoro', focus: 25, break: 5 },
  deep: { name: 'Deep Study', focus: 50, break: 10 },
  quick: { name: 'Quick Focus', focus: 15, break: 3 },
};

const AMBIENT_SOUNDS = {
  none: { name: 'None', url: '' },
  rain: { name: 'Rain', url: 'https://assets.mixkit.co/active_storage/sfx/2507/2507-preview.mp3' },
  forest: { name: 'Forest', url: 'https://assets.mixkit.co/active_storage/sfx/2504/2504-preview.mp3' },
  lofi: { name: 'Lo-Fi', url: 'https://assets.mixkit.co/active_storage/sfx/135/135-preview.mp3' },
};

const QUOTES = [
  "Focus is a muscle. The more you use it, the stronger it gets.",
  "Success is the sum of small efforts, repeated day-in and day-out.",
  "Do something today that your future self will thank you for.",
  "Starve your distractions, feed your focus."
];

export default function FocusSessionView() {
  const { profile, updateProfileDetails, handleUserActivity } = useAuth();

  const [activeTab, setActiveTab] = useState<'timer'|'analytics'|'forest'>('timer');
  const [mode, setMode] = useState<keyof typeof FOCUS_MODES>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(FOCUS_MODES.pomodoro.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerPhase, setTimerPhase] = useState<'focus' | 'break'>('focus');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sessionGoal, setSessionGoal] = useState('');
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientTheme, setAmbientTheme] = useState<keyof typeof AMBIENT_SOUNDS>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stats (Using local state for demo purposes, could be fetched from backend)
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [treesGrown, setTreesGrown] = useState<number[]>([]);

  useEffect(() => {
    let interval: number;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (audioRef.current) {
      if (isRunning && ambientTheme !== 'none' && soundEnabled) {
        audioRef.current.src = AMBIENT_SOUNDS[ambientTheme].url;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => console.log('Audio play blocked'));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isRunning, ambientTheme, soundEnabled]);

  const handleTimerComplete = async () => {
    if (soundEnabled) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }
    
    if (timerPhase === 'focus') {
      const earnedXP = FOCUS_MODES[mode].focus * 2; // 2 XP per minute
      if (profile) {
        await updateProfileDetails({
          points: (profile.points || 0) + earnedXP,
          studyMinutesTotal: (profile.studyMinutesTotal || 0) + FOCUS_MODES[mode].focus
        });
        await handleUserActivity();
      }
      setTodayFocusMinutes(prev => prev + FOCUS_MODES[mode].focus);
      setSessionsCompleted(prev => prev + 1);
      setTreesGrown(prev => [...prev, Date.now()]);
      
      setTimerPhase('break');
      setTimeLeft(FOCUS_MODES[mode].break * 60);
    } else {
      setTimerPhase('focus');
      setTimeLeft(FOCUS_MODES[mode].focus * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerPhase === 'focus' ? FOCUS_MODES[mode].focus * 60 : FOCUS_MODES[mode].break * 60);
  };

  const handleModeChange = (newMode: keyof typeof FOCUS_MODES) => {
    if (isRunning) return;
    setMode(newMode);
    setTimerPhase('focus');
    setTimeLeft(FOCUS_MODES[newMode].focus * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = timerPhase === 'focus' ? FOCUS_MODES[mode].focus * 60 : FOCUS_MODES[mode].break * 60;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const Container = isFullScreen ? 'div' : 'div';
  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-[100] bg-[#0B0F19] overflow-y-auto px-4 py-8 flex flex-col hide-scrollbar" 
    : "max-w-4xl mx-auto pt-4 pb-32 px-4 animate-in fade-in flex flex-col";

  return (
    <Container className={containerClasses}>
      <audio ref={audioRef} />

      {/* Header / Tabs - Hidden in Fullscreen unless hovered or at top */}
      <div className={`flex flex-wrap items-center justify-between gap-4 mb-8 ${isFullScreen && isRunning ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}>
         {!isFullScreen && (
           <div className="flex bg-[#131825] border border-gray-800 rounded-2xl p-1 shadow-sm">
             {(['timer', 'analytics', 'forest'] as const).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors flex items-center gap-2 ${activeTab === tab ? 'bg-[#1A2235] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab === 'timer' && <Clock className="w-4 h-4" />}
                  {tab === 'analytics' && <BarChart3 className="w-4 h-4" />}
                  {tab === 'forest' && <TreePine className="w-4 h-4" />}
                  <span className="hidden sm:inline">{tab}</span>
                </button>
             ))}
           </div>
         )}
         {isFullScreen && (
           <div className="flex items-center gap-2 text-gray-500">
              <Compass className="w-5 h-5" />
              <span className="font-bold tracking-widest uppercase text-xs">Deep Focus Mode</span>
           </div>
         )}
         
         <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2.5 bg-[#131825] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
               {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2.5 bg-[#131825] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
               {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
         </div>
      </div>

      {activeTab === 'timer' && (
        <div className={`flex flex-col lg:flex-row gap-6 ${isFullScreen ? 'flex-1 items-center justify-center' : ''}`}>
          {/* Main Timer Glassmorphic Card */}
          <div className={`relative overflow-hidden rounded-[32px] border border-gray-800/60 shadow-2xl flex-1 backdrop-blur-xl ${isFullScreen ? 'w-full max-w-2xl bg-[#131825]' : 'bg-[#131825]'}`}>
             <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                <div className={`h-full transition-all duration-1000 ${timerPhase === 'focus' ? 'bg-indigo-500' : 'bg-emerald-500'}`} style={{ width: `${progressPercent}%` }} />
             </div>
             
             <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />

             <div className="p-8 md:p-12 relative z-10 flex flex-col items-center">
                
                {/* Mode Selector */}
                <div className={`flex flex-wrap justify-center gap-2 mb-10 transition-opacity ${isRunning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  {(Object.keys(FOCUS_MODES) as Array<keyof typeof FOCUS_MODES>).map(m => (
                    <button
                      key={m}
                      onClick={() => handleModeChange(m)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${mode === m ? 'bg-indigo-600 text-white' : 'bg-[#1A2235] border border-gray-800 text-gray-400'}`}
                    >
                      {FOCUS_MODES[m].name}
                    </button>
                  ))}
                </div>

                {/* Circular Timer Display */}
                <div className="relative mb-12 flex justify-center items-center">
                   <svg className="absolute w-[280px] h-[280px] md:w-[340px] md:h-[340px] -rotate-90 transform pointer-events-none drop-shadow-2xl">
                     <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-800/50" />
                     <circle 
                       cx="50%" cy="50%" r="48%" 
                       fill="none" 
                       stroke="currentColor" 
                       strokeWidth="6" 
                       strokeDasharray="300%"
                       strokeDashoffset={`${300 - (progressPercent / 100) * 300}%`}
                       strokeLinecap="round"
                       className={`transition-all duration-1000 ${timerPhase === 'focus' ? 'text-indigo-500' : 'text-emerald-500'}`}
                     />
                   </svg>
                   
                   <div className="text-center p-8 bg-[#0B0F19]/50 rounded-full backdrop-blur-md w-[240px] h-[240px] md:w-[300px] md:h-[300px] flex flex-col items-center justify-center border border-white/5 shadow-inner">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm ${timerPhase === 'focus' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                        {timerPhase === 'focus' ? 'Deep Work' : 'Break Time'}
                     </span>
                     <h2 className="text-6xl md:text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow-md">
                        {formatTime(timeLeft)}
                     </h2>
                   </div>
                </div>

                {/* Session Goal */}
                <div className="w-full max-w-sm mb-12">
                   {!isRunning ? (
                     <div className="relative">
                       <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                       <input 
                         type="text" 
                         placeholder="What are you focusing on?" 
                         value={sessionGoal}
                         onChange={e => setSessionGoal(e.target.value)}
                         className="w-full bg-[#1A2235] border border-gray-800 text-white rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-[#131825] transition-all shadow-inner text-center"
                       />
                     </div>
                   ) : (
                     <div className="text-center animate-in fade-in zoom-in duration-300">
                        {timerPhase === 'focus' && sessionGoal ? (
                          <>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Current Focus</p>
                            <p className="text-lg text-white font-medium">{sessionGoal}</p>
                          </>
                        ) : timerPhase === 'break' ? (
                          <div className="flex flex-col items-center gap-3">
                            <Quote className="w-6 h-6 text-emerald-500/50" />
                            <p className="text-sm text-emerald-100 font-medium italic px-4 text-center">{quote}</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-indigo-400/80 uppercase tracking-widest font-bold mb-2">Immersion Active</p>
                            <p className="text-sm text-gray-400 font-medium">Maintain your zone.</p>
                          </>
                        )}
                     </div>
                   )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                   <button 
                      onClick={resetTimer} 
                      className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1A2235] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                   >
                      <RotateCcw className="w-5 h-5" />
                   </button>
                   
                   <button 
                      onClick={toggleTimer} 
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 ${isRunning ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/25 border border-indigo-500'}`}
                   >
                      {isRunning ? <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" /> : <Play className="w-8 h-8 md:w-10 md:h-10 ml-1.5 fill-current" />}
                   </button>

                   <div className="relative group">
                     <button className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1A2235] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 group">
                        <Music className="w-5 h-5" />
                     </button>
                     
                     {/* Ambient Sound Menu (Hover) */}
                     <div className="absolute bottom-[calc(100%+10px)] right-0 w-48 bg-[#1A2235] border border-gray-700 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto z-20 origin-bottom-right translate-y-2 group-hover:translate-y-0">
                        <p className="text-[10px] uppercase font-bold text-gray-500 px-3 py-2 tracking-widest">Ambient Noise</p>
                        <div className="space-y-1">
                          {(Object.entries(AMBIENT_SOUNDS) as [keyof typeof AMBIENT_SOUNDS, {name: string}][]).map(([key, sound]) => (
                            <button
                              key={key}
                              onClick={() => setAmbientTheme(key)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${ambientTheme === key ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                              {sound.name}
                              {ambientTheme === key && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                     </div>
                   </div>
                </div>

             </div>
          </div>

          {/* Side Panel (Hidden in Fullscreen) */}
          {!isFullScreen && (
            <div className="w-full lg:w-80 flex flex-col gap-6">
              
              {/* Daily Progress */}
              <div className="bg-[#131825] rounded-[32px] p-6 border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Today's Focus</h3>
                <div className="flex items-end gap-2 mb-2">
                   <h4 className="text-4xl font-black text-white">{todayFocusMinutes}</h4>
                   <span className="text-sm font-bold text-gray-400 mb-1">min</span>
                </div>
                <div className="w-full bg-[#1A2235] rounded-full h-2 mb-2 overflow-hidden border border-gray-800">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${Math.min((todayFocusMinutes / 120) * 100, 100)}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Goal: 120 mins</p>
              </div>

              {/* XP & Rewards */}
              <div className="bg-[#131825] rounded-[32px] p-6 border border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rewards</h3>
                  <Zap className="w-4 h-4 text-orange-500" />
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
                       <Trophy className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white leading-tight">Focus Beginner</p>
                       <p className="text-xs text-gray-500">{sessionsCompleted >= 1 ? 'Unlocked' : 'Complete 1 session'}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 opacity-50">
                       <BookOpen className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-gray-400 leading-tight">Deep Worker</p>
                       <p className="text-xs text-gray-600">Reach 120 mins</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* Recent Tree */}
              <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-[32px] p-6 border border-emerald-500/20 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-500/40 transition-colors" onClick={() => setActiveTab('forest')}>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <TreePine className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Virtual Forest</h4>
                  <p className="text-xs text-emerald-400/80">Planted {treesGrown.length} trees</p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && !isFullScreen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="col-span-1 md:col-span-2 bg-[#131825] rounded-[32px] p-6 md:p-8 border border-gray-800 shadow-sm">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-indigo-400" /> Weekly Focus Distribution
              </h3>
              
              {/* CSS Bar Chart Simulation */}
              <div className="flex items-end justify-between h-48 md:h-64 pt-6 pb-2 border-b border-gray-800 px-2 lg:px-10">
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                   const height = i === 3 ? 100 : Math.random() * 80 + 10; // Mock data
                   const isToday = i === new Date().getDay() - 1;
                   return (
                     <div key={day} className="flex flex-col items-center gap-3 w-8 md:w-12 group cursor-pointer">
                        <div className="relative w-full flex justify-center items-end h-full">
                           <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap">
                             {Math.round(height * 1.5)} mins
                           </div>
                           <div 
                             className={`w-full rounded-t-lg transition-all duration-700 ease-out ${isToday ? 'bg-indigo-500' : 'bg-gray-800 group-hover:bg-gray-700'}`}
                             style={{ height: `${height}%` }}
                           />
                        </div>
                        <span className={`text-[10px] md:text-sm font-bold uppercase tracking-widest ${isToday ? 'text-indigo-400' : 'text-gray-500'}`}>{day}</span>
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="bg-[#131825] rounded-[32px] p-6 border border-gray-800">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Lifetime Stats</h3>
             <div className="space-y-6">
                <div>
                   <p className="text-3xl font-black text-white mb-1">{profile?.studyMinutesTotal || todayFocusMinutes}</p>
                   <p className="text-sm font-medium text-gray-500">Total Minutes Focused</p>
                </div>
                <div className="h-[1px] w-full bg-gray-800" />
                <div>
                   <p className="text-3xl font-black text-white mb-1">{sessionsCompleted}</p>
                   <p className="text-sm font-medium text-gray-500">Sessions Completed</p>
                </div>
             </div>
           </div>

           <div className="bg-[#131825] rounded-[32px] p-6 border border-gray-800">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Focus Record</h3>
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                   <Target className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-3xl font-black text-white">{profile?.streak || 0} Days</p>
                   <p className="text-sm font-medium text-gray-500">Current Streak</p>
                </div>
             </div>
             <p className="text-xs text-gray-400 leading-relaxed bg-[#1A2235] p-4 rounded-2xl border border-gray-800/80">
               Keep up the momentum! Study for at least 15 minutes daily to maintain your streak and earn multiplying XP bonuses.
             </p>
           </div>
        </div>
      )}

      {/* Forest Tab */}
      {activeTab === 'forest' && !isFullScreen && (
        <div className="bg-[#131825] rounded-[32px] p-6 md:p-10 border border-gray-800 shadow-sm animate-in fade-in zoom-in-95 min-h-[60vh] flex flex-col relative overflow-hidden">
           
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           
           <h3 className="text-2xl font-black text-emerald-400 mb-2 relative z-10 flex items-center gap-2">
              <Leaf className="w-6 h-6" /> Your Virtual Forest
           </h3>
           <p className="text-gray-400 font-medium mb-10 relative z-10">Every completed session plants a tree. Grow your focus.</p>

           <div className="flex-1 bg-[#0B0F19] rounded-3xl border border-gray-800/80 p-8 relative flex flex-col justify-end z-10 overflow-hidden shadow-inner">
             {/* Simple visual land */}
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-900/20 to-transparent" />
             
             {treesGrown.length === 0 ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                 <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4 border border-gray-700">
                    <TreePine className="w-10 h-10 text-gray-600" />
                 </div>
                 <h4 className="text-white font-bold text-lg mb-2">Barren Land</h4>
                 <p className="text-gray-500 text-sm max-w-xs">Complete your first focus session today to plant your very first tree!</p>
               </div>
             ) : (
               <div className="relative z-10 flex flex-wrap items-end gap-x-6 gap-y-8 justify-center pb-4">
                 {treesGrown.map((t, i) => (
                   <div key={t} className="flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in zoom-in duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                     <TreePine className={`text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] ${i % 3 === 0 ? 'w-24 h-24 text-emerald-400' : i % 2 === 0 ? 'w-20 h-20 text-teal-500' : 'w-16 h-16'}`} strokeWidth={1.5} />
                     <div className="w-8 h-2 bg-black/30 rounded-[100%] mt-[-10px] blur-[2px]" />
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      )}

    </Container>
  );
}

