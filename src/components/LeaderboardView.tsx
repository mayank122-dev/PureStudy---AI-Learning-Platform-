import React, { useState } from 'react';
import { Award, Search, Trophy, Sparkles, Star, Flame, BookOpen, HelpCircle, GraduationCap, ChevronRight } from 'lucide-react';
import { LeaderboardEntry, UserProfile } from '../types';
import { INITIAL_LEADERBOARD, INITIAL_FORMULAS, INITIAL_QUIZZES } from '../data';

interface LeaderboardViewProps {
  userPoints: number;
  userStreak: number;
  currentUserProfile: any;
  usersList: UserProfile[];
  savedNotes: any[];
  savedDoubts: any[];
  onNavigate: (view: string) => void;
}

export default function LeaderboardView({
  userPoints,
  userStreak,
  currentUserProfile,
  usersList,
  savedNotes,
  savedDoubts,
  onNavigate
}: LeaderboardViewProps) {
  const [boardType, setBoardType] = useState<'weekly' | 'monthly'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');

  // Settle Dynamic Leaderboard data from real community accounts
  const baseLeaderboard: LeaderboardEntry[] = usersList && usersList.length > 0
    ? usersList.map(u => ({
        rank: 0,
        username: u.uid === currentUserProfile?.uid ? `${u.fullName || u.username} (You)` : (u.fullName || u.username),
        avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        points: u.points ?? 0,
        streak: u.streak ?? 0,
        isCurrentUser: u.uid === currentUserProfile?.uid
      }))
    : [
        {
          rank: 1,
          username: `${currentUserProfile?.fullName || currentUserProfile?.username || 'Student'} (You)`,
          avatarUrl: currentUserProfile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          points: userPoints,
          streak: userStreak,
          isCurrentUser: true
        },
        ...INITIAL_LEADERBOARD.map(l => ({ ...l, isCurrentUser: false }))
      ];

  // Dynamically recalculate rankings based on points
  const sortedLeaderboard = [...baseLeaderboard]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  const handleGlobalSearch = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: { type: string; title: string; desc: string; view: string }[] = [];

    // Search inside default Formulas
    INITIAL_FORMULAS.forEach((f) => {
      if (f.title.toLowerCase().includes(query) || f.formula.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)) {
        results.push({
          type: 'Formula',
          title: f.title,
          desc: `Equation: ${f.formula} (${f.category})`,
          view: 'formulas'
        });
      }
    });

    // Search inside quizzes
    INITIAL_QUIZZES.forEach((q) => {
      if (q.title.toLowerCase().includes(query) || q.subject.toLowerCase().includes(query)) {
        results.push({
          type: 'Quiz challenge',
          title: q.title,
          desc: `Difficulty: ${q.difficulty} (${q.subject})`,
          view: 'quizzes'
        });
      }
    });

    // Search inside savedNotes
    savedNotes.forEach((n) => {
      if (n.title.toLowerCase().includes(query) || n.topic.toLowerCase().includes(query) || n.subject.toLowerCase().includes(query)) {
        results.push({
          type: 'Compiled Notes',
          title: n.title,
          desc: `Compiled summary: ${n.summary.substring(0, 60)}...`,
          view: 'notes'
        });
      }
    });

    // Search inside savedDoubts (AI chats)
    savedDoubts.forEach((d) => {
      if (d.question.toLowerCase().includes(query) || d.answer.toLowerCase().includes(query)) {
        results.push({
          type: 'AI Doubt Resolution',
          title: d.question,
          desc: `Tutor answer: ${d.answer.replace(/[#*`]/g, '').substring(0, 60)}...`,
          view: 'doubt'
        });
      }
    });

    return results;
  };

  const globalResults = handleGlobalSearch();

  return (
    <div id="leaderboard-global-search-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* 2-Column: Global Search and Leaderboard lists */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Global Search across all curriculum resources block */}
        <div id="global-search-block" className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500 animate-pulse" />
              Resource Global Search
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-200">Query instantly across saved notes, graded quizzes, math/science formulas, and past AI advisor chats.</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Type to search curriculum resources... (e.g. 'quadratic', 'biology', 'formula')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-11 py-3 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          {searchQuery.trim() !== '' && (
            <div className="bg-slate-50/55 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-750 space-y-2 max-h-[300px] overflow-y-auto">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-gray-200 block mb-1">Search Results ({globalResults.length}) :</span>
              {globalResults.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-xs text-slate-500 dark:text-gray-200">No resources matched your search query. Try typing 'formula' or 'algebra'.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {globalResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => onNavigate(res.view)}
                      className="bg-white dark:bg-slate-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs group cursor-pointer transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                          {res.type}
                        </span>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-100 block">{res.title}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{res.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Classroom Rankings list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" />
                World-Wide Rankings
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-200">Grades are normalized according to active study achievements points.</p>
            </div>

            <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-700 p-0.5 rounded-lg border border-slate-100 dark:border-slate-650 text-xs">
              {(['weekly', 'monthly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setBoardType(type)}
                  className={`px-3 py-1 font-bold rounded-md uppercase tracking-wide cursor-pointer transition-all ${
                    boardType === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {sortedLeaderboard.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center space-y-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl p-6">
                <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-650" />
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Leaderboard is empty</span>
                  <span className="text-[11px] text-slate-400 block max-w-sm mx-auto leading-relaxed">
                    No active students recorded on the global standings yet. Be the first to earn points by checking off study planner tasks or completing graded quiz challenges!
                  </span>
                </div>
              </div>
            ) : (
              sortedLeaderboard.map((student) => (
                <div
                  key={student.rank}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    student.isCurrentUser
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500/40 ring-1 ring-indigo-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank identifier */}
                    <span className={`w-6 text-center font-extrabold text-sm ${
                      student.rank === 1 ? 'text-yellow-500' :
                      student.rank === 2 ? 'text-slate-400' :
                      student.rank === 3 ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      #{student.rank}
                    </span>

                    <img
                      src={student.avatarUrl}
                      alt={student.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100/40 dark:border-slate-700"
                      referrerPolicy="no-referrer"
                    />

                    <div>
                      <span className="font-bold text-slate-850 dark:text-white text-xs flex items-center gap-1.5">
                        {student.username}
                        {student.rank === 1 && <Sparkles className="w-3.5 h-3.5 text-yellow-500" />}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-gray-200 flex items-center gap-0.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        {student.streak} Days active streak
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs block">
                      {student.points} XP
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-gray-200 uppercase font-black tracking-wider block mt-0.5">milestones</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ranks analysis sidebar */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              Class Performance Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-200">Milestone parameters required to unlock elite school tiers.</p>
          </div>

          <div className="space-y-3 font-medium text-xs text-slate-600 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Novice Scholar</span>
              <span className="font-bold text-slate-900 dark:text-white">0 - 500 XP</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Achiever</span>
              <span className="font-bold text-slate-905 dark:text-white">500 - 1500 XP</span>
            </div>
            <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-bold">
              <span>Elite Consistency Star</span>
              <span>1500 - 3000 XP</span>
            </div>
            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-extrabold">
              <span>Consistency Master</span>
              <span>3000+ XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
