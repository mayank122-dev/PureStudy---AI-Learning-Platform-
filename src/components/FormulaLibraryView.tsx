import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Star, BookOpen, Filter, Zap, Compass, ChevronDown, ChevronUp, 
  HelpCircle, Lightbulb, Calculator, ArrowRight, X, Play, RefreshCw, Dna, BrainCircuit, RotateCcw
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { Formula } from '../types';
import katex from 'katex';

interface FormulaLibraryViewProps {
  favoriteFormulaIds: string[];
  onToggleFavoriteFormula: (id: string) => void;
  trackMinutesStudied: (minutes: number) => void;
}

export default function FormulaLibraryView({ 
  favoriteFormulaIds, 
  onToggleFavoriteFormula, 
  trackMinutesStudied 
}: FormulaLibraryViewProps) {
  const { profile, isGuest, updateProfileDetails } = useAuth();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'library' | 'revision' | 'quiz'>('library');

  const [explainingFormula, setExplainingFormula] = useState<Formula | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [solvingFormula, setSolvingFormula] = useState<Formula | null>(null);
  const [solveValues, setSolveValues] = useState<Record<string, string>>({});
  const [solveResult, setSolveResult] = useState<{steps: string, result: string} | null>(null);
  const [loadingSolve, setLoadingSolve] = useState(false);

  useEffect(() => {
    fetchFormulas();
  }, [profile?.board, profile?.classLevel, profile?.medium]);

  const fetchFormulas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/formulas/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: profile?.board || 'CBSE',
          classLevel: profile?.classLevel || '10',
          medium: profile?.medium || 'English Medium'
        })
      });
      if (!res.ok) throw new Error('Failed to load formulas.');
      const data = await res.json();
      if (profile && !isGuest) {
        // Track formula views
        updateProfileDetails({
          formulasViewed: (profile.formulasViewed || 0) + data.length
        }).catch(e => console.error(e));
      }

      setFormulas(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load formulas.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (formula: Formula) => {
    setExplainingFormula(formula);
    setExplanation('');
    setLoadingExplanation(true);
    try {
      const res = await fetch('/api/formulas/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula: formula.formula,
          title: formula.title,
          board: profile?.board || 'CBSE',
          classLevel: profile?.classLevel || '10',
          medium: profile?.medium || 'English Medium'
        })
      });
      const data = await res.json();
      if (data.explanation) {
        setExplanation(data.explanation);
      }
    } catch (err) {
      setExplanation('Failed to generate explanation. Please try again.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleSolve = async () => {
    if (!solvingFormula) return;
    setLoadingSolve(true);
    setSolveResult(null);
    try {
      const res = await fetch('/api/formulas/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula: solvingFormula.formula,
          title: solvingFormula.title,
          values: solveValues
        })
      });
      const data = await res.json();
      setSolveResult(data);
    } catch (err) {
      setSolveResult({ steps: 'Error solving formula', result: 'Error' });
    } finally {
      setLoadingSolve(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(formulas.map(f => f.category));
    return ['All', 'Favorites', ...Array.from(cats)];
  }, [formulas]);

  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = f.title.toLowerCase().includes(q) || 
                            f.formula.toLowerCase().includes(q) ||
                            f.category.toLowerCase().includes(q) ||
                            f.description.toLowerCase().includes(q) ||
                            (f.chapter?.toLowerCase().includes(q)) ||
                            (f.subject?.toLowerCase().includes(q)) ||
                            (f.variables?.some(v => v.symbol.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)));
      
      if (selectedCategory === 'All') return matchesSearch;
      if (selectedCategory === 'Favorites') return matchesSearch && favoriteFormulaIds.includes(f.id);
      return matchesSearch && f.category === selectedCategory;
    });
  }, [formulas, searchQuery, selectedCategory, favoriteFormulaIds]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-64 h-64 transform rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              AI Formula Library
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Curriculum Adapted
          </h1>
          <p className="text-indigo-200 text-sm md:text-base font-medium leading-relaxed">
            Formulas specially tailored for <strong className="text-white">{profile?.board} Class {profile?.classLevel} {profile?.medium}</strong>. Master concepts with AI explanations and step-by-step solvers.
          </p>
        </div>
      </div>

      {/* Modes Navigation */}
      <div className="flex bg-[#131825] border border-gray-800 rounded-2xl p-1 overflow-x-auto hide-scrollbar">
        {['library', 'revision', 'quiz'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all ${
              viewMode === mode 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {mode} Mode
          </button>
        ))}
      </div>

      {viewMode === 'library' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search formulas by name, chapter, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#131825] border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      : 'bg-[#131825] text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-300'
                  }`}
                >
                  {cat === 'Favorites' ? <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Favorites</span> : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-slate-400 font-medium animate-pulse">Adapting formulas for your curriculum...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
              {error}
              <button 
                onClick={fetchFormulas}
                className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors font-bold"
              >
                Try Again
              </button>
            </div>
          ) : filteredFormulas.length === 0 ? (
            <div className="text-center py-20 bg-[#131825] border border-gray-800 rounded-3xl">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No formulas found</h3>
              <p className="text-slate-400">Try adjusting your search or category filters.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(
                filteredFormulas.reduce((acc, f) => {
                  const key = f.chapter || f.category || 'General';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(f);
                  return acc;
                }, {} as Record<string, typeof filteredFormulas>)
              ).map(([chapter, chapterFormulas]) => (
                <div key={chapter} className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    {chapter}
                    <span className="text-sm font-medium bg-white/10 text-gray-300 px-3 py-1 rounded-full">
                      {chapterFormulas.length} {chapterFormulas.length === 1 ? 'Formula' : 'Formulas'}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {chapterFormulas.map(f => (
                      <div key={f.id} className="bg-[#131825] border border-gray-800 rounded-[28px] overflow-hidden hover:border-gray-700 transition-colors flex flex-col group">
                        <div className="p-6 md:p-8 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">{f.category}</span>
                                 {f.chapter && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 rounded-full block">{f.chapter}</span>}
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 bg-pink-500/10 px-2 rounded-full block">{f.subject}</span>
                              </div>
                              <h3 className="text-xl font-bold text-white">{f.title}</h3>
                              {f.importanceTags && f.importanceTags.length > 0 && (
                                 <div className="flex flex-wrap gap-1 mt-2">
                                     {f.importanceTags.map(tag => (
                                         <span key={tag} className="text-[10px] font-medium bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">{tag}</span>
                                     ))}
                                 </div>
                              )}
                            </div>
                            <button 
                              onClick={() => onToggleFavoriteFormula(f.id)}
                              className={`p-2 rounded-xl transition-colors ${favoriteFormulaIds.includes(f.id) ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                            >
                              <Star className="w-5 h-5" fill={favoriteFormulaIds.includes(f.id) ? "currentColor" : "none"} />
                            </button>
                          </div>

                          <div className="bg-[#0B0F19] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[140px] mb-6 border border-gray-800/60 shadow-inner overflow-x-auto hide-scrollbar">
                            <div 
                              className="text-xl md:text-2xl text-white whitespace-nowrap overflow-x-auto hide-scrollbar max-w-full font-serif"
                              dangerouslySetInnerHTML={{ __html: katex.renderToString(f.formula, { throwOnError: false, displayMode: true }) }}
                            />
                          </div>

                          <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            {f.description}
                          </p>

                          {f.variables && f.variables.length > 0 && (
                            <div className="space-y-2 mb-6">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Variables & Units</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {f.variables.map((v, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm bg-white/5 px-3 py-2 rounded-lg">
                                    <span 
                                      className="font-serif font-bold text-white bg-indigo-500/10 min-w-[24px] h-6 flex items-center justify-center rounded-md px-1"
                                      dangerouslySetInnerHTML={{ __html: katex.renderToString(v.symbol, { throwOnError: false, displayMode: false }) }}
                                    />
                                    <span className="text-gray-300 truncate font-medium">{v.meaning}</span>
                                    {v.unit && <span className="ml-auto text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">{v.unit}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {(f.examTip || f.commonMistakes) && (
                            <div className="space-y-3 mb-6">
                              {f.examTip && (
                                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 text-sm">
                                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                  <p className="text-amber-200/90">{f.examTip}</p>
                                </div>
                              )}
                              {f.commonMistakes && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex gap-3 text-sm">
                                  <BrainCircuit className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                  <p className="text-red-200/90"><span className="font-bold">Common Mistake:</span> {f.commonMistakes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 border-t border-gray-800/80 bg-white/[0.02] flex gap-3">
                          <button 
                            onClick={() => handleExplain(f)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors"
                          >
                            <BrainCircuit className="w-4 h-4 text-emerald-400" />
                            AI Explain
                          </button>
                          <button 
                            onClick={() => { setSolvingFormula(f); setSolveValues({}); setSolveResult(null); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-600/20"
                          >
                            <Calculator className="w-4 h-4" />
                            Solver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVISION MODE */}
      {viewMode === 'revision' && (
        <div className="bg-[#131825] border border-gray-800 rounded-[32px] p-6 lg:p-10 min-h-[60vh]">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-indigo-500/10 rounded-2xl">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Formula Revision Packs</h2>
              <p className="text-gray-400">Quick-read formula sheets adapted to your syllabus for rapid pre-exam revision.</p>
            </div>
          </div>

          <div className="space-y-12">
            {Object.entries(
                formulas.reduce((acc, f) => {
                  const key = f.subject || 'General';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(f);
                  return acc;
                }, {} as Record<string, typeof formulas>)
            ).map(([subject, subjectFormulas]) => (
               <div key={subject}>
                 <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 border-b border-gray-800 pb-3">
                   <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
                   {subject} <span className="text-sm font-medium text-slate-500 ml-2">({subjectFormulas.length} formulas)</span>
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {subjectFormulas.map(f => (
                     <div key={f.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                           <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm inline-block">{f.chapter || f.category}</div>
                           {favoriteFormulaIds.includes(f.id) && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        </div>
                        <div className="text-white font-bold mb-3 truncate">{f.title}</div>
                        <div className="bg-[#0B0F19] rounded-xl p-3 flex justify-center border border-gray-800/80 overflow-x-auto hide-scrollbar">
                           <div 
                             className="text-lg sm:text-xl text-white whitespace-nowrap hide-scrollbar font-serif"
                             dangerouslySetInnerHTML={{ __html: katex.renderToString(f.formula, { throwOnError: false, displayMode: true }) }}
                           />
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            ))}
            {formulas.length === 0 && (
                <div className="text-center py-20">
                  <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No formulas loaded</h3>
                  <p className="text-slate-400">Library requires population before revision packs can be generated.</p>
                </div>
            )}
          </div>
        </div>
      )}

      {/* QUIZ MODE */}
      {viewMode === 'quiz' && (
        <div className="bg-[#131825] border border-gray-800 rounded-[32px] p-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <Dna className="w-16 h-16 text-emerald-500 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Formula Quiz</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">Test your memory and application skills with AI-generated questions based on your curriculum.</p>
          <div className="animate-pulse delay-150 inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-bold text-sm">
            Coming Soon: Formula Quiz Engine
          </div>
        </div>
      )}


      {/* EXPLAIN MODAL */}
      {explainingFormula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-md" onClick={() => setExplainingFormula(null)} />
          <div className="bg-[#131825] border border-gray-800 rounded-[32px] w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">AI Tutor</h3>
              </div>
              <button onClick={() => setExplainingFormula(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 bg-[#0B0F19] rounded-2xl p-5 border border-gray-800/80 overflow-x-auto hide-scrollbar">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 block mb-1">{explainingFormula.title}</span>
                <div 
                  className="text-xl font-serif text-white whitespace-nowrap hide-scrollbar"
                  dangerouslySetInnerHTML={{ __html: katex.renderToString(explainingFormula.formula, { throwOnError: false, displayMode: true }) }}
                />
              </div>
              
              {loadingExplanation ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-medium animate-pulse">Generating explanation...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed">
                  <MarkdownRenderer content={explanation} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SOLVER MODAL */}
      {solvingFormula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-md" onClick={() => setSolvingFormula(null)} />
          <div className="bg-[#131825] border border-gray-800 rounded-[32px] w-full max-w-xl max-h-[85vh] flex flex-col relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Formula Solver</h3>
              </div>
              <button onClick={() => setSolvingFormula(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-[#0B0F19] rounded-2xl p-5 border border-gray-800/80 text-center space-y-1 overflow-x-auto hide-scrollbar">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">{solvingFormula.title}</span>
                <div 
                  className="text-xl font-serif text-white whitespace-nowrap hide-scrollbar"
                  dangerouslySetInnerHTML={{ __html: katex.renderToString(solvingFormula.formula, { throwOnError: false, displayMode: true }) }}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest px-1">Enter Values</h4>
                {solvingFormula.variables?.map(v => (
                  <div key={v.symbol} className="flex items-center gap-3 bg-white/5 rounded-2xl border border-white/5 p-2">
                    <span 
                      className="font-serif font-bold text-white bg-indigo-500/10 w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                      dangerouslySetInnerHTML={{ __html: katex.renderToString(v.symbol, { throwOnError: false, displayMode: false }) }}
                    />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 font-bold block mb-1">{v.meaning}</span>
                      <input 
                        type="number" 
                        placeholder="0.0"
                        value={solveValues[v.symbol] || ''}
                        onChange={e => setSolveValues({...solveValues, [v.symbol]: e.target.value})}
                        className="bg-transparent border-none text-white font-bold w-full focus:outline-none focus:ring-0 p-0 text-sm"
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={handleSolve}
                  disabled={loadingSolve || Object.keys(solveValues).length === 0}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold transition-colors shadow-lg shadow-indigo-600/20 flex flex-row justify-center items-center gap-2"
                >
                  {loadingSolve ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  {loadingSolve ? 'Solving...' : 'Calculate Result'}
                </button>
              </div>

              {solveResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl" />
                  <div className="relative">
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Result</span>
                    <div className="text-2xl font-bold text-emerald-400 font-serif mt-1">{solveResult.result}</div>
                  </div>
                  <div className="pt-4 border-t border-emerald-500/20">
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider block mb-2">Step by Step</span>
                    <pre className="text-sm text-emerald-100/70 whitespace-pre-wrap font-mono leading-relaxed">{solveResult.steps}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
