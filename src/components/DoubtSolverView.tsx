import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, BookOpen, Clock, Copy, Plus, Search, Trash2, Bookmark, Check, Menu, X, ArrowLeft } from 'lucide-react';
import { SavedDoubt } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { getSubjects } from '../lib/subjectData';

interface DoubtSolverViewProps {
  savedDoubts: SavedDoubt[];
  onSaveDoubt: (question: string, answer: string, subject: string) => void;
  onDeleteSavedDoubt: (id: string) => void;
  trackMinutesStudied: (minutes: number) => void;
  onShowToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export default function DoubtSolverView({
  savedDoubts,
  onSaveDoubt,
  onDeleteSavedDoubt,
  trackMinutesStudied,
  onShowToast
}: DoubtSolverViewProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; subject?: string }[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Academic Tutor for ${profile?.board || 'your board'} Class ${profile?.classLevel || 'students'} ${profile?.medium || ''}. Feel free to ask me anything about your syllabus!`,
      subject: 'General'
    }
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedStatus, setSavedStatus] = useState<{ [key: string]: boolean }>({});
  
  // Mobile app-like state to show history panel instead of chat
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const subjectsList = [...getSubjects(profile?.board || 'CBSE', profile?.classLevel || '10', profile?.medium || 'English Medium'), 'General'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, subject }]);
    setLoading(true);

    try {
      // Build chat history matching the expected format on the server
      const chatHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMsg,
          subject: subject,
          history: chatHistory.slice(-6),
          board: profile?.board,
          classLevel: profile?.classLevel,
          medium: profile?.medium
        })
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          throw new Error(errData.error || `HTTP error: ${res.status}`);
        }
        throw new Error("HTTP error: " + res.status);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received an invalid response from the server (non-JSON content). This can happen during application startup or server overload. Please try again in a few seconds.");
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "No response received.", subject }]);
      
      // Award 2 study minutes for active learning with AI doubt solver
      trackMinutesStudied(2);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Failed to get AI output. Make sure you set your GEMINI_API_KEY in the Secrets panel, or verify your internet. Error: ${err?.message || err}`,
          subject
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveToHistory = (question: string, answer: string, currentSubject: string) => {
    onSaveDoubt(question, answer, currentSubject);
    const key = `${question.substring(0, 15)}-${currentSubject}`;
    setSavedStatus(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const filteredSavedDoubts = savedDoubts.filter(
    d =>
      d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] font-sans animate-in fade-in pt-2">
      
      {/* Sidebar - History Panel */}
      <div className={`w-full lg:w-80 flex-shrink-0 bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm flex flex-col transition-all duration-300 absolute lg:relative z-20 h-full ${showHistoryMobile ? 'left-0 top-0 w-full rounded-none lg:rounded-3xl' : '-left-full lg:left-0 hidden lg:flex'}`}>
        
        {/* Mobile close button (only visible on mobile when history is shown) */}
        <div className="lg:hidden p-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
           <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Clock className="w-5 h-5 text-violet-500" />
             Saved Explanations
           </h3>
           <button onClick={() => setShowHistoryMobile(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full cursor-pointer">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-5 border-b border-slate-100 dark:border-gray-700 hidden lg:block">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            Saved Doubts
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Search and revisit your favorite resolutions.</p>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-gray-700">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-black/20 rounded-xl text-xs border border-slate-200 dark:border-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {filteredSavedDoubts.length === 0 ? (
            <div className="text-center py-10 opacity-70">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <span className="text-xs text-slate-500">No saved explanations found.</span>
            </div>
          ) : (
            filteredSavedDoubts.map((doubt) => (
              <div
                key={doubt.id}
                className="bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-white/10 p-3.5 rounded-2xl border border-slate-100 dark:border-gray-700 relative group transition-colors cursor-pointer"
                onClick={() => {
                  setMessages([
                    { role: 'user', content: doubt.question, subject: doubt.subject },
                    { role: 'assistant', content: doubt.answer, subject: doubt.subject }
                  ]);
                  setShowHistoryMobile(false);
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-violet-500 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded">
                    {doubt.subject}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSavedDoubt(doubt.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-500 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 mt-2 line-clamp-2">
                  {doubt.question}
                </h4>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-gray-700">
          <button
            onClick={() => {
              setMessages([
                {
                  role: 'assistant',
                  content: `Let's start a fresh chat. What ${profile?.board || ''} Class ${profile?.classLevel || ''} ${profile?.medium || ''} subject do you need help with today?`,
                  subject: 'General'
                }
              ]);
              setShowHistoryMobile(false);
            }}
            className="w-full py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden h-full relative z-10 ${showHistoryMobile ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowHistoryMobile(true)} 
               className="lg:hidden p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 text-slate-600 dark:text-gray-100 rounded-xl cursor-pointer"
             >
                <Menu className="w-5 h-5" />
             </button>
             <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="w-5 h-5 text-white" />
             </div>
             <div>
               <h2 className="font-extrabold text-slate-900 dark:text-white text-[15px] leading-tight">AI Academic Tutor</h2>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Online • Gemini 3.5</span>
               </div>
             </div>
          </div>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-slate-50 dark:bg-black/20 font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-[120px] md:max-w-[200px] truncate"
          >
            {subjectsList.map((sub, i) => (
              <option key={i} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#f8f9fa] dark:bg-black/20">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0 mr-3 mt-1 border border-violet-200 dark:border-violet-500/20">
                     <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                )}
                
                <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 md:p-5 text-[14px] shadow-sm relative group ${
                  isUser
                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-violet-500/20'
                    : 'bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-gray-700 rounded-tl-sm'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert prose-indigo max-w-none text-slate-700 dark:text-gray-100 prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                       <MarkdownRenderer content={m.content} />
                    </div>
                  )}

                  {/* Actions for Assistant messages */}
                  {!isUser && idx > 0 && (
                    <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-gray-700 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(m.content, idx)}
                        className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedIndex === idx ? 'Copied' : 'Copy'}
                      </button>
                      
                      <button
                        onClick={() => {
                          const associatedQuery = messages[idx - 1]?.content || "AI Subject Clarification";
                          handleSaveToHistory(associatedQuery, m.content, m.subject || subject);
                        }}
                        className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {savedStatus[`${(messages[idx - 1]?.content || "AI").substring(0, 15)}-${m.subject || subject}`] ? (
                           <>
                             <Check className="w-3.5 h-3.5 text-emerald-500" /> Saved
                           </>
                        ) : (
                           <>
                             <Bookmark className="w-3.5 h-3.5" /> Save
                           </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0 mr-3 mt-1 border border-violet-200 dark:border-violet-500/20">
                 <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
               </div>
               <div className="bg-white dark:bg-gray-800 rounded-3xl rounded-tl-sm p-5 border border-slate-100 dark:border-gray-700 flex items-center gap-2 max-w-[60%]">
                 <div className="flex space-x-1.5">
                   <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                   <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                 </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-slate-100 dark:border-gray-700 pb-safe">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${subject}...`}
              className="w-full bg-slate-50 dark:bg-black/20 border-2 border-slate-200 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-500 rounded-3xl pl-5 pr-14 py-3.5 text-sm font-medium focus:outline-none transition-colors dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              className={`absolute right-1.5 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                 loading || !input.trim() 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700 text-white hover:scale-105 active:scale-95 cursor-pointer'
              }`}
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
             <span className="text-[10px] text-slate-400 font-medium">AI tutors can make mistakes. Verify important answers.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
