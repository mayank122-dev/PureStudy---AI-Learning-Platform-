import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getUserProfile, saveUserProfile } from '../firebaseService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isGuest: boolean;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, details: { fullName: string; username: string; grade: string; school?: string; avatarUrl?: string; board?: string; classLevel?: string; medium?: string; }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginGuest: () => void;
  logout: () => Promise<void>;
  passwordReset: (email: string) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
  handleUserActivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('STUDENT_HUB_AUTH_MODE') === 'guest';
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === "mayanksonkar122@gmail.com" || !!profile?.isAdmin;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
        localStorage.setItem('STUDENT_HUB_AUTH_MODE', 'firebase');

        // Fetch user document from Firestore
        try {
          const fetched = await getUserProfile(firebaseUser.uid);
          if (fetched) {
            setProfile({
              ...fetched,
              uid: firebaseUser.uid
            });
          } else {
            // Profile setup needed. We leave the profile null so the app presents onboarding
            setProfile(null);
          }
        } catch (err) {
          console.error("Error reading profile document on login", err);
          setProfile(null);
        }
      } else {
        setUser(null);
        if (!isGuest) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isGuest]);

  // If Guest mode is active, populate a guest profile in local storage
  useEffect(() => {
    if (isGuest) {
      const saved = localStorage.getItem('STUDENT_HUB_PROFILE');
      if (saved) {
        setProfile(JSON.parse(saved));
      } else {
        const defaultGuest: UserProfile = {
          uid: 'guest-user',
          fullName: 'Guest Student',
          username: 'Guest',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          grade: '10',
          board: 'CBSE',
          classLevel: '10',
          medium: 'English Medium',
          school: 'Guest Academy',
          points: 0,
          streak: 0,
          studyMinutesTotal: 0,
          quizzesCompletedTotal: 0,
          preferences: {
            theme: 'light',
            favoriteSubject: 'Physics',
            dailyGoalMinutes: 45
          }
        };
        setProfile(defaultGuest);
        localStorage.setItem('STUDENT_HUB_PROFILE', JSON.stringify(defaultGuest));
      }
    }
  }, [isGuest]);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    details: { fullName: string; username: string; grade: string; school?: string; avatarUrl?: string; board?: string; classLevel?: string; medium?: string; }
  ) => {
    // Check username availability first (unauthenticated)
    const lowerUsername = details.username.toLowerCase();
    const usernameRef = doc(db, 'usernames', lowerUsername);
    const snap = await getDoc(usernameRef);
    if (snap.exists()) {
      throw new Error("Username already taken. Please choose another username.");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await firebaseUpdateProfile(cred.user, {
      displayName: details.fullName,
      photoURL: details.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
    });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      fullName: details.fullName,
      username: details.username,
      grade: details.grade,
      board: details.board || 'CBSE',
      classLevel: details.classLevel || '10',
      medium: details.medium || 'English Medium',
      school: details.school || '',
      avatarUrl: details.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      points: 0,
      streak: 0,
      studyMinutesTotal: 0,
      quizzesCompletedTotal: 0,
      preferences: {
        theme: 'light',
        favoriteSubject: 'Physics',
        dailyGoalMinutes: 45,
        privacy: { profileVisibility: 'public', showActivity: true },
        notifications: { goalReminder: true, examCountdown: true, allEnabled: true, dailyReminder: true, quizReminder: true }
      },
      isAdmin: email === "mayanksonkar122@gmail.com",
      joinedDate: new Date().toLocaleDateString(),
      lastActiveDate: new Date().toLocaleDateString()
    };

    // Save profile to Firestore
    const claimRef = doc(db, 'usernames', newProfile.username.toLowerCase());
    await setDoc(claimRef, { uid: cred.user.uid, createdAt: new Date().toISOString() });
    
    await saveUserProfile(cred.user.uid, newProfile);
    setProfile(newProfile);
    setIsGuest(false);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    
    // Check if profile exists
    const fetched = await getUserProfile(cred.user.uid);
    if (!fetched) {
      // Profile does not exist yet. Let the user onboard with remaining details in UI,
      // or set standard defaults from Google Account.
      const username = (cred.user.email?.split('@')[0] || 'student_' + Math.random().toString(36).substring(2, 7)).toLowerCase();
      
      // Ensure it's unique if possible, else append random
      let finalUsername = username;
      let isUnique = false;
      let counter = 0;
      while (!isUnique && counter < 5) {
        const checkRef = doc(db, 'usernames', finalUsername);
        const checkSnap = await getDoc(checkRef);
        if (checkSnap.exists()) {
          finalUsername = `${username}${Math.floor(Math.random() * 10000)}`;
          counter++;
        } else {
          isUnique = true;
        }
      }

      const newProfile: UserProfile = {
        uid: cred.user.uid,
        fullName: cred.user.displayName || 'Google Student',
        username: finalUsername,
        avatarUrl: cred.user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        grade: '10',
        board: 'CBSE',
        classLevel: '10',
        medium: 'English Medium',
        school: '',
        points: 0,
        streak: 0,
        studyMinutesTotal: 0,
        quizzesCompletedTotal: 0,
        preferences: {
          theme: 'light',
          favoriteSubject: 'Physics',
          dailyGoalMinutes: 45,
          privacy: { profileVisibility: 'public', showActivity: true },
          notifications: { goalReminder: true, examCountdown: true, allEnabled: true, dailyReminder: true, quizReminder: true }
        },
        isAdmin: cred.user.email === "mayanksonkar122@gmail.com",
        joinedDate: new Date().toLocaleDateString(),
        lastActiveDate: new Date().toLocaleDateString()
      };
      
      const claimRef = doc(db, 'usernames', finalUsername);
      await setDoc(claimRef, { uid: cred.user.uid, createdAt: new Date().toISOString() });
      
      await saveUserProfile(cred.user.uid, newProfile);
      setProfile(newProfile);
    } else {
      setProfile({
        ...fetched,
        uid: cred.user.uid
      });
    }
    setIsGuest(false);
  };

  const loginGuest = () => {
    setIsGuest(true);
    localStorage.setItem('STUDENT_HUB_AUTH_MODE', 'guest');
  };

  const logout = async () => {
    await signOut(auth);
    setIsGuest(false);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('STUDENT_HUB_AUTH_MODE');
  };

  const passwordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (isGuest) {
      const updated = { ...profile, ...details } as UserProfile;
      setProfile(updated);
      localStorage.setItem('STUDENT_HUB_PROFILE', JSON.stringify(updated));
    } else if (user) {
      if (details.username && profile && details.username.toLowerCase() !== profile.username.toLowerCase()) {
        const lowerUsername = details.username.toLowerCase();
        const usernameRef = doc(db, 'usernames', lowerUsername);
        const snap = await getDoc(usernameRef);
        if (snap.exists()) {
          throw new Error("Username already taken. Please choose another username.");
        }
        
        await setDoc(usernameRef, { uid: user.uid, createdAt: new Date().toISOString() });
        if (profile.username) {
          try {
            await deleteDoc(doc(db, 'usernames', profile.username.toLowerCase()));
          } catch (e) {
            console.warn("Could not delete old username claim", e);
          }
        }
      }
      await saveUserProfile(user.uid, details);
      setProfile(prev => prev ? { ...prev, ...details } : null);
    }
  };

  const handleUserActivity = async () => {
    if (!profile) return;
    
    // Use local Date to find today's string (YYYY-MM-DD)
    const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format reliably in modern browsers
    const lastActive = profile.lastActiveDate || '';
    
    let currentStreak = profile.streak || 0;
    let freezes = profile.streakFreezes ?? 1; 
    let history = profile.activityHistory || [];

    if (lastActive === today && history.includes(today)) {
      return; 
    }

    const lastDate = new Date(lastActive || today);
    const currDate = new Date(today);
    lastDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (lastActive === '') {
      currentStreak = 1;
    } else if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays === 2 && freezes > 0) {
      freezes -= 1;
      currentStreak += 1;
      // We don't have showToast here natively, so UI can just read the freeze updated if we wanted to.
    } else if (diffDays > 1) {
      currentStreak = 1;
    }

    if (!history.includes(today)) {
      history = [...history, today];
    }
    
    let newBadges = profile.badges ? [...profile.badges] : [];
    if (currentStreak >= 365 && !newBadges.includes('b-streak-365')) newBadges.push('b-streak-365');
    if (currentStreak >= 100 && !newBadges.includes('b-streak-100')) newBadges.push('b-streak-100');
    if (currentStreak >= 30 && !newBadges.includes('b-streak-30')) newBadges.push('b-streak-30');
    if (currentStreak >= 7 && !newBadges.includes('b-streak-7')) newBadges.push('b-streak-7');
    
    await updateProfileDetails({
      streak: currentStreak,
      lastActiveDate: today,
      streakFreezes: freezes,
      activityHistory: history,
      badges: newBadges
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, isGuest, loading, isAdmin,
      loginWithEmail, signUpWithEmail, signInWithGoogle, 
      loginGuest, logout, passwordReset, updateProfileDetails,
      handleUserActivity
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
