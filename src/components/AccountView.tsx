import React, { useState, useEffect } from 'react';
import { 
  User, Settings, GraduationCap, Clock, Bookmark, Globe, 
  ArrowRight, ShieldCheck, Mail, Lock, LogOut, Landmark, CheckCircle2, Award,
  ChevronRight, Camera, Bell, Shield, Info, Smartphone, EyeOff, Edit3, Save, Search, ChevronLeft, Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import InstallAppButton from './InstallAppButton';
import ShareProfileModal from './ShareProfileModal';
import { BOARD_MEDIUMS } from './OnboardingView';

interface AccountViewProps {
  savedNotesCount: number;
  savedDoubtsCount: number;
  onShowToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export default function AccountView({
  savedNotesCount,
  savedDoubtsCount,
  onShowToast
}: AccountViewProps) {
  const { user, profile, isGuest, logout, updateProfileDetails } = useAuth();
  
  // Settings Mode
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'language' | 'notifications' | 'privacy' | 'about'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Profile preferences
  const [fullNameInput, setFullNameInput] = useState(profile?.fullName || '');
  const [usernameInput, setUsernameInput] = useState(profile?.username || '');
  const [board, setBoard] = useState(profile?.board || 'CBSE');
  const [classLevel, setClassLevel] = useState(profile?.classLevel || '10');
  const [medium, setMedium] = useState(profile?.medium || 'English Medium');
  const [schoolInput, setSchoolInput] = useState(profile?.school || '');
  const [favSub, setFavSub] = useState(profile?.preferences?.favoriteSubject || 'Science');
  const [goalMin, setGoalMin] = useState(profile?.preferences?.dailyGoalMinutes || 45);
  const [bioInput, setBioInput] = useState(profile?.bio || '');
  const [language, setLanguage] = useState(profile?.preferences?.language || 'English');
  
  // Notification Toggles
  const [notifDaily, setNotifDaily] = useState(profile?.preferences?.notifications?.dailyReminder ?? true);
  const [notifQuiz, setNotifQuiz] = useState(profile?.preferences?.notifications?.quizReminder ?? true);
  const [notifGoal, setNotifGoal] = useState(profile?.preferences?.notifications?.goalReminder ?? true);
  const [notifExam, setNotifExam] = useState(profile?.preferences?.notifications?.examCountdown ?? true);
  const [notifAll, setNotifAll] = useState(profile?.preferences?.notifications?.allEnabled ?? true);
  
  // Privacy
  const [privacyVis, setPrivacyVis] = useState(profile?.preferences?.privacy?.profileVisibility || 'public');
  const [privacyActivity, setPrivacyActivity] = useState(profile?.preferences?.privacy?.showActivity ?? true);

  useEffect(() => {
    if (profile) {
      setFullNameInput(profile.fullName || '');
      setUsernameInput(profile.username || '');
      setBoard(profile.board || 'CBSE');
      setClassLevel(profile.classLevel || '10');
      setMedium(profile.medium || 'English Medium');
      setSchoolInput(profile.school || '');
      setFavSub(profile.preferences?.favoriteSubject || 'Science');
      setGoalMin(profile.preferences?.dailyGoalMinutes || 45);
      setBioInput(profile.bio || '');
      setLanguage(profile.preferences?.language || 'English');
      
      const notifs = profile.preferences?.notifications;
      if (notifs) {
        setNotifDaily(notifs.dailyReminder ?? true);
        setNotifQuiz(notifs.quizReminder ?? true);
        setNotifGoal(notifs.goalReminder ?? true);
        setNotifExam(notifs.examCountdown ?? true);
        setNotifAll(notifs.allEnabled ?? true);
      }
      
      const priv = profile.preferences?.privacy;
      if (priv) {
        setPrivacyVis(priv.profileVisibility || 'public');
        setPrivacyActivity(priv.showActivity ?? true);
      }
    }
  }, [profile]);

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const details: Partial<UserProfile> = {
      fullName: fullNameInput,
      username: usernameInput,
      board,
      classLevel,
      medium,
      grade: classLevel, // preserve retro compat
      school: schoolInput,
      bio: bioInput,
      preferences: {
        theme: profile.preferences?.theme || 'dark', // Keep dark only per requirements
        favoriteSubject: favSub,
        dailyGoalMinutes: Number(goalMin),
        language: language as 'English' | 'Hindi',
        notifications: {
          dailyReminder: notifDaily,
          quizReminder: notifQuiz,
          goalReminder: notifGoal,
          examCountdown: notifExam,
          allEnabled: notifAll
        },
        privacy: {
          profileVisibility: privacyVis as 'public' | 'private' | 'friends',
          showActivity: privacyActivity
        }
      }
    };

    try {
      await updateProfileDetails(details);
      if (onShowToast) {
        onShowToast('🎉 Settings saved successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      if (onShowToast) {
        onShowToast('❌ Failed to save profile updates', 'warning');
      }
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Lock className="w-12 h-12 mb-4 opacity-50" />
        <p>No active profile loaded. Please sign in first.</p>
      </div>
    );
  }

  if (!isSettingsOpen) {
    return (
      <div className="max-w-4xl mx-auto pb-24 md:pb-12 space-y-6 pt-4 animate-in fade-in">
        
        {/* Immersive Mobile-Style Profile Card */}
        <div className="bg-[#131825] rounded-[32px] p-6 md:p-10 flex flex-col items-center text-center border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="absolute top-4 right-4 z-20 flex gap-2">
             <button 
               onClick={() => setShowShareModal(true)} 
               className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors border border-white/5 cursor-pointer shadow-lg"
               title="Share Profile"
             >
               <Share2 className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setIsSettingsOpen(true)} 
               className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 text-gray-300 hover:text-white transition-colors border border-white/5 text-sm font-bold shadow-lg cursor-pointer"
             >
               <Settings className="w-4 h-4" />
               <span className="hidden md:inline">Settings</span>
             </button>
          </div>

          <div className="relative z-10 w-full flex flex-col items-center">
             <div className="relative inline-block mb-5">
               <img
                 src={profile.avatarUrl}
                 alt={profile.username}
                 className="w-28 h-28 rounded-[32px] mx-auto object-cover border-[4px] border-gray-800 shadow-2xl"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-[#131825] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#131825]" />
               </div>
             </div>
             
             <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-2">
               {profile.fullName || profile.username}
             </h2>
             <span className="text-gray-400 font-bold mb-4">@{profile.username}</span>
             
             {profile.bio && (
               <p className="text-gray-300 max-w-sm mx-auto mb-6 text-sm">{profile.bio}</p>
             )}

             <div className="flex flex-wrap items-center justify-center gap-3">
               <span className="px-3.5 py-1.5 bg-white/5 border border-white/5 text-white text-[11px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                 <Shield className="w-3.5 h-3.5 text-indigo-400" />
                 {profile.isAdmin ? 'Admin' : isGuest ? 'Guest' : 'Student'}
               </span>
               <span className="px-3.5 py-1.5 bg-white/5 border border-white/5 text-white text-[11px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                 <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
                 {profile.board} • Class {profile.classLevel} • {profile.medium || 'English Medium'}
               </span>
               <span className="px-3.5 py-1.5 bg-white/5 border border-white/5 text-white text-[11px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                 <Award className="w-3.5 h-3.5 text-amber-400" />
                 Level {Math.floor(profile.points / 100) + 1}
               </span>
             </div>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#131825] rounded-[24px] p-5 border border-gray-800 space-y-2">
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">AI Notes</span>
              <div className="text-2xl font-black text-white flex items-end gap-2">{savedNotesCount} <span className="text-xs text-gray-500 mb-1">docs</span></div>
            </div>
            <div className="bg-[#131825] rounded-[24px] p-5 border border-gray-800 space-y-2">
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Doubts Slain</span>
              <div className="text-2xl font-black text-white flex items-end gap-2">{savedDoubtsCount} <span className="text-xs text-gray-500 mb-1">chats</span></div>
            </div>
            <div className="bg-[#131825] rounded-[24px] p-5 border border-gray-800 space-y-2">
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">XP Points</span>
              <div className="text-2xl font-black text-indigo-400 flex items-end gap-2">{profile.points} <span className="text-xs text-indigo-500/50 mb-1">xp</span></div>
            </div>
            <div className="bg-[#131825] rounded-[24px] p-5 border border-gray-800 space-y-2">
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Streak</span>
              <div className="text-2xl font-black text-amber-400 flex items-end gap-2">{profile.streak} <span className="text-xs text-amber-500/50 mb-1">days</span></div>
            </div>
        </div>
      </div>
    );
  }

  // Define tabs for sidebar
  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: ShieldCheck },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Safety', icon: EyeOff },
    { id: 'about', label: 'About', icon: Info },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                   <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Profile Management</h2>
                   <p className="text-xs text-gray-400">Update how you appear in PureStudy</p>
                </div>
             </div>
             
             <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                   <img src={profile.avatarUrl} className="w-20 h-20 rounded-2xl object-cover border border-gray-700" referrerPolicy="no-referrer" />
                   <button className="absolute -bottom-2 -right-2 p-1.5 bg-white text-black rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
                      <Camera className="w-4 h-4" />
                   </button>
                </div>
                <div>
                   <h3 className="text-white font-bold mb-1">Profile Picture</h3>
                   <p className="text-xs text-gray-500">Must be JPEG, SVG or PNG. Up to 5MB.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">Full Name</label>
                   <input type="text" value={fullNameInput} onChange={e=>setFullNameInput(e.target.value)} className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">Username</label>
                   <div className="relative">
                     <span className="absolute left-4 top-3.5 text-gray-500 font-bold">@</span>
                     <input type="text" value={usernameInput} onChange={e=>setUsernameInput(e.target.value)} className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl pl-8 pr-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" />
                   </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">Bio</label>
                   <textarea value={bioInput} onChange={e=>setBioInput(e.target.value)} className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 min-h-[100px] resize-none transition-colors" placeholder="A little about yourself..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">Board</label>
                   <select value={board} onChange={e=>{
                     setBoard(e.target.value);
                     setMedium(BOARD_MEDIUMS[e.target.value]?.[0] || 'English Medium');
                   }} className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                     <option value="CBSE">CBSE</option>
                     <option value="ICSE">ICSE</option>
                     <option value="GSEB">GSEB (Gujarat Board)</option>
                     <option value="Maharashtra Board">Maharashtra Board</option>
                     <option value="UP Board">UP Board</option>
                     <option value="Bihar Board">Bihar Board</option>
                     <option value="Rajasthan Board">Rajasthan Board</option>
                     <option value="MP Board">MP Board</option>
                     <option value="Tamil Nadu Board">Tamil Nadu Board</option>
                     <option value="Karnataka Board">Karnataka Board</option>
                     <option value="Telangana Board">Telangana Board</option>
                     <option value="Andhra Pradesh Board">Andhra Pradesh Board</option>
                     <option value="Punjab Board">Punjab Board</option>
                     <option value="Haryana Board">Haryana Board</option>
                     <option value="West Bengal Board">West Bengal Board</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">Class</label>
                   <select value={classLevel} onChange={e=>setClassLevel(e.target.value)} className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                     {[...Array(12)].map((_, i) => (
                       <option key={i+1} value={`${i+1}`}>Class {i+1}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">Medium</label>
                   <select value={medium} onChange={e=>setMedium(e.target.value)} className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                     {(BOARD_MEDIUMS[board] || ['English Medium']).map(med => (
                       <option key={med} value={med}>{med}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">School</label>
                   <input type="text" value={schoolInput} onChange={e=>setSchoolInput(e.target.value)} className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" placeholder="Your School Name" />
                </div>
             </div>
          </div>
        );
      case 'account':
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                   <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Account Settings</h2>
                   <p className="text-xs text-gray-400">Manage security and linked accounts</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="bg-[#1A2235] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                   <div className="flex-1 min-w-0 pr-4">
                     <h3 className="text-white font-bold">Email Address</h3>
                     <p className="text-xs text-gray-400 mt-1 truncate">{user?.email || 'guest@studenthub.io'}</p>
                   </div>
                   <button className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-gray-300 hover:text-white transition-colors cursor-pointer">Edit</button>
                </div>
                
                <div className="bg-[#1A2235] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                   <div>
                     <h3 className="text-white font-bold">Password</h3>
                     <p className="text-xs text-gray-400 mt-1">Last changed: Never</p>
                   </div>
                   <div className="flex gap-2 shrink-0">
                     <button className="px-3 py-2 bg-transparent border border-white/10 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Reset</button>
                     <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer">Change</button>
                   </div>
                </div>

                <div className="bg-[#1A2235] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
                   <div>
                     <h3 className="text-white font-bold mb-1">Linked Accounts</h3>
                     <p className="text-xs text-gray-400">Connect other accounts for seamless login.</p>
                   </div>
                   <div className="flex items-center justify-between py-2 border-t border-gray-800/50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5"><Globe className="w-full h-full text-blue-500" /></div>
                         <span className="text-sm font-bold text-white">Google Sign-In</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Connected</span>
                   </div>
                </div>

                <div className="pt-8 border-t border-gray-800 space-y-4">
                   <button onClick={logout} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group cursor-pointer border border-transparent">
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">Sign Out</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                   </button>
                   <button className="w-full flex items-center justify-between p-4 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl transition-colors group cursor-pointer cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-rose-500" />
                        <span className="text-sm font-bold text-rose-500">Delete Account</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-500/50" />
                   </button>
                </div>
             </div>
          </div>
        );
      case 'language':
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                   <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Language Preferences</h2>
                   <p className="text-xs text-gray-400">Apply language across the entire application</p>
                </div>
             </div>
             
             <div className="space-y-3">
                <label className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${language === 'English' ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' : 'bg-[#1A2235] border-gray-800 hover:border-gray-700'}`}>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-gray-300">EN</div>
                      <div>    
                         <h3 className="text-white font-bold">English</h3>
                         <p className="text-xs text-gray-500 mt-0.5">United States</p>
                      </div>
                   </div>
                   <input type="radio" checked={language === 'English'} onChange={() => setLanguage('English')} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                </label>
                <label className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${language === 'Hindi' ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' : 'bg-[#1A2235] border-gray-800 hover:border-gray-700'}`}>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-gray-300">HI</div>
                      <div>    
                         <h3 className="text-white font-bold">Hindi / हिंदी</h3>
                         <p className="text-xs text-gray-500 mt-0.5">India</p>
                      </div>
                   </div>
                   <input type="radio" checked={language === 'Hindi'} onChange={() => setLanguage('Hindi')} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                </label>
             </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                   <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Notifications</h2>
                   <p className="text-xs text-gray-400">Control when and how you are notified</p>
                </div>
             </div>

             <div className="space-y-4">
                <label className="flex items-center justify-between p-5 bg-[#1A2235] border border-gray-800 rounded-2xl cursor-pointer">
                   <div>
                     <h3 className="text-white font-bold text-sm">Enable All Notifications</h3>
                     <p className="text-xs text-gray-500 mt-1">Master toggle for push notifications</p>
                   </div>
                   <div className={`w-12 h-6 flex items-center rounded-full transition-colors ${notifAll ? 'bg-indigo-500' : 'bg-gray-600'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ml-1 ${notifAll ? 'translate-x-[24px]' : ''}`} />
                   </div>
                   <input type="checkbox" className="hidden" checked={notifAll} onChange={(e) => setNotifAll(e.target.checked)} />
                </label>

                <div className={`space-y-4 transition-opacity ${notifAll ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                   <label className="flex items-center justify-between p-4 bg-[#131825] border border-gray-800 rounded-2xl cursor-pointer hover:border-gray-700 transition-colors">
                     <div>
                       <h3 className="text-white font-bold text-sm">Daily Study Reminder</h3>
                       <p className="text-xs text-gray-500 mt-1">Get reminded to keep your streak alive</p>
                     </div>
                     <input type="checkbox" checked={notifDaily} onChange={(e) => setNotifDaily(e.target.checked)} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                   </label>
                   
                   <label className="flex items-center justify-between p-4 bg-[#131825] border border-gray-800 rounded-2xl cursor-pointer hover:border-gray-700 transition-colors">
                     <div>
                       <h3 className="text-white font-bold text-sm">Quiz Reminder</h3>
                       <p className="text-xs text-gray-500 mt-1">Notifications for daily and weekly quizzes</p>
                     </div>
                     <input type="checkbox" checked={notifQuiz} onChange={(e) => setNotifQuiz(e.target.checked)} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                   </label>

                   <label className="flex items-center justify-between p-4 bg-[#131825] border border-gray-800 rounded-2xl cursor-pointer hover:border-gray-700 transition-colors">
                     <div>
                       <h3 className="text-white font-bold text-sm">Goal Reminder</h3>
                       <p className="text-xs text-gray-500 mt-1">Updates when you are close to your study goal</p>
                     </div>
                     <input type="checkbox" checked={notifGoal} onChange={(e) => setNotifGoal(e.target.checked)} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                   </label>

                   <label className="flex items-center justify-between p-4 bg-[#131825] border border-gray-800 rounded-2xl cursor-pointer hover:border-gray-700 transition-colors">
                     <div>
                       <h3 className="text-white font-bold text-sm">Exam Countdown</h3>
                       <p className="text-xs text-gray-500 mt-1">Important alerts before scheduled exams</p>
                     </div>
                     <input type="checkbox" checked={notifExam} onChange={(e) => setNotifExam(e.target.checked)} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                   </label>
                </div>
             </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                   <EyeOff className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
                   <p className="text-xs text-gray-400">Manage who can see your data</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[11px] uppercase font-bold text-gray-500 tracking-widest pl-1">Profile Visibility</label>
                   <div className="bg-[#1A2235] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
                      <label className="flex items-center justify-between p-4 border-b border-gray-800/50 cursor-pointer hover:bg-white/5 transition-colors">
                         <span className="text-sm font-bold text-white">Public (Everyone)</span>
                         <input type="radio" value="public" checked={privacyVis === 'public'} onChange={() => setPrivacyVis('public')} className="w-4 h-4 accent-indigo-500 cursor-pointer" />
                      </label>
                      <label className="flex items-center justify-between p-4 border-b border-gray-800/50 cursor-pointer hover:bg-white/5 transition-colors">
                         <span className="text-sm font-bold text-white">Friends Only</span>
                         <input type="radio" value="friends" checked={privacyVis === 'friends'} onChange={() => setPrivacyVis('friends')} className="w-4 h-4 accent-indigo-500 cursor-pointer" />
                      </label>
                      <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                         <span className="text-sm font-bold text-white">Private (Only Me)</span>
                         <input type="radio" value="private" checked={privacyVis === 'private'} onChange={() => setPrivacyVis('private')} className="w-4 h-4 accent-indigo-500 cursor-pointer" />
                      </label>
                   </div>
                </div>

                <div className="bg-[#1A2235] border border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4">
                   <div>
                     <h3 className="text-sm font-bold text-white">Show Activity Status</h3>
                     <p className="text-xs text-gray-500 mt-1">Let others see when you're online.</p>
                   </div>
                   <label className="cursor-pointer">
                     <div className={`w-12 h-6 flex items-center rounded-full transition-colors ${privacyActivity ? 'bg-indigo-500' : 'bg-gray-600'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ml-1 ${privacyActivity ? 'translate-x-[24px]' : ''}`} />
                     </div>
                     <input type="checkbox" className="hidden" checked={privacyActivity} onChange={(e) => setPrivacyActivity(e.target.checked)} />
                   </label>
                </div>

                <div className="pt-4 space-y-3 border-t border-gray-800">
                   <button className="w-full text-left p-4 bg-[#1A2235] border border-gray-800 hover:border-gray-700 rounded-xl text-sm font-bold text-gray-300 transition-colors cursor-pointer">
                      Download My Data
                   </button>
                   <button className="w-full text-left p-4 bg-[#1A2235] border border-gray-800 hover:border-gray-700 rounded-xl text-sm font-bold text-gray-300 transition-colors cursor-pointer">
                      Session Management
                   </button>
                </div>
             </div>
          </div>
        );
      case 'about':
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
             <div className="flex flex-col items-center justify-center p-8 text-center bg-[#1A2235] rounded-3xl border border-gray-800 mb-6">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                   <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">PureStudy</h2>
                <p className="text-gray-400 text-sm mt-1 font-medium">Version 2.4.0 (Build 9821)</p>
             </div>

             <div className="space-y-2">
               <button className="w-full flex items-center justify-between p-4 bg-[#131825] border border-gray-800 hover:border-gray-700 rounded-xl transition-colors group cursor-pointer">
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">Terms & Conditions</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
               </button>
               <button className="w-full flex items-center justify-between p-4 bg-[#131825] border border-gray-800 hover:border-gray-700 rounded-xl transition-colors group cursor-pointer">
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">Privacy Policy</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
               </button>
               <button className="w-full flex items-center justify-between p-4 bg-[#131825] border border-gray-800 hover:border-gray-700 rounded-xl transition-colors group cursor-pointer">
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">Contact Support</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
               </button>
               <button className="w-full flex items-center justify-between p-4 bg-[#131825] border border-gray-800 hover:border-gray-700 rounded-xl transition-colors group cursor-pointer">
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">Report a Bug</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
               </button>
               <button className="w-full flex items-center justify-between p-4 bg-[#131825] border border-gray-800 hover:border-gray-700 rounded-xl transition-colors group cursor-pointer">
                  <span className="text-sm font-bold text-emerald-400">Rate App</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400/50" />
               </button>
             </div>
             
             <div className="pt-4 border-t border-gray-800">
               <InstallAppButton />
             </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 md:pb-12 pt-4 px-2 md:px-0 animate-in fade-in h-[calc(100vh-80px)] md:h-auto flex flex-col">
      {/* Settings Header */}
      <div className="flex items-center justify-between mb-4 px-2">
         <button 
           onClick={() => setIsSettingsOpen(false)} 
           className="px-4 py-2 bg-[#131825] hover:bg-[#1A2235] border border-gray-800 rounded-xl flex items-center gap-2 text-white text-sm font-bold shadow-lg transition-colors cursor-pointer"
         >
           <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
         </button>
         
         <div className="flex items-center gap-3">
           <div className="hidden sm:flex relative items-center">
             <Search className="w-4 h-4 text-gray-500 absolute left-3" />
             <input type="text" placeholder="Search settings..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-64 bg-[#131825] border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-sm font-medium text-white focus:border-indigo-500 outline-none placeholder-gray-600 transition-colors" />
           </div>
           
           <button 
             onClick={handleUpdatePreferences}
             className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center flex-row gap-2 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all border border-transparent hover:border-indigo-400 cursor-pointer"
           >
             <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save Changes</span>
           </button>
         </div>
      </div>

      <div className="flex-1 min-h-0 bg-transparent flex flex-col md:flex-row gap-6 md:h-[650px] overflow-hidden items-stretch">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 bg-transparent rounded-2xl p-0 border-none snap-x h-auto">
           {TABS.map(tab => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all snap-center whitespace-nowrap md:whitespace-normal border cursor-pointer ${
                   isActive 
                   ? 'bg-[#131825] text-white border-gray-700 md:shadow-lg' 
                   : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent'
                 }`}
               >
                 <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                 {tab.label}
               </button>
             )
           })}
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1 bg-[#131825] rounded-[32px] border border-gray-800 overflow-y-auto shadow-2xl relative">
           {renderTabContent()}
        </div>
      </div>

      {showShareModal && profile && (
        <ShareProfileModal 
          username={profile.username} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
}
