import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ChevronLeft, Shield, UserPlus, Users, Award, Flame, Calendar, BookOpen, Clock, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ShareProfileModal from './ShareProfileModal';

interface PublicProfileViewProps {
  user: UserProfile;
  onBack: () => void;
}

export default function PublicProfileView({ user, onBack }: PublicProfileViewProps) {
  const { user: currentUser } = useAuth();
  const [friendStatus, setFriendStatus] = useState<'none'|'pending'|'friends'>('none');
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  // Private profile check
  const isPrivate = user.preferences?.privacy?.profileVisibility === 'private' && currentUser?.uid !== user.uid;

  useEffect(() => {
    if (!currentUser || isPrivate || currentUser.uid === user.uid) {
      setLoading(false);
      return;
    }

    const checkFriendStatus = async () => {
      try {
        // Check if friends
        const friendRef = doc(db, `users/${currentUser.uid}/friends`, user.uid);
        const friendSnap = await getDoc(friendRef);
        if (friendSnap.exists()) {
          setFriendStatus('friends');
          return;
        }

        // Check if request sent
        const reqRef = doc(db, `users/${user.uid}/friendRequests`, currentUser.uid);
        const reqSnap = await getDoc(reqRef);
        if (reqSnap.exists()) {
          setFriendStatus('pending');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkFriendStatus();
  }, [currentUser, user.uid, isPrivate]);

  const handleSendRequest = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const reqRef = doc(db, `users/${user.uid}/friendRequests`, currentUser.uid);
      await setDoc(reqRef, {
        fromUserId: currentUser.uid,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setFriendStatus('pending');
    } catch (e) {
      console.error(e);
      alert("Failed to send request.");
    }
    setLoading(false);
  };

  if (isPrivate) {
    return (
      <div className="max-w-3xl mx-auto pb-24 md:pb-12 pt-4 px-2 md:px-0 animate-in fade-in flex flex-col h-screen md:h-auto">
         <div className="flex items-center gap-3 mb-6 px-2">
           <button onClick={onBack} className="p-2.5 bg-[#131825] border border-gray-800 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-white">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <h1 className="text-xl font-black text-white">Profile</h1>
         </div>
         <div className="bg-[#131825] rounded-3xl p-12 py-24 border border-gray-800 text-center">
            <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Private Profile</h2>
            <p className="text-gray-400">@{user.username} has set their profile to private.</p>
         </div>
      </div>
    );
  }

  const level = Math.floor((user.points || 0) / 100) + 1;

  return (
    <div className="max-w-3xl mx-auto pb-24 font-sans animate-in fade-in min-h-screen -mt-4 bg-[#0B0F19]">
      <div className="sticky top-0 z-20 bg-[#0B0F19]/90 backdrop-blur-xl pt-4 pb-2 px-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer ml-2">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-black text-white">{user.username}</h1>
        </div>
        <button 
          onClick={() => setShowShareModal(true)} 
          className="p-2 mr-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-hidden relative">
        {/* Banner */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-900 to-purple-900 relative">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        {/* Profile Content */}
        <div className="px-4 md:px-10 pb-8 relative">
           <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 md:-mt-16 mb-6 gap-4">
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
                 <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0B0F19] object-cover bg-[#1A2235] shadow-lg" referrerPolicy="no-referrer" />
                 <div className="pb-1 mt-2 md:mt-0">
                    <div className="flex items-center gap-2 mb-0.5">
                       <h1 className="text-2xl font-black text-white tracking-tight">{user.fullName || user.username}</h1>
                       {user.isAdmin && (
                         <div className="text-indigo-400" title="Admin">
                           <Shield className="w-5 h-5" />
                         </div>
                       )}
                    </div>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                 </div>
              </div>
              
              <div className="flex pt-2 md:pt-0">
                {currentUser?.uid !== user.uid && currentUser && (
                  <button 
                    disabled={loading || friendStatus !== 'none'}
                    onClick={handleSendRequest}
                    className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {friendStatus === 'none' && <><UserPlus className="w-5 h-5"/> Add Friend</>}
                    {friendStatus === 'pending' && <><Clock className="w-5 h-5"/> Request Sent</>}
                    {friendStatus === 'friends' && <><Users className="w-5 h-5"/> Friends</>}
                  </button>
                )}
              </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#131825] rounded-2xl p-4 border border-gray-800/60 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center mb-2 text-orange-500">
                    <Flame className="w-4 h-4" />
                 </div>
                 <span className="text-xl font-black text-white leading-none mb-1">{user.streak || 0}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Day Streak</span>
              </div>
              
              <div className="bg-[#131825] rounded-2xl p-4 border border-gray-800/60 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2 text-indigo-400">
                    <Award className="w-4 h-4" />
                 </div>
                 <span className="text-xl font-black text-white leading-none mb-1">Lvl {level}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Level</span>
              </div>
              
              <div className="bg-[#131825] rounded-2xl p-4 border border-gray-800/60 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 text-emerald-400">
                    <Calendar className="w-4 h-4" />
                 </div>
                 <span className="text-[13px] font-black text-white leading-tight mb-1">{user.joinedDate || 'Recently'}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Joined</span>
              </div>

              <div className="bg-[#131825] rounded-2xl p-4 border border-gray-800/60 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 text-blue-400">
                    <BookOpen className="w-4 h-4" />
                 </div>
                 <span className="text-lg font-black text-white leading-none mb-1 truncate px-1 w-full">{user.grade || 'N/A'}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Class</span>
              </div>
           </div>

           {/* Details */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-[#131825] border border-gray-800/60 rounded-2xl p-5 shadow-sm">
                   <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Bio</h3>
                   <p className="text-gray-300 font-medium text-sm leading-relaxed">
                     {user.school ? `Studying at ${user.school}` : 'This user prefers to keep an air of mystery about them.'}
                   </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#131825] border border-gray-800/60 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                   <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Favorite Subject</h3>
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5" />
                     </div>
                     <span className="text-white font-bold text-sm tracking-tight">{user.preferences?.favoriteSubject || 'Not Set'}</span>
                   </div>
                </div>
              </div>
           </div>

        </div>
      </div>

      {showShareModal && (
        <ShareProfileModal 
          username={user.username} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
}
