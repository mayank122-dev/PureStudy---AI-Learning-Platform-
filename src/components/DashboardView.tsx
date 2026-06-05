import React from 'react';
import { motion } from 'motion/react';
import { 
  Flame, Clock, Trophy, BookOpen, Award, CheckCircle2, 
  ChevronRight, Check, Sparkles, FileText, Calendar, 
  TrendingUp, Zap, Target, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ALL_BADGES } from '../data';
import { QuizAttempt, Badge } from '../types';

const ICON_MAP: Record<string, any> = {
  'Flame': Flame,
  'Award': Award,
  'Trophy': Trophy,
  'BookOpen': BookOpen,
  'Crown': Crown
};

interface DashboardViewProps {
  streak: number;
  studyMinutes: number;
  quizzesCompleted: number;
  notesCreatedLength: number;
  quizHistory: QuizAttempt[];
  onNavigate: (view: string) => void;
}

export default function DashboardView({
  streak,
  studyMinutes,
  quizzesCompleted,
  notesCreatedLength,
  quizHistory,
  onNavigate
}: DashboardViewProps) {
  
  const { profile, updateProfileDetails } = useAuth();

  const totalAccuracy = quizHistory.length > 0 
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.accuracy, 0) / quizHistory.length) 
    : 0;

  const quickActions = [
    { id: 'doubt', label: 'AI Doubt Solver', icon: Sparkles, color: 'from-violet-500 to-fuchsia-500', shadow: 'shadow-violet-500/30' },
    { id: 'quizzes', label: 'Daily Quiz', icon: Zap, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30' },
    { id: 'board', label: 'Board Resources', icon: BookOpen, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/30' },
    { id: 'notes', label: 'Create Note', icon: FileText, color: 'from-indigo-500 to-cyan-500', shadow: 'shadow-indigo-500/30' }
  ];

  const generateRoadmap = () => {
    const steps = [];
    
    if (notesCreatedLength > 0) {
      steps.push({
        id: 'r1',
        title: 'Review Recent Notes',
        desc: 'Go over the notes you previously generated to refresh your memory.',
        action: 'View Notes',
        route: 'notes',
        icon: FileText,
        color: 'from-blue-500 to-cyan-500'
      });
    } else {
      steps.push({
        id: 'r1',
        title: 'Generate First Study Note',
        desc: 'Use AI to create a structured note on a topic you want to learn.',
        action: 'Create Note',
        route: 'notes',
        icon: Sparkles,
        color: 'from-blue-500 to-cyan-500'
      });
    }

    const weakQuiz = quizHistory.find(q => (q.score / q.totalQuestions) <= 0.7);
    if (weakQuiz) {
      steps.push({
        id: 'r2',
        title: `Revisit: ${weakQuiz.quizTitle}`,
        desc: `You scored ${Math.round((weakQuiz.score / weakQuiz.totalQuestions) * 100)}% last time. Let's improve it!`,
        action: 'Retake Quiz',
        route: 'quizzes',
        icon: Target,
        color: 'from-rose-500 to-orange-500'
      });
    } else if (quizzesCompleted > 0) {
      steps.push({
        id: 'r2',
        title: 'Take A New Challenge',
        desc: 'Keep up the good work! Try a new quiz to expand your knowledge.',
        action: 'Explore Quizzes',
        route: 'quizzes',
        icon: Zap,
        color: 'from-amber-400 to-orange-500'
      });
    } else {
      steps.push({
        id: 'r2',
        title: 'Test Your Knowledge',
        desc: 'Take your very first practice quiz to assess your baseline.',
        action: 'Start Quiz',
        route: 'quizzes',
        icon: CheckCircle2,
        color: 'from-emerald-400 to-teal-500'
      });
    }

    // No deep focus session
    return steps;
  };

  const roadmapSteps = generateRoadmap();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20 mt-2 font-sans"
    >
      
      {/* 1. Welcome & Motivational Quote */}
      <motion.div variants={itemVariants} className="px-1 space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1 rounded-xl text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
           <BookOpen className="w-3.5 h-3.5" />
           {profile?.board || 'Standard'} • Class {profile?.classLevel || '10'} • {profile?.medium || 'English Medium'}
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Ready to learn? 🚀
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-gray-200">
          "The expert in anything was once a beginner."
        </p>
      </motion.div>

      {/* 2. Study Progress Cards (Scrollable on mobile) */}
      <motion.div variants={itemVariants} className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x hide-scrollbar">
        
        {/* Streak Card */}
        <div className="snap-start shrink-0 w-64 bg-gradient-to-br from-orange-500 to-amber-500 p-5 rounded-3xl text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-30">
            <Flame strokeWidth={1} className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">Daily Streak</span>
          </div>
          <div className="relative z-10">
            <span className="text-5xl font-black block leading-none">{streak}</span>
            <span className="text-gray-200 text-sm font-medium mt-1 block">days straight</span>
          </div>
        </div>

        {/* Study Time Card */}
        <div className="snap-start shrink-0 w-64 bg-gradient-to-br from-violet-600 to-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-30">
            <Clock strokeWidth={1} className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">Study Time</span>
          </div>
          <div className="relative z-10">
            <span className="text-5xl font-black block leading-none">{studyMinutes}</span>
            <span className="text-gray-200 text-sm font-medium mt-1 block">minutes total</span>
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="snap-start shrink-0 w-64 bg-gradient-to-br from-emerald-500 to-teal-500 p-5 rounded-3xl text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-30">
            <Target strokeWidth={1} className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">Avg Accuracy</span>
          </div>
          <div className="relative z-10">
            <span className="text-5xl font-black block leading-none">{totalAccuracy}%</span>
            <span className="text-gray-200 text-sm font-medium mt-1 block">in quizzes</span>
          </div>
        </div>

      </motion.div>

      {/* 3. Quick Actions Grid */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400 px-1">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg ${action.shadow} group-hover:scale-105 active:scale-95 transition-all`}>
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-gray-100 text-center leading-tight">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* 4. Study Roadmap */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400 px-1">Today's Study Roadmap</h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="space-y-6 relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-gray-800" />
            
            {roadmapSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative z-10 flex items-start gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                     <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="pt-1 w-full">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mb-3">{step.desc}</p>
                    <button 
                      onClick={() => onNavigate(step.route)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer w-max"
                    >
                      {step.action} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 5. Daily Challenge / Activity */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="w-24 h-24 text-amber-500" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/30 shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-0.5">Daily Challenge</span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">Take a practice quiz</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-200 font-medium">Earn +50 XP and unlock the Quiz Champ badge.</p>
            <button 
              onClick={() => onNavigate('quizzes')}
              className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            >
               Start Quiz <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 6. Study Streak History */}
      <motion.div variants={itemVariants} className="space-y-3 pb-2">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400 px-1">Study Streak</h3>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-slate-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" /> {streak} Days
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep it burning 🔥</p>
            </div>
            {profile?.streakFreezes ? (
              <div className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-3 py-1.5 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-1.5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest">Freezes</span>
                <span className="font-extrabold text-sm">{profile.streakFreezes}</span>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* 7. Earned Badges */}
      {profile?.badges && profile.badges.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3 pb-8">
          <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400 px-1">Earned Badges</h3>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x hide-scrollbar">
            {profile.badges.map(badgeId => {
              const b = ALL_BADGES.find(x => x.id === badgeId);
              if (!b) return null;
              const Icon = ICON_MAP[b.iconName] || Trophy;
              return (
                <div key={b.id} className="snap-start shrink-0 w-48 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${b.colorClass} shadow-lg`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-1">{b.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{b.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 8. Recent Achievements Summary */}
      <motion.div variants={itemVariants} className="space-y-3 pb-8">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400 px-1">Recent Activity</h3>
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 flex flex-col justify-center shadow-sm">
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">Notes Created</span>
             <span className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
               {notesCreatedLength}
             </span>
           </div>
           <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 flex flex-col justify-center shadow-sm">
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">Quizzes Taken</span>
             <span className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
               {quizzesCompleted}
             </span>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

