import React, { useState, useEffect } from 'react';
import { Trophy, HelpCircle, Clock, CheckCircle2, ArrowRight, BookOpen, Star, Play, Award, RotateCcw, Crosshair, X, Loader2, Sparkles, Languages, Settings2, Target, Search } from 'lucide-react';
import { Quiz, QuizAttempt } from '../types';
import { useAuth } from '../context/AuthContext';

import { getSubjects } from '../lib/subjectData';

interface QuizCenterViewProps {
  quizHistory: QuizAttempt[];
  onAddQuizAttempt: (attempt: QuizAttempt) => void;
  awardPoints: (pts: number) => void;
  trackMinutesStudied: (minutes: number) => void;
  onShowToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export default function QuizCenterView({
  quizHistory,
  onAddQuizAttempt,
  awardPoints,
  trackMinutesStudied,
  onShowToast
}: QuizCenterViewProps) {
  const { profile } = useAuth();
  // State for generator
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi'>(profile?.preferences?.language || 'English');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [chapterName, setChapterName] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Medium');
  const [selectedType, setSelectedType] = useState<string>('Practice Quiz');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Game state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  // Timer settings
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizTimerId, setQuizTimerId] = useState<NodeJS.Timeout | null>(null);

  // Completed results show panel
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);

  // Mobile segments
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  const subjects = getSubjects(profile?.board || 'CBSE', profile?.classLevel || '10', profile?.medium || 'English Medium');
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const quizTypes = ['Practice Quiz', 'Chapter-wise Quiz', 'Subject-wise Quiz', 'Mock Tests', 'Daily Quiz Challenge', 'Weekly Challenge'];

  const formatTimerValue = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle active countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeQuiz && !hasSubmittedAnswer && timerEnabled) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleOptionSelect(0); // auto select first option on timeout (safeguard)
            handleSubmitAnswer();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
      setQuizTimerId(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeQuiz, currentQuestionIndex, hasSubmittedAnswer]);

  const generateAndStartQuiz = async () => {
    setIsGenerating(true);
    setCompletedAttempt(null);
    try {
      const resp = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: selectedSubject,
          chapter: chapterName,
          difficulty: selectedDifficulty,
          language: selectedLanguage,
          type: selectedType,
          count: questionCount,
          board: profile?.board,
          classLevel: profile?.classLevel,
          medium: profile?.medium
        })
      });
      if (!resp.ok) {
        const contentType = resp.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           const errData = await resp.json();
           throw new Error(errData.error || "Failed to generate quiz.");
        }
        throw new Error("Failed to generate quiz in the server.");
      }
      
      let data;
      try {
         data = await resp.json();
      } catch (parseErr) {
         throw new Error("Received an invalid response from the server. Please try again.");
      }
      if (!data.questions || data.questions.length === 0) {
         throw new Error("The AI returned an empty quiz. Please try again.");
      }

      // Map dynamic AI result to our UI Quiz structure
      const newQuiz: Quiz = {
        id: `ai-quiz-${Date.now()}`,
        title: data.title || `${selectedType}: ${selectedSubject}`,
        subject: selectedSubject,
        difficulty: selectedDifficulty as 'Easy' | 'Medium' | 'Hard',
        durationMinutes: Math.round(data.questions.length * 1.5), // 1.5 min per question approx
        questions: data.questions,
      };

      setActiveQuiz(newQuiz);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
      setCorrectCount(0);
      setSecondsRemaining(timerEnabled ? newQuiz.durationMinutes * 60 : 9999);
      setTimeSpent(0);
      onShowToast?.(`Quiz generated successfully!`, 'success');
      
    } catch (err: any) {
      console.error(err);
      onShowToast?.(err.message || 'Error generating quiz.', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedOption(optionIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasSubmittedAnswer) return;
    setHasSubmittedAnswer(true);

    const isCorrect = selectedOption === activeQuiz?.questions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
      setSecondsRemaining(timerEnabled ? activeQuiz.durationMinutes * 20 : 9999); // reset sub-timer slightly
    } else {
      // Finished the quiz!
      const totalQ = activeQuiz.questions.length;
      const finalAccuracy = Math.round((correctCount / totalQ) * 100);
      
      // Points calculations: Easy=50, Med=100, Hard=150. Max score bonus 50XP
      let earnedPoints = 50;
      if (activeQuiz.difficulty === 'Medium') earnedPoints = 100;
      if (activeQuiz.difficulty === 'Hard') earnedPoints = 150;
      if (finalAccuracy === 100) earnedPoints += 50; // Perfect score bonus

      const newAttempt: QuizAttempt = {
        id: `att-${Date.now()}`,
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        score: correctCount,
        totalQuestions: totalQ,
        timeSpentSeconds: timeSpent,
        attemptedAt: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
        accuracy: finalAccuracy
      };

      onAddQuizAttempt(newAttempt);
      awardPoints(earnedPoints);
      
      // Update duration focused tracking
      trackMinutesStudied(Math.max(1, Math.round(timeSpent / 60)));

      setCompletedAttempt(newAttempt);
      setActiveQuiz(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in max-w-5xl mx-auto pt-2">
      {/* Quiz Listing Panel */}
      {!activeQuiz && !completedAttempt && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-500/20 p-8 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl shrink-0">
             <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
             <div className="space-y-3 relative z-10 w-full md:w-2/3">
                <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                   <Trophy className="w-3.5 h-3.5" />
                   <span>Assessment Hub</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white mb-2">Quiz Center</h2>
                <p className="text-[15px] text-indigo-200/80 font-medium leading-relaxed max-w-xl">Challenge yourself with timed assessments and adaptive mini-tests crafted specifically for {profile?.board || ''} Class {profile?.classLevel || ''} syllabus.</p>
             </div>
             
             <div className="relative z-10 flex gap-4 md:w-1/3 justify-start md:justify-end">
                <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-2xl">
                   <span className="text-3xl font-black text-white">{quizHistory.length}</span>
                   <span className="text-[10px] uppercase font-bold text-indigo-300 mt-2 tracking-widest">Completed</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Segmented Control */}
            <div className="bg-[#1A2235] p-1.5 rounded-2xl flex w-full max-w-[320px] border border-gray-800">
               {(['available', 'history'] as const).map((type) => (
                 <button
                   key={type}
                   onClick={() => setActiveTab(type)}
                   className={`flex-1 py-2.5 rounded-[12px] text-xs font-bold capitalize transition-all cursor-pointer ${
                     activeTab === type
                       ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                       : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   {type === 'available' ? 'Practice Hub' : 'Attempt History'}
                 </button>
               ))}
            </div>

            {/* Filters / Generator Setup (only visible if available tab is active) */}
            {activeTab === 'available' && (
              <div className="flex flex-wrap gap-3 items-center">
                 <label className="flex items-center justify-center gap-2 cursor-pointer select-none border border-gray-800 bg-[#1A2235] py-2.5 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                   <Clock className="w-4 h-4 text-gray-400" />
                   <span className="text-xs font-bold text-gray-200">Timed Mode</span>
                   <div className={`w-8 h-4 flex items-center rounded-full transition-colors ml-2 ${timerEnabled ? 'bg-indigo-500' : 'bg-gray-600'}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ml-0.5 ${timerEnabled ? 'translate-x-[15px]' : ''}`} />
                   </div>
                 </label>
              </div>
            )}
          </div>

          {activeTab === 'available' && (
             <div className="space-y-6">
                
                {/* AI Quiz Generator Card */}
                <div className="bg-[#131825] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Create Custom Quiz</h3>
                      <p className="text-sm text-gray-400 font-medium mt-1">Generate an endless supply of questions powered by AI.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                         <BookOpen className="w-3.5 h-3.5" /> Subject
                       </label>
                       <select 
                         value={selectedSubject}
                         onChange={(e) => setSelectedSubject(e.target.value)}
                         className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                       >
                         {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                         <Target className="w-3.5 h-3.5" /> Difficulty
                       </label>
                       <select 
                         value={selectedDifficulty}
                         onChange={(e) => setSelectedDifficulty(e.target.value)}
                         className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                       >
                         {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2 tracking-widest">
                         <Search className="w-3.5 h-3.5" /> Chapter Name <span className="opacity-50 font-medium">(Optional)</span>
                       </label>
                       <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                         <input
                           type="text"
                           value={chapterName}
                           onChange={(e) => setChapterName(e.target.value)}
                           className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600 transition-colors"
                           placeholder="Enter Chapter Name (Optional)"
                         />
                       </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                         <Languages className="w-3.5 h-3.5" /> Language
                       </label>
                       <select 
                         value={selectedLanguage}
                         onChange={(e) => setSelectedLanguage(e.target.value as 'English' | 'Hindi')}
                         className="w-full bg-[#1A2235] text-white border border-gray-800 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                       >
                         <option value="English">English</option>
                         <option value="Hindi">Hindi / हिंदी</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2 text-gray-500">
                         <Crosshair className="w-3.5 h-3.5" /> Question Count
                       </label>
                       <div className="flex bg-[#1A2235] border border-gray-800 rounded-xl p-1 gap-1">
                         {[10, 20, 50].map(cnt => (
                           <button
                             type="button"
                             key={cnt}
                             onClick={() => setQuestionCount(cnt)}
                             className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                               questionCount === cnt 
                                 ? 'bg-indigo-500/10 text-indigo-400' 
                                 : 'text-gray-400 hover:text-white hover:bg-white/5'
                             }`}
                           >
                             {cnt} Questions
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                     <button
                       onClick={generateAndStartQuiz}
                       disabled={isGenerating}
                       className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[15px] font-extrabold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-indigo-900/20 group hover:shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isGenerating ? (
                         <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           Crafting Quiz...
                         </>
                       ) : (
                         <>
                           <Play className="w-5 h-5 fill-current" />
                           Generate & Start Quiz
                         </>
                       )}
                     </button>
                  </div>
                </div>
             </div>
          )}


          {activeTab === 'history' && (
             <div className="bg-[#131825] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-800">
                   <h3 className="font-extrabold text-[15px] text-white flex items-center gap-2.5">
                     <Clock className="w-5 h-5 text-indigo-400" />
                     Attempt History
                   </h3>
                </div>
                {quizHistory.length === 0 ? (
                  <div className="text-center py-24 text-sm text-gray-400 font-medium">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                    You haven't completed any quizzes yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800/60">
                     {quizHistory.map((item, idx) => (
                        <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group hover:bg-white/[0.02] transition-colors">
                           <div>
                              <h4 className="font-bold text-base text-white mb-1.5 group-hover:text-indigo-300 transition-colors">{item.quizTitle}</h4>
                              <span className="text-[12px] font-medium text-gray-500 block">{item.attemptedAt} • {Math.floor(item.timeSpentSeconds / 60)}m {item.timeSpentSeconds % 60}s</span>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block mb-1">Score</span>
                                 <span className="font-extrabold text-white text-lg">{item.score} <span className="text-gray-500 text-sm">/ {item.totalQuestions}</span></span>
                              </div>
                              <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 shadow-inner ${
                                 item.accuracy >= 80 ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-400' :
                                 item.accuracy >= 50 ? 'border-amber-500/80 bg-amber-950/40 text-amber-400' :
                                 'border-rose-500/80 bg-rose-950/40 text-rose-400'
                              }`}>
                                 <span className="font-black text-[13px]">{item.accuracy}%</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          )}
        </div>
      )}

      {/* Active Quiz Arena */}
      {activeQuiz && (
        <div className="max-w-2xl mx-auto bg-[#131825] rounded-[32px] border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* Header Progress */}
          <div className="p-6 md:p-8 border-b border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                {activeQuiz.subject}
              </span>
              {timerEnabled && (
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${secondsRemaining <= 10 ? 'bg-rose-950/40 border-rose-900 text-rose-400' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimerValue(secondsRemaining)}
                </div>
              )}
            </div>
            
            <div className="relative pt-2 z-10">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                <span>Question {currentQuestionIndex + 1}</span>
                <span>{activeQuiz.questions.length} Total</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="p-6 md:p-8 space-y-8">
            <h3 className="font-extrabold text-[20px] md:text-[24px] text-white leading-snug">
              {activeQuiz.questions[currentQuestionIndex].text}
            </h3>

            <div className="space-y-3">
              {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => {
                let borderStyle = 'border-gray-800';
                let bgStyle = 'bg-white/[0.02] text-gray-300 hover:border-gray-600 hover:bg-white/[0.04]';
                let icon = <div className="w-5 h-5 rounded-full border-2 border-gray-600 shrink-0 transition-colors group-hover:border-gray-400" />;
                
                if (selectedOption === idx) {
                  borderStyle = 'border-indigo-500 shadow-lg shadow-indigo-500/10';
                  bgStyle = 'bg-indigo-500/10 text-white';
                  icon = <div className="w-5 h-5 rounded-full border-[6px] border-indigo-500 shrink-0" />;
                }

                if (hasSubmittedAnswer) {
                  const correctIdx = activeQuiz.questions[currentQuestionIndex].correctIndex;
                  if (idx === correctIdx) {
                    borderStyle = 'border-emerald-500/50 shadow-lg shadow-emerald-500/10';
                    bgStyle = 'bg-emerald-500/10 text-emerald-400';
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
                  } else if (selectedOption === idx) {
                    borderStyle = 'border-rose-500/50 shadow-lg shadow-rose-500/10';
                    bgStyle = 'bg-rose-500/10 text-rose-400';
                    icon = <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/50"><X className="w-3 h-3 text-rose-400" /></div>;
                  } else {
                    bgStyle = 'bg-white/[0.01] text-gray-600 opacity-50';
                    borderStyle = 'border-transparent';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-5 md:p-6 rounded-2xl border ${borderStyle} ${bgStyle} transition-all focus:outline-none flex items-center gap-4 text-base font-bold cursor-pointer group`}
                    disabled={hasSubmittedAnswer}
                  >
                    {icon}
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {hasSubmittedAnswer && (
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 animate-in slide-in-from-bottom-2">
                <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Insight
                </span>
                <p className="text-[15px] text-gray-200 leading-relaxed font-medium">
                  {activeQuiz.questions[currentQuestionIndex].explanation}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 md:p-8 border-t border-gray-800 flex gap-4 items-center justify-end bg-black/20">
            {!hasSubmittedAnswer ? (
               <button
                 onClick={handleSubmitAnswer}
                 className="w-full md:w-auto px-10 py-4 bg-white hover:bg-gray-100 text-[#131825] rounded-xl text-[15px] font-extrabold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-white/5"
                 disabled={selectedOption === null}
               >
                 Submit Answer
               </button>
            ) : (
                <button
                  onClick={nextQuestion}
                  className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[15px] font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all"
                >
                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ArrowRight className="w-5 h-5" />
                </button>
            )}
          </div>
        </div>
      )}

      {/* Completed scoreboard display panel */}
      {completedAttempt && (
        <div className="max-w-lg mx-auto bg-[#131825] rounded-[32px] border border-gray-800 shadow-2xl text-center overflow-hidden animate-in zoom-in-95 duration-500 relative">
          <div className="absolute top-0 right-0 w-full h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className={`p-12 ${completedAttempt.accuracy >= 80 ? 'bg-emerald-950/30' : completedAttempt.accuracy >= 50 ? 'bg-amber-950/30' : 'bg-rose-950/30'} relative z-10 border-b border-gray-800`}>
             <div className={`w-24 h-24 rounded-[24px] flex items-center justify-center mx-auto mb-6 shrink-0 shadow-2xl border ${
               completedAttempt.accuracy >= 80 ? 'bg-emerald-500/20 border-emerald-500/30 shadow-emerald-500/20' : 
               completedAttempt.accuracy >= 50 ? 'bg-amber-500/20 border-amber-500/30 shadow-amber-500/20' : 
               'bg-rose-500/20 border-rose-500/30 shadow-rose-500/20'
             }`}>
                <Trophy className={`w-12 h-12 ${
                  completedAttempt.accuracy >= 80 ? 'text-emerald-400' : 
                  completedAttempt.accuracy >= 50 ? 'text-amber-400' : 
                  'text-rose-400'
                }`} />
             </div>
             <h2 className="text-4xl font-black mb-3 tracking-tight text-white">
               {completedAttempt.accuracy >= 80 ? 'Outstanding!' : 
                completedAttempt.accuracy >= 50 ? 'Good Effort!' : 
                'Keep Practicing!'}
             </h2>
             <p className="text-gray-400 font-medium text-[16px]">{completedAttempt.quizTitle} Completed</p>
          </div>

          <div className="p-8 space-y-6 relative z-10">
             <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-white/[0.02] border border-gray-800 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block mb-2">Score</span>
                 <span className="text-3xl font-black text-white">
                   {completedAttempt.score} <span className="text-gray-500 text-xl font-bold">/ {completedAttempt.totalQuestions}</span>
                 </span>
               </div>
               
               <div className="p-6 bg-white/[0.02] border border-gray-800 rounded-2xl">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block mb-2">Accuracy</span>
                 <span className={`text-3xl font-black ${
                   completedAttempt.accuracy >= 80 ? 'text-emerald-400' : 
                   completedAttempt.accuracy >= 50 ? 'text-amber-400' : 
                   'text-rose-400'
                 }`}>
                   {completedAttempt.accuracy}%
                 </span>
               </div>

               <div className="col-span-2 p-5 bg-white/[0.02] border border-gray-800 rounded-2xl flex justify-between items-center">
                 <span className="text-[11px] uppercase font-bold tracking-widest text-gray-500">Duration</span>
                 <span className="text-[18px] font-bold text-gray-200 block">
                   {Math.floor(completedAttempt.timeSpentSeconds / 60)}m {completedAttempt.timeSpentSeconds % 60}s
                 </span>
               </div>
             </div>

             <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 text-left rounded-2xl space-y-3">
               <span className="text-[11px] font-bold tracking-widest text-indigo-400 flex items-center gap-2 uppercase">
                 <Award className="w-4 h-4" /> Assessment Note
               </span>
               <p className="text-[14px] text-indigo-200/80 leading-relaxed font-medium">
                 {completedAttempt.accuracy === 100
                   ? "Exceptional work! You have complete mastery. Time to tackle the next difficulty level."
                   : "Great effort. Review the areas where you slipped up to maximize your scores next time."}
               </p>
             </div>

             <button
               onClick={() => {
                 setCompletedAttempt(null);
                 setActiveQuiz(null);
               }}
               className="w-full py-4 bg-white hover:bg-gray-200 text-[#131825] font-extrabold rounded-xl text-[15px] cursor-pointer shadow-xl shadow-white/5 transition-all mt-4"
             >
               Return to Arena
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
