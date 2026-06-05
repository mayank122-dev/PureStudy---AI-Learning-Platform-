import React, { useState, useEffect } from 'react';
import { Search, User, Shield, Award, Users, ChevronLeft, Calendar, UserPlus, Check, X } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import PublicProfileView from './PublicProfileView';
import { useAuth } from '../context/AuthContext';

interface GlobalSearchViewProps {
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export default function GlobalSearchView({ onClose, onNavigate }: GlobalSearchViewProps) {
  const { isGuest, user: currentUser, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!currentUser || isGuest) return;
    
    // Fetch friends and requests
    const fetchFriendsData = async () => {
      try {
        const friendsRef = collection(db, `users/${currentUser.uid}/friends`);
        const fSnap = await getDocs(friendsRef);
        
        const reqRef = collection(db, `users/${currentUser.uid}/friendRequests`);
        const rSnap = await getDocs(reqRef);
        
        const fids = fSnap.docs.map(d => d.id);
        const rids = rSnap.docs.map(d => d.id);
        
        const fetchProfiles = async (ids: string[]) => {
          const profiles: UserProfile[] = [];
          for (const chunk of chunkArray(ids, 10)) {
            const q = query(collection(db, 'users'), where('uid', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(d => profiles.push(d.data() as UserProfile));
          }
          return profiles;
        };

        if (fids.length > 0) setFriends(await fetchProfiles(fids));
        if (rids.length > 0) setRequests(await fetchProfiles(rids));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFriendsData();
  }, [currentUser, isGuest]);

  const chunkArray = (arr: any[], size: number) => {
    let result = [];
    for(let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const handleAcceptRequest = async (uid: string) => {
    if (!currentUser) return;
    try {
       await setDoc(doc(db, `users/${currentUser.uid}/friends`, uid), { friendId: uid, addedAt: new Date().toISOString() });
       await setDoc(doc(db, `users/${uid}/friends`, currentUser.uid), { friendId: currentUser.uid, addedAt: new Date().toISOString() });
       await deleteDoc(doc(db, `users/${currentUser.uid}/friendRequests`, uid));
       
       const acceptedUser = requests.find(r => r.uid === uid);
       if (acceptedUser) setFriends(prev => [...prev, acceptedUser]);
       setRequests(prev => prev.filter(r => r.uid !== uid));
    } catch(e) {
      console.error(e);
    }
  };

  const handleRejectRequest = async (uid: string) => {
    if (!currentUser) return;
    try {
       await deleteDoc(doc(db, `users/${currentUser.uid}/friendRequests`, uid));
       setRequests(prev => prev.filter(r => r.uid !== uid));
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async (queryText: string) => {
    if (!queryText.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    
    if (isGuest) {
      // Don't alert repeatedly, just return empty state
      return;
    }

    setLoading(true);
    setSearched(true);
    const qStr = queryText.trim().toLowerCase();

    try {
      const usersRef = collection(db, 'users');
      const { orderBy, startAt, endAt, limit } = await import('firebase/firestore');
      
      // We can query users directly now since we removed the restrictive list rule for queries
      // Search by username prefix
      const usernameQ = query(
        usersRef,
        orderBy('username'),
        startAt(qStr),
        endAt(qStr + '\uf8ff'),
        limit(20)
      );
      
      const snap = await getDocs(usernameQ);
      const found: UserProfile[] = [];
      const seenIds = new Set<string>();

      snap.forEach(doc => {
        const u = doc.data() as UserProfile;
        const visibility = u.preferences?.privacy?.profileVisibility || 'public';
        // Only public profiles 
        if (visibility === 'public') {
          found.push(u);
          seenIds.add(u.uid);
        }
      });

      // Also search by exact full name just in case
      try {
        const nameQ = query(usersRef, where('fullName', '==', queryText.trim()), limit(10));
        const nameSnap = await getDocs(nameQ);
        nameSnap.forEach(doc => {
          const u = doc.data() as UserProfile;
          if (!seenIds.has(u.uid)) {
            const visibility = u.preferences?.privacy?.profileVisibility || 'public';
            if (visibility === 'public') {
              found.push(u);
            }
          }
        });
      } catch (e) {
        console.warn("Full name search index might be missing, skipping", e);
      }

      // Sort results: Exact match first, then by popularity (points)
      found.sort((a, b) => {
         const aExact = a.username.toLowerCase() === qStr ? 1 : 0;
         const bExact = b.username.toLowerCase() === qStr ? 1 : 0;
         if (aExact !== bExact) return bExact - aExact;
         
         const aPoints = a.points || 0;
         const bPoints = b.points || 0;
         return bPoints - aPoints;
      });

      setResults(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      alert("Please sign in to search for users.");
      return;
    }
    performSearch(searchQuery);
  };

  if (selectedUser) {
    return <PublicProfileView user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 font-sans animate-in fade-in h-screen md:h-auto flex flex-col -mt-4">
       <div className="sticky top-0 z-10 bg-[#0B0F19]/90 backdrop-blur-xl pt-4 pb-2 px-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]">
           <form onSubmit={handleSearchForm} className="relative flex items-center gap-3">
             <button type="button" onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
               <ChevronLeft className="w-6 h-6" />
             </button>
             <div className="relative flex-1">
               <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search users..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full bg-[#131825] border border-gray-800 text-white rounded-full pl-11 pr-4 py-3 text-base outline-none focus:border-indigo-500/50 focus:bg-[#1A2235] transition-all shadow-inner"
                 autoFocus
               />
               {searchQuery && (
                 <button type="submit" disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2">
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <Search className="w-5 h-5 text-indigo-400" />
                   )}
                 </button>
               )}
             </div>
           </form>
       </div>

       <div className="px-4 mt-6 flex-1">
          {loading && results.length === 0 && (
             <div className="flex flex-col items-center justify-center pt-24 text-gray-500 gap-4">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
             </div>
          )}

          {!loading && !searched && requests.length > 0 && (
             <div className="mb-8">
               <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 px-1">Pending Requests</h3>
               <div className="space-y-3">
                 {requests.map(req => (
                   <div key={req.uid} className="bg-[#131825] border border-gray-800/60 p-3 rounded-2xl flex items-center justify-between shadow-sm">
                     <button onClick={() => setSelectedUser(req)} className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0">
                        <img src={req.avatarUrl} alt={req.username} className="w-12 h-12 rounded-full object-cover border-2 border-transparent" referrerPolicy="no-referrer" />
                        <div className="min-w-0 flex-1 truncate">
                           <div className="flex items-center gap-1.5 truncate">
                              <h4 className="text-white font-bold truncate tracking-tight">{req.fullName || req.username}</h4>
                              {req.isAdmin && <Shield className="w-3 h-3 text-indigo-400 shrink-0" />}
                           </div>
                           <p className="text-gray-400 text-[13px]">@{req.username}</p>
                        </div>
                     </button>
                     <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
                        <button onClick={() => handleAcceptRequest(req.uid)} className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-full transition-colors">
                           <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRejectRequest(req.uid)} className="p-2.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-colors">
                           <X className="w-5 h-5" />
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {!loading && !searched && friends.length > 0 && (
             <div>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Friends</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {friends.map(friend => (
                   <button 
                     key={friend.uid}
                     onClick={() => setSelectedUser(friend)}
                     className="bg-[#131825] hover:bg-[#1A2235] border border-gray-800/50 p-3.5 rounded-2xl flex items-center gap-3 transition-colors text-left shadow-sm"
                   >
                      <img src={friend.avatarUrl} alt={friend.username} className="w-12 h-12 rounded-full object-cover border border-gray-700/50" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1 truncate">
                         <div className="flex items-center gap-1.5 truncate">
                            <h4 className="text-white font-bold text-sm truncate tracking-tight">{friend.fullName || friend.username}</h4>
                            {friend.isAdmin && <Shield className="w-3 h-3 text-indigo-400 shrink-0" />}
                         </div>
                         <p className="text-gray-500 text-[13px]">@{friend.username}</p>
                      </div>
                   </button>
                 ))}
               </div>
             </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-24 text-center px-4">
               <div className="w-20 h-20 bg-gray-800/30 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-800/50">
                  <User className="w-8 h-8 text-gray-500" />
               </div>
               <h3 className="text-lg font-bold text-white mb-2">No users found</h3>
               <p className="text-gray-400 text-sm">We couldn't find anyone matching that name.</p>
            </div>
          )}

          {!loading && searched && results.length > 0 && (
             <div className="space-y-4">
               {results.map(user => (
                 <button 
                   key={user.uid}
                   onClick={() => setSelectedUser(user)}
                   className="w-full bg-transparent hover:bg-[#131825] p-3 rounded-2xl flex items-center justify-between transition-colors text-left group"
                 >
                   <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative shrink-0">
                         <img src={user.avatarUrl} alt={user.username} className="w-14 h-14 rounded-full object-cover border border-gray-700 shadow-sm" referrerPolicy="no-referrer" />
                         {user.streak > 0 && (
                           <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-700 shadow-sm">
                             <div className="bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-black text-white">
                               {user.streak}
                             </div>
                           </div>
                         )}
                      </div>
                      <div className="min-w-0 flex-1 truncate pr-2">
                         <div className="flex items-center gap-1.5 mb-1 truncate">
                            <h4 className="text-white font-bold tracking-tight truncate">{user.fullName || user.username}</h4>
                            {user.isAdmin && <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                         </div>
                         <p className="text-gray-400 text-[13px] truncate">
                            @{user.username} {user.grade && <span className="mx-1.5 opacity-50">•</span>} {user.grade}
                         </p>
                      </div>
                   </div>
                 </button>
               ))}
             </div>
          )}
       </div>
    </div>
  );
}
