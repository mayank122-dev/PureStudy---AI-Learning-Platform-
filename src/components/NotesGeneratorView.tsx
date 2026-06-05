import React, { useState } from 'react';
import { BookOpen, Sparkles, FileText, Bookmark, Share2, Clipboard, Printer, Check, ArrowDownToLine, Trash2, Menu, X, ChevronDown, ChevronRight, PenTool, Clock, Plus } from 'lucide-react';
import { GeneratedNote } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { getSubjects } from '../lib/subjectData';

interface NotesGeneratorViewProps {
  savedNotes: GeneratedNote[];
  onSaveNote: (note: GeneratedNote) => void;
  onDeleteNote: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  trackMinutesStudied: (minutes: number) => void;
  onShowToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export default function NotesGeneratorView({
  savedNotes,
  onSaveNote,
  onDeleteNote,
  onToggleBookmark,
  trackMinutesStudied,
  onShowToast
}: NotesGeneratorViewProps) {
  const { profile } = useAuth();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Science');
  const [language, setLanguage] = useState<string>(profile?.preferences?.language || 'English');
  
  const [activeNote, setActiveNote] = useState<GeneratedNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [sharedStatus, setSharedStatus] = useState(false);
  
  // Mobile app-like state to show history
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  
  // Toggle configuration forms
  const [showConfig, setShowConfig] = useState(true);

  const subjects = getSubjects(profile?.board || 'CBSE', profile?.classLevel || '10', profile?.medium || 'English Medium');
  const grades = ['9th Grade', '10th Grade', '11th Grade', '12th Grade', 'College Prep'];
  const languages = ['English', 'Hindi (हिन्दी)', 'Gujarati', 'Marathi', 'Bengali', 'Tamil'];

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setActiveNote(null);

    try {
      const res = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic.trim(),
          subject,
          language,
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
        throw new Error("HTTP error " + res.status);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received an invalid response from the server (non-JSON content). This can happen during application startup or server overload. Please try again in a few seconds.");
      }

      const noteData = await res.json();
      
      const parsedNote: GeneratedNote = {
        id: noteData.id || `note-${Date.now()}`,
        title: noteData.title || `${topic} Notes`,
        topic: noteData.topic || topic,
        subject: noteData.subject || subject,
        language: noteData.language || language,
        summary: noteData.summary || 'Summary outline completed.',
        keyConcepts: noteData.keyConcepts || [],
        formulasOrDefinitions: noteData.formulasOrDefinitions || [],
        quickSummaries: noteData.quickSummaries || [],
        practiceQuestions: noteData.practiceQuestions || [],
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        bookmarked: false
      };

      setActiveNote(parsedNote);
      onSaveNote(parsedNote); // auto save to user records
      setShowConfig(false); // hide config immediately to show note better

      // Log 4 minutes studied for compiling curriculum materials
      trackMinutesStudied(4);

    } catch (err: any) {
      console.error(err);
      if (onShowToast) {
        onShowToast(`Failed to generate notes: ${err?.message || err}`, 'warning');
      } else {
        alert(`⚠️ Failed to generate beautiful AI notes. Ensure GEMINI_API_KEY is active. Error details: ${err?.message || err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (note: GeneratedNote) => {
    const textToShare = `=== ${note.title} ===\nSubject: ${note.subject}\nTopic Summary: ${note.summary}\n`;
    navigator.clipboard.writeText(textToShare);
    setSharedStatus(true);
    setTimeout(() => setSharedStatus(false), 2000);
  };

  const handleCopyClipboard = (note: GeneratedNote) => {
    let documentStr = `# ${note.title}\n\n`;
    documentStr += `## Summary\n${note.summary}\n\n`;
    documentStr += `## Key Concepts\n`;
    note.keyConcepts.forEach(c => {
      documentStr += `- **${c.name}**: ${c.explanation}\n`;
    });
    
    if (note.formulasOrDefinitions.length > 0) {
      documentStr += `\n## Core Formulas & Definitions\n`;
      note.formulasOrDefinitions.forEach(f => {
        documentStr += `- **${f.term}**: ${f.valueOrDefinition}\n`;
      });
    }

    navigator.clipboard.writeText(documentStr);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] font-sans animate-in fade-in pt-2">
      
      {/* Sidebar - Saved Notes Panel */}
      <div className={`w-full lg:w-80 flex-shrink-0 bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm flex flex-col transition-all duration-300 absolute lg:relative z-20 h-full ${showHistoryMobile ? 'left-0 top-0 w-full rounded-none lg:rounded-3xl' : '-left-full lg:left-0 hidden lg:flex'}`}>
        
        {/* Mobile Header for Sidebar */}
        <div className="lg:hidden p-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
           <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Bookmark className="w-5 h-5 text-emerald-500" />
             Saved AI Notes
           </h3>
           <button onClick={() => setShowHistoryMobile(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full cursor-pointer">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-5 border-b border-slate-100 dark:border-gray-700 hidden lg:block">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
            AI Notes Library
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Review saved curriculum notes.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
          {savedNotes.length === 0 ? (
            <div className="text-center py-10 opacity-70 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <span className="text-xs text-slate-500">No study notes found yet. Generate one!</span>
            </div>
          ) : (
            savedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNote(note);
                  setShowHistoryMobile(false);
                  setShowConfig(false);
                }}
                className={`p-4 rounded-2xl border transition-colors cursor-pointer relative group flex flex-col justify-between ${
                  activeNote?.id === note.id
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-gray-800 border-slate-100 dark:border-gray-700 hover:bg-slate-100 hover:dark:bg-gray-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                      {note.subject}
                    </span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(note.id);
                        }}
                        className="p-1 hover:text-yellow-500 text-slate-400 dark:text-gray-300"
                        title="Bookmark Notes"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${note.bookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                          if (activeNote?.id === note.id) setActiveNote(null);
                        }}
                        className="p-1 hover:text-rose-500 text-slate-400 dark:text-gray-300"
                        title="Delete Notes"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-[13px] text-slate-800 dark:text-slate-100 mt-2.5 leading-tight line-clamp-2">{note.title}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-gray-300 mt-1.5 font-medium flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {note.createdAt}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveNote(null);
              setShowConfig(true);
              setShowHistoryMobile(false);
            }}
            className="w-full py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Note
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden relative z-10 ${showHistoryMobile ? 'hidden lg:flex' : 'flex'}`}>
         
         {/* Top Header */}
         <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button 
                 onClick={() => setShowHistoryMobile(true)} 
                 className="lg:hidden p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 text-slate-600 dark:text-gray-100 rounded-xl cursor-pointer"
              >
                 <Menu className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                 <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 dark:text-white text-[15px] leading-tight flex items-center gap-2">
                   Notion AI Engine
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Fast Document Generation</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 hover:dark:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Configure
              {showConfig ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
         </div>

         {/* Scrollable Container */}
         <div className="flex-1 overflow-y-auto bg-[#f8f9fa] dark:bg-[#0B0F19] relative">
            
            {/* Notes Generator Settings Panel (Collapsible) */}
            {showConfig && (
               <div className="p-4 md:p-6 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-700 shadow-sm z-10 relative">
                  <form onSubmit={handleGenerateNotes} className="space-y-4 max-w-4xl mx-auto">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Primary Study Topic</label>
                      <input
                        type="text"
                        required
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. World War II timelines, Cellular respiration, Newton's laws..."
                        className="w-full text-sm font-semibold bg-[#f8f9fa] dark:bg-black/20 border-2 border-slate-200 dark:border-gray-600 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:text-white transition-colors"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Subject</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full text-xs font-bold bg-[#f8f9fa] dark:bg-black/20 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 dark:text-slate-200 cursor-pointer"
                          disabled={loading}
                        >
                          {subjects.map((sub, i) => (
                            <option key={i}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full text-xs font-bold bg-[#f8f9fa] dark:bg-black/20 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 dark:text-slate-200 cursor-pointer"
                          disabled={loading}
                        >
                          {languages.map((lang, i) => (
                            <option key={i} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className={`w-full md:w-auto md:px-8 py-3.5 rounded-2xl text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${
                          loading || !topic.trim() 
                            ? 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-gray-300 shadow-none cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-0.5 active:translate-y-0 shadow-emerald-500/25 cursor-pointer'
                        }`}
                        disabled={loading || !topic.trim()}
                      >
                        {loading ? (
                           <>
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Compiling Blueprint...
                           </>
                        ) : (
                           <>
                             <Sparkles className="w-4 h-4" />
                             Generate Study Notes
                           </>
                        )}
                      </button>
                    </div>
                  </form>
               </div>
            )}

            {/* Display Active Note */}
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
               {activeNote ? (
                 <div id="printable-notes" className="bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-10 border border-slate-100 dark:border-gray-700 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   
                   {/* Action Bar & Meta */}
                   <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-gray-700">
                     <div className="space-y-2">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">
                           {activeNote.subject}
                         </span>
                         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-200 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                           {profile?.board} Class {profile?.classLevel} • {profile?.medium || 'English Medium'}
                         </span>
                         {activeNote.language && activeNote.language !== 'English' && (
                           <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-md">
                             {activeNote.language}
                           </span>
                         )}
                       </div>
                       <p className="text-[11px] font-medium text-slate-400">Created on {activeNote.createdAt}</p>
                     </div>

                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => handleCopyClipboard(activeNote)}
                         className="p-2 md:px-3 md:py-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 hover:dark:bg-white/10 text-slate-600 dark:text-gray-100 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                         title="Copy text"
                       >
                         {copiedStatus ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
                         <span className="hidden md:inline">{copiedStatus ? 'Copied' : 'Copy Text'}</span>
                       </button>
                       <button
                         onClick={() => handleShare(activeNote)}
                         className="p-2 md:px-3 md:py-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 hover:dark:bg-white/10 text-slate-600 dark:text-gray-100 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                         title="Share notes"
                       >
                         {sharedStatus ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                         <span className="hidden md:inline">{sharedStatus ? 'Shared' : 'Share'}</span>
                       </button>
                       <button
                         onClick={handlePrint}
                         className="p-2 md:px-3 md:py-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 hover:dark:bg-white/10 text-slate-600 dark:text-gray-100 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                         title="Print"
                       >
                         <Printer className="w-4 h-4" />
                         <span className="hidden md:inline">Print</span>
                       </button>
                     </div>
                   </div>

                   {/* Note Document body */}
                   <div className="space-y-10">
                     <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white capitalize tracking-tight leading-tight">
                       {activeNote.title}
                     </h3>

                     {/* Topic Abstract box */}
                     <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-[20px] space-y-3">
                       <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                         <BookOpen className="w-4 h-4" /> Topic Overview
                       </span>
                       <div className="prose prose-sm dark:prose-invert prose-emerald max-w-none text-slate-700 dark:text-gray-100 prose-p:leading-relaxed text-[15px]">
                          <MarkdownRenderer content={activeNote.summary} />
                       </div>
                     </div>

                     {/* Key Concepts Block */}
                     {activeNote.keyConcepts && activeNote.keyConcepts.length > 0 && (
                        <div className="space-y-5">
                          <h4 className="text-[13px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-gray-700 pb-2">Core Entities & Concepts</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeNote.keyConcepts.map((concept, idx) => (
                              <div key={idx} className="p-5 bg-white dark:bg-gray-900 rounded-[24px] border border-slate-100 dark:border-gray-700 shadow-sm space-y-3 hover:border-emerald-500/30 transition-colors">
                                <h5 className="font-extrabold text-slate-900 dark:text-white text-[15px] flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                     <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  </span>
                                  <span className="mt-0.5">{concept.name}</span>
                                </h5>
                                <div className="text-[14px] text-slate-600 dark:text-gray-200 leading-relaxed pl-8">
                                  <MarkdownRenderer content={concept.explanation} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                     )}

                     {/* Formulas/Definitions list */}
                     {activeNote.formulasOrDefinitions && activeNote.formulasOrDefinitions.length > 0 && (
                       <div className="space-y-4">
                         <h4 className="text-[13px] font-black uppercase text-slate-400 tracking-widest">Crucial Data</h4>
                         <div className="space-y-3">
                           {activeNote.formulasOrDefinitions.map((form, i) => (
                             <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-[#f8f9fa] dark:bg-white/5 rounded-[20px]">
                               <span className="font-mono font-bold text-[14px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl shrink-0 min-w-[120px] text-center inline-block">{form.term}</span>
                               <div className="font-medium text-slate-700 dark:text-gray-100 text-[14px] flex-1">
                                 <MarkdownRenderer content={form.valueOrDefinition} />
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Quick Summaries outline */}
                     {activeNote.quickSummaries && activeNote.quickSummaries.length > 0 && (
                       <div className="space-y-4 p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-500/10 rounded-[24px]">
                         <h4 className="text-[13px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Quick Bites
                         </h4>
                         <div className="space-y-3 pl-1">
                           {activeNote.quickSummaries.map((sum, i) => (
                             <div key={i} className="flex items-start gap-3 group">
                               <div className="w-5 h-5 rounded-md bg-indigo-200 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                 {i + 1}
                               </div>
                               <div className="text-[14px] font-medium text-slate-700 dark:text-gray-100 flex-1 pt-0.5 leading-relaxed">
                                 <MarkdownRenderer content={sum} />
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Practice Test block */}
                     {activeNote.practiceQuestions && activeNote.practiceQuestions.length > 0 && (
                       <div className="space-y-5">
                         <h4 className="text-[13px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-gray-700 pb-2">Flashcard Drills</h4>
                         <div className="space-y-4">
                           {activeNote.practiceQuestions.map((pq, i) => (
                             <div key={i} className="p-5 md:p-6 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-[24px] shadow-sm space-y-4 group">
                               <div className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-slate-500 text-sm shrink-0">
                                     Q{i + 1}
                                  </div>
                                  <div className="font-bold text-[15px] text-slate-800 dark:text-white pt-1">
                                     <MarkdownRenderer content={pq.question} />
                                  </div>
                               </div>
                               <div className="ml-11 p-4 bg-[#f8f9fa] dark:bg-white/5 rounded-2xl">
                                  <span className="text-[10px] uppercase font-bold text-emerald-500 mb-2 block tracking-wider">Answer Key</span>
                                  <div className="text-sm font-medium text-slate-600 dark:text-gray-100">
                                     <MarkdownRenderer content={pq.answer} />
                                  </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="pt-8 border-t border-slate-100 dark:border-gray-700 flex justify-end">
                     <button
                       onClick={() => {
                         if (onShowToast) {
                           onShowToast("PDF Document layout finalized! Check print dialog.", "success");
                         }
                         handlePrint();
                       }}
                       className="px-6 py-3 bg-slate-900 border border-transparent dark:bg-white/10 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-md"
                     >
                       <ArrowDownToLine className="w-4 h-4" /> Download PDF Target
                     </button>
                   </div>
                 </div>
               ) : !loading && (
                 <div className="flex flex-col items-center justify-center text-center p-10 h-64 opacity-60">
                   <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-slate-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-700 dark:text-white">Workspace Empty</h3>
                   <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto font-medium">Use the configuration panel to generate an AI study document, or select a previous document from the library.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
