import React, { useState, useEffect } from 'react';
import { 
  Sparkles, GraduationCap, Trophy, Calendar, FileText, Zap, Compass, User, 
  Flame, Bell, Sun, Moon, LogIn, Menu, X, Landmark, RefreshCw, ShieldCheck, Home, Search, Target, ArrowLeft
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// Subcomponents
import HomeView from './components/HomeView';
import DoubtSolverView from './components/DoubtSolverView';
import QuizCenterView from './components/QuizCenterView';
import NotesGeneratorView from './components/NotesGeneratorView';
import FormulaLibraryView from './components/FormulaLibraryView';
import FocusSessionView from './components/FocusSessionView';
import PrepHubView from './components/PrepHubView';
import DashboardView from './components/DashboardView';
import AccountView from './components/AccountView';
import LeaderboardView from './components/LeaderboardView';
import OnboardingView from './components/OnboardingView';
import AdminPanelView from './components/AdminPanelView';
import GlobalSearchView from './components/GlobalSearchView';
import BoardResourcesView from './components/BoardResourcesView';

// Interfaces & Services
import { UserProfile, SavedDoubt, GeneratedNote, QuizAttempt, NotificationItem } from './types';
import { useAuth } from './context/AuthContext';
import { 
  getUserNotes, saveUserNote, deleteUserNote,
  getUserDoubts, saveUserDoubt, deleteUserDoubt,
  getUserQuizAttempts, saveUserQuizAttempt,
  getUserFormulaFavorites, saveUserFormulaFavorite,
  getAllUserProfiles
} from './firebaseService';

export default function App() {
  const { 
    user, profile, isGuest, loading, isAdmin, logout, updateProfileDetails, handleUserActivity 
  } = useAuth();

  // 0. Client side routing
  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname.replace('/', '');
    const validViews = ['home', 'dashboard', 'quizzes', 'notes', 'formulas', 'leaderboard', 'prephub', 'account', 'search', 'board'];
    if (path === '') return 'home';
    if (path === 'tutor') return 'doubt'; // mapping tutor in url to doubt view internally
    if (validViews.includes(path)) return path;
    return 'home';
  });

  // Sync window URL when view state changes
  useEffect(() => {
    let path = currentView;
    if (path === 'home') path = '';
    if (path === 'doubt') path = 'tutor';
    if (window.location.pathname !== `/${path}`) {
      window.history.pushState(null, '', `/${path}`);
    }
  }, [currentView]);

  // Handle browser back/forward buttons and Android Hardware Back Button
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '');
      const validViews = ['home', 'dashboard', 'quizzes', 'notes', 'formulas', 'leaderboard', 'prephub', 'account', 'search', 'board'];
      if (path === '') setCurrentView('home');
      else if (path === 'tutor') setCurrentView('doubt');
      else if (validViews.includes(path)) setCurrentView(path);
      // else leave alone or redirect home
    };
    window.addEventListener('popstate', handlePopState);
    
    // Capacitor Android Hardware Back Button
    const setupCapacitorBackButton = async () => {
      try {
        const { App: CapacitorApp } = await import('@capacitor/app');
        CapacitorApp.addListener('backButton', ({canGoBack}) => {
          setCurrentView((prev) => {
            if (prev !== 'home' && prev !== 'dashboard') {
              return 'dashboard';
            } else {
              CapacitorApp.exitApp();
              return prev;
            }
          });
        });
      } catch (e) {
        // Not running in Capacitor, ignore
      }
    };
    setupCapacitorBackButton();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isDarkMode = true;
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);

  // PWA (Progressive Web App) Install Prompts
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    // If already running in standalone mode, hide install button
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      showToast('To install, tap your browser menu (⋮ or ⇧) and choose "Add to Home screen".', 'info');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice outcome:', outcome);
    setDeferredPrompt(null);
    setIsInstallable(false);
    if (outcome === 'accepted') {
      showToast('🎉 Thank you for installing PureStudy!', 'success');
    }
  };

  // Local state replicas which sync to Firestore when authenticated, or localStorage as Guest
  const [savedDoubts, setSavedDoubts] = useState<SavedDoubt[]>([]);
  const [savedNotes, setSavedNotes] = useState<GeneratedNote[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [favoriteFormulaIds, setFavoriteFormulaIds] = useState<string[]>([]);
  
  // Real-time Community Students List for Standings
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // Platform Broadcast Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Daily Login Bonus
  useEffect(() => {
    if (!profile || !profile.uid || isGuest) return;
    const today = new Date().toDateString();
    if (profile.lastCheckInDate !== today) {
      const bonus = 20; // 20 points
      const nextPoints = (profile.points || 0) + bonus;
      updateProfileDetails({
        lastCheckInDate: today,
        points: nextPoints
      }).then(() => {
        showToast(`Welcome back, ${profile.username}! You earned a +${bonus} points daily login bonus 🎉`, 'success');
      }).catch(err => {
        console.error("Failed to update daily check-in bonus:", err);
      });
    }
  }, [profile?.uid, profile?.lastCheckInDate, isGuest]);

  // Dynamic SEO Page Titles & Canonical URLs
  useEffect(() => {
    const titles: Record<string, string> = {
      'home': 'PureStudy - AI Powered Learning Platform',
      'dashboard': 'PureStudy - Dashboard',
      'tutor': 'PureStudy - AI Tutor',
      'quizzes': 'PureStudy - Quiz Center',
      'notes': 'PureStudy - Notes Generator',
      'formulas': 'PureStudy - Formula Library',
      'leaderboard': 'PureStudy - Leaderboard',
      'prephub': 'PureStudy - Exam Prep Hub',
      'account': 'PureStudy - My Account'
    };
    document.title = titles[currentView] || 'PureStudy - AI Powered Learning Platform';

    // Update Canonical URL dynamically
    let path = currentView === 'home' ? '' : currentView;
    if (path === 'doubt') path = 'tutor';
    const canonicalUrl = `https://purestudy.app/${path}`;

    let canonicalTag = document.querySelector("link[rel='canonical']");
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute("href", canonicalUrl);
  }, [currentView]);

  // 2. Fetch/Sync Data depending on Session State (User Profile or Guest Profile)
  useEffect(() => {
    if (user) {
      // Authenticated User Sync
      const syncUserData = async () => {
        try {
          const notesRes = await getUserNotes(user.uid);
          setSavedNotes(notesRes || []);

          const doubtsRes = await getUserDoubts(user.uid);
          setSavedDoubts(doubtsRes || []);

          const attemptsRes = await getUserQuizAttempts(user.uid);
          setQuizHistory(attemptsRes || []);

          const favsRes = await getUserFormulaFavorites(user.uid);
          setFavoriteFormulaIds(favsRes || []);

          const listRes = await getAllUserProfiles();
          setUsersList(listRes || []);
        } catch (err) {
          console.error("Error reading database segments for authenticated user:", err);
        }
      };
      syncUserData();
    } else if (isGuest) {
      // Guest local backups restore
      const localNotes = localStorage.getItem('STUDENT_HUB_NOTES');
      setSavedNotes(localNotes ? JSON.parse(localNotes) : []);

      const localDoubts = localStorage.getItem('STUDENT_HUB_DOUBTS');
      setSavedDoubts(localDoubts ? JSON.parse(localDoubts) : []);

      const localAttempts = localStorage.getItem('STUDENT_HUB_QUIZ_HISTORY');
      setQuizHistory(localAttempts ? JSON.parse(localAttempts) : []);

      const localFavs = localStorage.getItem('STUDENT_HUB_FAV_FORMULAS');
      setFavoriteFormulaIds(localFavs ? JSON.parse(localFavs) : []);
      
      setUsersList([]);
    }
  }, [user, isGuest, currentView]);

  // 3. Keep local backups updated IF in Guest Mode
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('STUDENT_HUB_NOTES', JSON.stringify(savedNotes));
    }
  }, [savedNotes, isGuest]);

  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('STUDENT_HUB_DOUBTS', JSON.stringify(savedDoubts));
    }
  }, [savedDoubts, isGuest]);

  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('STUDENT_HUB_QUIZ_HISTORY', JSON.stringify(quizHistory));
    }
  }, [quizHistory, isGuest]);

  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('STUDENT_HUB_FAV_FORMULAS', JSON.stringify(favoriteFormulaIds));
    }
  }, [favoriteFormulaIds, isGuest]);

  // Dynamic calculations for gamification parameters
  const awardPoints = async (pointsToAdd: number) => {
    if (!profile) return;
    const nextPoints = (profile.points || 0) + pointsToAdd;
    await updateProfileDetails({ points: nextPoints });
  };

  const trackMinutesStudied = async (minutes: number) => {
    if (!profile) return;
    const nextMins = (profile.studyMinutesTotal || 0) + minutes;
    await updateProfileDetails({ studyMinutesTotal: nextMins });
  };

  // Add study notes handlers
  const handleSaveNote = async (newNote: GeneratedNote) => {
    if (savedNotes.some(n => n.topic === newNote.topic && n.subject === newNote.subject)) {
      showToast('You already drafted revision notes for this specific topic!', 'info');
      return;
    }

    setSavedNotes(prev => [newNote, ...prev]);
    
    if (user) {
      await saveUserNote(user.uid, newNote);
    }
    await awardPoints(25);
    await handleUserActivity();
    
    showToast('Revision Materials Drafted and Saved!', 'success');
  };

  const handleDeleteNote = async (id: string) => {
    setSavedNotes(prev => prev.filter(n => n.id !== id));
    if (user) {
      await deleteUserNote(user.uid, id);
    }
    showToast('Revision materials removed.', 'info');
  };

  const handleToggleNoteBookmark = async (id: string) => {
    setSavedNotes(prev => prev.map(n => {
      if (n.id === id) {
        const nextB = !n.bookmarked;
        if (user) {
          saveUserNote(user.uid, { ...n, bookmarked: nextB });
        }
        return { ...n, bookmarked: nextB };
      }
      return n;
    }));
  };

  // Saved AI Chat Doubts handlers
  const handleSaveDoubt = async (question: string, answer: string, subject: string) => {
    const newDoubt: SavedDoubt = {
      id: `doubt-${Date.now()}`,
      question,
      answer,
      subject,
      createdAt: new Date().toLocaleDateString()
    };
    
    setSavedDoubts(prev => [newDoubt, ...prev]);
    
    if (user) {
      await saveUserDoubt(user.uid, newDoubt);
    }
    await awardPoints(15);
    await handleUserActivity();
    showToast('AI doubt key concepts bookmarked!', 'success');
  };

  const handleDeleteDoubt = async (id: string) => {
    setSavedDoubts(prev => prev.filter(d => d.id !== id));
    if (user) {
      await deleteUserDoubt(user.uid, id);
    }
    showToast('Doubt sheet deleted.', 'info');
  };

  // Quizzes handlers
  const handleAddQuizAttempt = async (attempt: QuizAttempt) => {
    setQuizHistory(prev => [attempt, ...prev]);
    if (user) {
      await saveUserQuizAttempt(user.uid, attempt);
    }
    await updateProfileDetails({
      quizzesCompletedTotal: (profile?.quizzesCompletedTotal || 0) + 1,
      points: (profile?.points || 0) + 50
    });
    // Add streak/activity handling
    await handleUserActivity();
    
    showToast(`Perfect evaluation saved! +50 XP on ${attempt.quizTitle}`, 'success');
  };

  // Favorite Formula Toggle
  const handleToggleFavoriteFormula = async (id: string) => {
    const isFav = !favoriteFormulaIds.includes(id);
    setFavoriteFormulaIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(fId => fId !== id);
      } else {
        return [...prev, id];
      }
    });

    if (user) {
      await saveUserFormulaFavorite(user.uid, id, isFav);
    }
  };

  // Helper properties
  const activeNotificationCount = notifications.filter(n => !n.read).length;

  const handleMenuItemClick = (view: string) => {
    setCurrentView(view);
  };

  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'doubt', label: 'AI Tutor', icon: Sparkles },
    { id: 'board', label: 'Board', icon: Compass },
    { id: 'quizzes', label: 'Quizzes', icon: Trophy },
    { id: 'account', label: 'Profile', icon: User }
  ];

  // --- RENDERS ---

  // A. Loading Screen
  if (loading) {
    return (
      <div id="loading-spinner-view" className="min-h-screen min-h-dvh flex flex-col items-center justify-center bg-slate-950 font-sans space-y-4">
        <RefreshCw className="w-10 h-10 text-violet-500 animate-spin" />
        <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Synchronizing Student Parameters...</span>
      </div>
    );
  }

  // B. Onboarding Screen
  if (!profile) {
    return <OnboardingView />;
  }

  // C. Main Application Layout
  return (
    <div className={`min-h-screen min-h-dvh font-sans ${isDarkMode ? 'dark bg-[#0B0F19] text-slate-100' : 'bg-slate-50 text-slate-900'} overflow-x-hidden flex flex-col`}>
      {/* Mobile-first Header Container */}
      <div className="sticky top-0 z-40 w-full bg-[#131825]/80 backdrop-blur-2xl border-b border-gray-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 relative">
            <div 
              className={`w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 ${currentView === 'home' ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => { if (currentView !== 'home') setCurrentView('home'); }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 
              className={`font-black text-xl tracking-tight text-white drop-shadow-sm ${currentView === 'home' ? 'cursor-default' : 'cursor-pointer select-none'}`}
              onClick={() => { if (currentView !== 'home') setCurrentView('home'); }}
            >
              PureStudy
            </h1>
          </div>

          <div className="flex items-center gap-2">
             {/* Global Search */}
             <button
                onClick={() => setCurrentView('search')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Search Users"
             >
                <Search className="w-5 h-5" />
             </button>
             
             {/* XP Points */}
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A2235] border border-gray-800 rounded-full text-xs font-black shadow-inner">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-white">{profile.streak}</span>
             </div>
             
             {/* Profile Click action top-right */}
             <button
               onClick={() => setCurrentView('account')}
               className="ml-1 rounded-full ring-2 ring-transparent hover:ring-indigo-500/50 transition-all cursor-pointer"
             >
               <img
                 src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                 alt={profile?.username}
                 className="w-9 h-9 rounded-full object-cover border border-gray-700"
                 referrerPolicy="no-referrer"
               />
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Viewport Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 transition-opacity duration-300">
        
        {currentView === 'home' && (
          <DashboardView
            streak={profile?.streak || 0}
            studyMinutes={profile?.studyMinutesTotal ?? 0}
            quizzesCompleted={profile?.quizzesCompletedTotal ?? 0}
            notesCreatedLength={savedNotes.length}
            quizHistory={quizHistory}
            onNavigate={(v) => setCurrentView(v)}
          />
        )}

        {currentView === 'dashboard' && profile && (
          <DashboardView
            streak={profile.streak}
            studyMinutes={profile.studyMinutesTotal ?? 0}
            quizzesCompleted={profile.quizzesCompletedTotal ?? 0}
            notesCreatedLength={savedNotes.length}
            quizHistory={quizHistory}
            onNavigate={(v) => setCurrentView(v)}
          />
        )}

        {currentView === 'focus' && (
          <FocusSessionView />
        )}

        {currentView === 'doubt' && (
          <DoubtSolverView
            savedDoubts={savedDoubts}
            onSaveDoubt={handleSaveDoubt}
            onDeleteSavedDoubt={handleDeleteDoubt}
            trackMinutesStudied={trackMinutesStudied}
            onShowToast={showToast}
          />
        )}

        {currentView === 'quizzes' && (
          <QuizCenterView
            quizHistory={quizHistory}
            onAddQuizAttempt={handleAddQuizAttempt}
            awardPoints={awardPoints}
            trackMinutesStudied={trackMinutesStudied}
            onShowToast={showToast}
          />
        )}

        {currentView === 'notes' && (
          <NotesGeneratorView
            savedNotes={savedNotes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onToggleBookmark={handleToggleNoteBookmark}
            trackMinutesStudied={trackMinutesStudied}
            onShowToast={showToast}
          />
        )}

        {currentView === 'formula' && (
          <FormulaLibraryView
            favoriteFormulaIds={favoriteFormulaIds}
            onToggleFavoriteFormula={handleToggleFavoriteFormula}
            trackMinutesStudied={trackMinutesStudied}
          />
        )}

        {currentView === 'board' && (
          <BoardResourcesView
            onShowToast={showToast}
          />
        )}

        {currentView === 'prephub' && (
          <PrepHubView 
            trackMinutesStudied={trackMinutesStudied} 
          />
        )}

        {currentView === 'account' && (
          <AccountView
            savedNotesCount={savedNotes.length}
            savedDoubtsCount={savedDoubts.length}
            onShowToast={showToast}
          />
        )}

        {currentView === 'search' && (
          <GlobalSearchView
            onClose={() => setCurrentView('home')}
            onNavigate={(v) => setCurrentView(v)}
          />
        )}

        {currentView === 'leaderboard' && profile && (
          <LeaderboardView
            userPoints={profile.points}
            userStreak={profile.streak}
            currentUserProfile={profile}
            usersList={usersList}
            savedNotes={savedNotes}
            savedDoubts={savedDoubts}
            onNavigate={(v) => setCurrentView(v)}
          />
        )}

      </main>

      {/* Floating non-blocking stack of toast banners */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-full max-w-xs pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-10 ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-250 border-emerald-200 dark:border-emerald-800/30'
                : toast.type === 'warning'
                ? 'bg-amber-50/95 dark:bg-amber-950/90 text-amber-850 dark:text-amber-200 border-amber-200 dark:border-amber-800/30'
                : 'bg-violet-50/95 dark:bg-violet-950/90 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-800/30'
            }`}
          >
            <div className="flex-1 text-[11px] font-bold leading-relaxed">
              {toast.message}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Navigation - Mobile First Android Style */}
      {currentView !== 'home' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#131825]/95 backdrop-blur-xl border-t border-gray-800/80 pb-safe">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
            {bottomNavItems.map(item => {
              const active = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                    active ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className={`p-1 rounded-full ${active ? 'bg-indigo-500/10' : ''}`}>
                    <Icon className={`w-5 h-5 ${active ? 'fill-indigo-500/20' : ''}`} />
                  </div>
                  <span className={`text-[9px] font-bold tracking-wide ${active ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vercel Web Analytics */}
      <Analytics />

    </div>
  );
}
