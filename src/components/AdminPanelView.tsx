import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, FileText, Bell, BarChart2, Trash2, Plus, 
  Save, AlertTriangle, ShieldCheck, CheckCircle, Clock 
} from 'lucide-react';
import { 
  getGlobalQuizzes, saveGlobalQuiz, deleteGlobalQuiz, 
  getAllUserProfiles, saveUserProfile 
} from '../firebaseService';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, getDocs, doc, setDoc, deleteDoc, query 
} from 'firebase/firestore';
import { UserProfile, Quiz, GeneratedNote, NotificationItem } from '../types';

export default function AdminPanelView() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'quizzes' | 'notifications'>('analytics');
  
  // States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  const [doubtsCount, setDoubtsCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form Fields for Add Quiz
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Science');
  const [quizDiff, setQuizDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quizMins, setQuizMins] = useState(15);
  const [quizQuestions, setQuizQuestions] = useState<{ text: string; options: string[]; correctIndex: number; explanation: string }[]>([
    { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
  ]);

  // Form Fields for Notification Message
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('announcement');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Users
      const uProfiles = await getAllUserProfiles();
      setUsers(uProfiles || []);

      // 2. Fetch Quizzes
      const gQuizzes = await getGlobalQuizzes();
      setQuizzes(gQuizzes || []);

      // 3. Fetch Platform statistics (Notes & Doubts counts)
      const usersSnap = await getDocs(collection(db, 'users'));
      let notesAccum = 0;
      let doubtsAccum = 0;
      
      for (const uDoc of usersSnap.docs) {
        const notesSeq = await getDocs(collection(db, 'users', uDoc.id, 'notes'));
        notesAccum += notesSeq.size;
        
        const doubtsSeq = await getDocs(collection(db, 'users', uDoc.id, 'doubts'));
        doubtsAccum += doubtsSeq.size;
      }
      setNotesCount(notesAccum);
      setDoubtsCount(doubtsAccum);

      // 4. Fetch Global Notifications
      const nSnap = await getDocs(collection(db, 'notifications'));
      const nList: NotificationItem[] = [];
      nSnap.forEach(d => {
        nList.push(d.data() as NotificationItem);
      });
      setNotifications(nList);

    } catch (err) {
      console.error(err);
      showToast('Error loading administrative records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Make user Admin or revoke
  const handleToggleAdminStatus = async (userProfile: UserProfile) => {
    if (!userProfile.uid) return;
    const nextAdmin = !userProfile.isAdmin;
    try {
      await saveUserProfile(userProfile.uid, { isAdmin: nextAdmin });
      setUsers(prev => prev.map(u => u.uid === userProfile.uid ? { ...u, isAdmin: nextAdmin } : u));
      showToast(`Successfully updated Admin settings for ${userProfile.fullName || userProfile.username}`);
    } catch (err) {
      console.error(err);
      showToast('Action forbidden by Firestore Security Rules.');
    }
  };

  // Broadcast Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    const notifPath = `notifications`;
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      read: false,
      createdAt: new Date().toLocaleDateString()
    };

    try {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      setNotifications(prev => [newNotif, ...prev]);
      setNotifTitle('');
      setNotifMessage('');
      showToast('Global notification broadcasted successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${notifPath}/${newNotif.id}`);
    }
  };

  // Delete Notification
  const handleDeleteNotification = async (id: string) => {
    const notifPath = `notifications/${id}`;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Announcement removed.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, notifPath);
    }
  };

  // Manage Quiz Question entries
  const handleQuestionFieldChange = (index: number, key: string, value: any) => {
    setQuizQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        return { ...q, [key]: value };
      }
      return q;
    }));
  };

  const handleOptionFieldChange = (qIdx: number, optIdx: number, value: string) => {
    setQuizQuestions(prev => prev.map((q, i) => {
      if (i === qIdx) {
        const nextOpts = [...q.options];
        nextOpts[optIdx] = value;
        return { ...q, options: nextOpts };
      }
      return q;
    }));
  };

  const handleAddQuestionSlot = () => {
    setQuizQuestions(prev => [
      ...prev,
      { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    ]);
  };

  const handleAddQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || quizQuestions.some(q => !q.text)) {
      showToast('Please fill in Quiz title and all question texts.');
      return;
    }

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: quizTitle,
      subject: quizSubject,
      difficulty: quizDiff,
      durationMinutes: quizMins,
      questions: quizQuestions.map((q, idx) => ({ ...q, id: `q-${idx}` }))
    };

    try {
      await saveGlobalQuiz(newQuiz);
      setQuizzes(prev => [newQuiz, ...prev]);
      setQuizTitle('');
      setQuizQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
      showToast('New platform quiz added successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to write global quiz.');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteGlobalQuiz(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      showToast('Global quiz removed.');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete global quiz.');
    }
  };

  return (
    <div id="admin-panel-root" className="space-y-6 pb-12 animate-fade-in font-sans">
      
      {/* Toast Notification Header Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-55 max-w-sm px-4 py-3 bg-violet-950 border border-violet-500/30 text-violet-300 text-xs rounded-xl shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            Administrative Operator Panel
          </h2>
          <p className="text-xs text-slate-400">Strictly isolated database metrics, academic material controls, and broadcast managers.</p>
        </div>
        <button 
          onClick={loadAdminData}
          disabled={isLoading}
          className="px-4 py-2 bg-white/5 border border-slate-800 hover:bg-white/10 text-slate-100 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Syncing Base...' : 'Sync Database Records'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${activeTab === 'analytics' ? 'bg-violet-600/10 border-t-2 border-l border-r border-slate-800 border-t-violet-500 text-violet-300' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4" />
            Analytics & Logs
          </div>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${activeTab === 'users' ? 'bg-violet-600/10 border-t-2 border-l border-r border-slate-800 border-t-violet-500 text-violet-300' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Manage Students ({users.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${activeTab === 'quizzes' ? 'bg-violet-600/10 border-t-2 border-l border-r border-slate-800 border-t-violet-500 text-violet-300' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4" />
            Academic Quizzes ({quizzes.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${activeTab === 'notifications' ? 'bg-violet-600/10 border-t-2 border-l border-r border-slate-800 border-t-violet-500 text-violet-300' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            Portal Broadcasts
          </div>
        </button>
      </div>

      {/* ANALYTICS SECTION */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-slate-450 uppercase block">Registered Users</span>
              <span className="text-3xl font-black text-white">{users.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-slate-450 uppercase block">Total Generated Notes</span>
              <span className="text-3xl font-black text-violet-400">{notesCount}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-slate-450 uppercase block">Resolved Doubts</span>
              <span className="text-3xl font-black text-indigo-400">{doubtsCount}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-slate-450 uppercase block">Active Quizzes</span>
              <span className="text-3xl font-black text-emerald-400">{quizzes.length}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              Platform Overview
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold pb-2">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">Grade</th>
                    <th className="pb-3 pr-4">Points</th>
                    <th className="pb-3 pr-4">Streak</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {users.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-slate-250 flex items-center gap-2">
                        <img src={item.avatarUrl} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <span>{item.fullName || item.username}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400">{item.grade}</td>
                      <td className="py-3 pr-4 font-bold text-indigo-455 text-indigo-400">{item.points} XP</td>
                      <td className="py-3 pr-4 text-amber-500 font-semibold">{item.streak} 🔥</td>
                      <td className="py-3">
                        {item.isAdmin ? (
                          <span className="px-2 py-0.5 bg-violet-950 text-violet-400 border border-violet-800/30 font-bold rounded-lg text-[10px]">ADMIN</span>
                        ) : (
                          <span className="text-slate-500">Student</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">No student records synced yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS ACCOUNT SETTINGS TAB */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Student Accreditations</h3>
          <div className="space-y-4">
            {users.map((profile, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950/80 border border-slate-850 rounded-xl gap-4">
                <div className="flex gap-3">
                  <img src={profile.avatarUrl} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {profile.fullName || 'Unnamed Student'}
                      <span className="text-[10px] text-slate-400">(@{profile.username})</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{profile.grade} {profile.school ? `(${profile.school})` : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAdminStatus(profile)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${profile.isAdmin ? 'bg-red-950 border border-red-800/20 text-red-400 hover:bg-red-900/30' : 'bg-violet-900/40 hover:bg-violet-800 border border-violet-800/20 text-violet-300'}`}
                  >
                    {profile.isAdmin ? 'Revoke Admin' : 'Make Administrator'}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No users found.</p>
            )}
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Create Quiz Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-violet-400" />
              Configure Academic Quiz
            </h3>
            <form onSubmit={handleAddQuizSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Quiz Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Newton's Laws of Motion"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Subject</label>
                  <select 
                    value={quizSubject}
                    onChange={e => setQuizSubject(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option>Science</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                    <option>Biology</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Difficulty</label>
                  <select 
                    value={quizDiff}
                    onChange={e => setQuizDiff(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Minutes</label>
                  <input 
                    type="number" 
                    value={quizMins}
                    onChange={e => setQuizMins(Number(e.target.value))}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              {/* Questions Area */}
              <div className="space-y-4 pt-1.5 border-t border-slate-800 max-h-[280px] overflow-y-auto pr-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-violet-300">Question Slots ({quizQuestions.length})</span>
                  <button 
                    type="button"
                    onClick={handleAddQuestionSlot}
                    className="text-[10px] font-bold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded"
                  >
                    + Add Question
                  </button>
                </div>

                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-2 relative">
                    <span className="text-[10px] font-black absolute top-2 right-3 text-slate-500">#{idx + 1}</span>
                    <div>
                      <label className="text-[10px] text-slate-450 uppercase block mb-1">Question Text</label>
                      <input 
                        type="text"
                        required
                        placeholder="What state is..."
                        value={q.text}
                        onChange={e => handleQuestionFieldChange(idx, 'text', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx}>
                          <label className="text-[9px] text-slate-500 block">Option {optIdx + 1}</label>
                          <input 
                            type="text"
                            required
                            placeholder="Option value"
                            value={opt}
                            onChange={e => handleOptionFieldChange(idx, optIdx, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-white"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[9px] text-slate-500 block">Correct Option Index (0-3)</label>
                        <select
                          value={q.correctIndex}
                          onChange={e => handleQuestionFieldChange(idx, 'correctIndex', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-white"
                        >
                          <option value={0}>Option 1</option>
                          <option value={1}>Option 2</option>
                          <option value={2}>Option 3</option>
                          <option value={3}>Option 4</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">Explanation</label>
                        <input 
                          type="text"
                          placeholder="Because..."
                          value={q.explanation}
                          onChange={e => handleQuestionFieldChange(idx, 'explanation', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Publish Global Quiz
              </button>
            </form>
          </div>

          {/* List existing quizzes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h3 className="font-bold text-white text-base">Active Quizzes Library</h3>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
              {quizzes.map((qz, i) => (
                <div key={i} className="p-3 bg-slate-950/85 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{qz.title}</h4>
                    <span className="text-[10px] bg-indigo-950 text-indigo-400 font-bold px-1.5 py-0.5 rounded mr-1.5">{qz.subject}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{qz.difficulty} • {qz.questions.length} questions • {qz.durationMinutes} mins</span>
                  </div>

                  <button 
                    onClick={() => handleDeleteQuiz(qz.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {quizzes.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No custom quizzes uploaded yet.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create banner form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in">
            <h3 className="font-bold text-white text-base flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-violet-400" />
              Configure System-wide Broadcaster
            </h3>
            <form onSubmit={handleSendNotification} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Announcement Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Schedule Maintenance, Achievement Unlocked"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Select Banner Accent Motif</label>
                <select 
                  value={notifType} 
                  onChange={e => setNotifType(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="announcement">Announcement (Indigo Accent)</option>
                  <option value="success">Success / Reward (Emerald Accent)</option>
                  <option value="warning">Alert / Alert (Amber Accent)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell students about new resources or server deployments..."
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Broadcast System-wide
              </button>
            </form>
          </div>

          {/* List Broadcasts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 animate-fade-in">
            <h3 className="font-bold text-white text-base">Broadcast History</h3>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
              {notifications.map((nt, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${nt.type === 'warning' ? 'bg-amber-500' : nt.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      {nt.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{nt.message}</p>
                    <span className="text-[9px] text-slate-500 block">{nt.createdAt}</span>
                  </div>

                  <button 
                    onClick={() => handleDeleteNotification(nt.id)}
                    className="p-1 px-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10 cursor-pointer transition shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No previous notifications on file.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
