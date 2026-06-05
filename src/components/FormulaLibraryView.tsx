import React, { useState } from 'react';
import { Search, Star, BookOpen, Filter, Zap, Compass, ChevronDown, ChevronUp, HelpCircle, Lightbulb } from 'lucide-react';
import { Formula } from '../types';
import { INITIAL_FORMULAS } from '../data';

interface FormulaLibraryViewProps {
  favoriteFormulaIds: string[];
  onToggleFavoriteFormula: (id: string) => void;
  trackMinutesStudied: (minutes: number) => void;
}

// Custom visual math formatter for clean textbook-style display
function renderVisualFormula(formulaStr: string, title: string) {
  switch (title) {
    case 'Quadratic Formula':
      return (
        <div className="flex items-center justify-center font-serif text-lg py-5 text-violet-600 dark:text-violet-400 select-all font-bold">
          <span className="mr-2">x =</span>
          <div className="flex flex-col items-center leading-none">
            <span className="border-b border-slate-300 dark:border-gray-500 px-3 pb-1.5">-b ± √(b² - 4ac)</span>
            <span className="pt-1.5">2a</span>
          </div>
        </div>
      );
    case 'Law of Sines':
      return (
        <div className="flex items-center justify-center font-serif text-base py-4 text-violet-600 dark:text-violet-400 gap-3 select-all font-bold">
          <div className="flex flex-col items-center leading-none">
            <span className="border-b border-slate-300 dark:border-white/20 px-2 pb-1.5 italic">a</span>
            <span className="pt-1.5">sin(A)</span>
          </div>
          <span className="text-slate-400 font-normal">=</span>
          <div className="flex flex-col items-center leading-none">
            <span className="border-b border-slate-300 dark:border-white/20 px-2 pb-1.5 italic">b</span>
            <span className="pt-1.5">sin(B)</span>
          </div>
          <span className="text-slate-400 font-normal">=</span>
          <div className="flex flex-col items-center leading-none">
            <span className="border-b border-slate-300 dark:border-white/20 px-2 pb-1.5 italic">c</span>
            <span className="pt-1.5">sin(C)</span>
          </div>
        </div>
      );
    case 'Standard Deviation':
      return (
        <div className="flex items-center justify-center font-serif text-base py-4 text-violet-600 dark:text-violet-400 select-all font-bold">
          <span className="mr-2 text-lg">σ =</span>
          <span className="text-2xl mr-0.5 font-light">√</span>
          <div className="border-l border-t border-b border-slate-300 dark:border-white/20 pl-2 pr-1.5 py-1.5 rounded-l flex items-center leading-none">
            <div className="flex flex-col items-center">
              <span className="border-b border-slate-300 dark:border-white/20 px-2 pb-1">Σ(x_i - μ)²</span>
              <span className="pt-1">N</span>
            </div>
          </div>
        </div>
      );
    case 'Difference of Squares':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          a² - b² = (a - b)(a + b)
        </div>
      );
    case 'Pythagorean Theorem':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          a² + b² = c²
        </div>
      );
    case 'Area of a Circle':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          A = π • r²
        </div>
      );
    case 'Trigonometric Identity':
      return (
        <div className="py-5 font-serif text-base text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          sin²(θ) + cos²(θ) = 1
        </div>
      );
    case 'Newton\'s Second Law':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          F = m • a
        </div>
      );
    case 'Ohm\'s Law':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          V = I • R
        </div>
      );
    case 'Einstein\'s Mass-Energy Equivalence':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          E = m • c²
        </div>
      );
    case 'Ideal Gas Law':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          P • V = n • R • T
        </div>
      );
    case 'pH Calculation':
      return (
        <div className="py-5 font-serif text-lg text-violet-600 dark:text-violet-400 font-bold tracking-wide text-center">
          pH = -log₁₀[H⁺]
        </div>
      );
    case 'Photosynthesis Process':
      return (
        <div className="py-4 font-mono text-sm text-violet-605 dark:text-violet-400 font-black text-center break-words max-w-full px-2">
          6CO₂ + 6H₂O + light ➔ C₆H₁₂O₆ + 6O₂
        </div>
      );
    case 'Cellular Respiration':
      return (
        <div className="py-4 font-mono text-sm text-violet-605 dark:text-violet-400 font-black text-center break-words max-w-full px-2">
          C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O + ATP (Energy)
        </div>
      );
    default:
      // Fallback clean parsing
      const clean = formulaStr
        .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1) / ($2)')
        .replace(/\\sqrt{([^}]+)}/g, '√($1)')
        .replace(/\\pm/g, '±')
        .replace(/\\pi/g, 'π')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\mu/g, 'μ')
        .replace(/\\theta/g, 'θ')
        .replace(/\\sin/g, 'sin')
        .replace(/\\cos/g, 'cos')
        .replace(/\\cdot/g, '•')
        .replace(/_2/g, '₂')
        .replace(/_6/g, '₆')
        .replace(/\^2/g, '²')
        .replace(/\\rightarrow/g, '➔');
      return (
        <div className="py-5 font-mono text-sm text-violet-600 dark:text-violet-400 font-bold text-center break-all select-all">
          {clean}
        </div>
      );
  }
}

interface FormulaCardProps {
  formula: Formula;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  key?: any;
}

// Modular component for individual Formula card rendering
function FormulaCard({
  formula,
  isFavorite,
  onToggleFavorite
}: FormulaCardProps) {
  const [showVariables, setShowVariables] = useState(false);
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="bg-white dark:bg-[#0B0F19] rounded-2.5xl p-5 border border-slate-200 dark:border-gray-700 shadow-md flex flex-col justify-between transition-all duration-300 hover:border-violet-500/30 group">
      
      {/* Top Header Row with tags & Action trigger */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-extrabold uppercase bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 px-2.5 py-1 rounded-lg text-[9px] tracking-wider border border-violet-500/10">
            {formula.category}
          </span>
          <button
            onClick={onToggleFavorite}
            className="p-1.5 rounded-lg text-slate-300 dark:text-gray-400 hover:text-yellow-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Pin Formula to overview"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </button>
        </div>

        {/* Basic Title & standard description */}
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight group-hover:text-violet-500 transition-colors">
            {formula.title}
          </h4>
          <p className="text-xs text-slate-400 dark:text-gray-400 leading-relaxed">
            {formula.description}
          </p>
        </div>

        {/* Plain English Simplified Balloon */}
        {formula.simplifiedExplanation && (
          <div className="bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50 dark:from-violet-955/10 dark:to-transparent p-3 rounded-xl text-xs text-violet-750 dark:text-violet-300 border border-violet-500/10 flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 mt-0.5 text-violet-500 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-black uppercase text-[8px] tracking-wider text-violet-500 block">Plain English:</span>
              <p className="font-medium leading-relaxed">{formula.simplifiedExplanation}</p>
            </div>
          </div>
        )}

        {/* Custom Visual textbook mathematical equation rendering */}
        <div className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-150 dark:border-gray-700 shadow-inner select-all relative overflow-hidden">
          {renderVisualFormula(formula.formula, formula.title)}
          <span className="absolute bottom-1 right-2 font-mono text-[8px] dark:text-gray-4000 text-slate-500 tracking-wider">TEXTBOOK FORMAT</span>
        </div>
      </div>

      {/* Accordion Expanders for Interactive Elements */}
      <div className="mt-4 pt-3 border-t border-slate-150 dark:border-gray-700 space-y-2">
        
        {/* Variables key */}
        {formula.variables && formula.variables.length > 0 && (
          <div className="border border-slate-150 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] text-left text-xs font-bold text-slate-700 dark:text-gray-200 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-violet-300">
                <Lightbulb className="w-3.5 h-3.5" />
                Variable Key (🔑 What it means)
              </span>
              {showVariables ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {showVariables && (
              <div className="px-3.5 py-2.5 bg-white dark:bg-transparent border-t border-slate-150 dark:border-gray-700 space-y-2 text-xs">
                {formula.variables.map((v, i) => (
                  <div key={i} className="flex gap-2 last:mb-0">
                    <span className="font-mono font-bold text-violet-600 dark:text-violet-400 px-1.5 py-0.5 bg-violet-50 dark:bg-violet-950/40 rounded border border-violet-500/10 self-start">
                      {v.symbol}
                    </span>
                    <span className="text-slate-500 dark:text-gray-4000 leading-relaxed font-semibold">
                      {v.meaning}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step example */}
        {formula.exampleProblem && (
          <div className="border border-slate-150 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowExample(!showExample)}
              className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] text-left text-xs font-bold text-slate-700 dark:text-gray-200 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-fuchsia-300">
                <BookOpen className="w-3.5 h-3.5" />
                Example Problem (📝 Playbook)
              </span>
              {showExample ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {showExample && (
              <div className="px-3.5 py-3 bg-white dark:bg-transparent border-t border-slate-150 dark:border-gray-700 text-xs space-y-2.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-fuchsia-500 dark:text-fuchsia-400 block leading-none">Scenario Task:</span>
                  <p className="font-black text-slate-800 dark:text-white leading-relaxed">{formula.exampleProblem.scenario}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-white/[0.01] rounded-lg border border-slate-150 dark:border-gray-700 font-mono text-[11px] leading-relaxed dark:text-gray-100 text-slate-600">
                  <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-gray-200 block mb-1">Workings:</span>
                  {formula.exampleProblem.calc}
                </div>
                <div className="flex gap-2 items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/30 dark:bg-emerald-950/10 p-2 rounded-lg border border-emerald-500/10">
                  <span className="text-[9px] uppercase font-black tracking-widest text-emerald-500">Solved:</span>
                  <span className="text-xs">{formula.exampleProblem.answer}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function FormulaLibraryView({
  favoriteFormulaIds,
  onToggleFavoriteFormula,
  trackMinutesStudied
}: FormulaLibraryViewProps) {
  const [formulas, setFormulas] = useState<Formula[]>(INITIAL_FORMULAS);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Mathematics' | 'Science'>('All');
  
  // Chapter (Category) state management
  const [activeChapter, setActiveChapter] = useState<string>('All');

  // Revision deck flashcards format
  const [revisionIndex, setRevisionIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const categories = {
    Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
    Science: ['Physics formulas', 'Chemistry formulas', 'Biology concepts']
  };

  const handleToggleFavorite = (id: string) => {
    onToggleFavoriteFormula(id);
  };

  // Compute all available chapters/categories safely
  const chaptersList = ['All', ...categories.Mathematics, ...categories.Science];

  // Filters and search logic
  const filteredFormulas = formulas.filter(f => {
    const termMatch = f.title.toLowerCase().includes(search.toLowerCase()) || 
                      f.formula.toLowerCase().includes(search.toLowerCase()) ||
                      f.description.toLowerCase().includes(search.toLowerCase()) ||
                      f.category.toLowerCase().includes(search.toLowerCase()) ||
                      (f.simplifiedExplanation && f.simplifiedExplanation.toLowerCase().includes(search.toLowerCase()));
                      
    const subjectMatch = selectedSubject === 'All' || f.subject === selectedSubject;
    const chapterMatch = activeChapter === 'All' || f.category === activeChapter;

    return termMatch && subjectMatch && chapterMatch;
  });

  const triggerRevisionMode = () => {
    if (filteredFormulas.length === 0) return;
    const randomIdx = Math.floor(Math.random() * filteredFormulas.length);
    setRevisionIndex(randomIdx);
    setShowAnswer(false);
    
    // Log study time
    trackMinutesStudied(1);
  };

  return (
    <div id="formula-library-root" className="space-y-8 pb-12">
      {/* Top action grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0B0F19] p-6 rounded-2.5xl border border-slate-200 dark:border-gray-700 shadow-md">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500 fill-violet-500/20" />
            Adaptive Formula & Chapter Playbook
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Review essential rules, explore variable breakdowns, and consult guided calculations step-by-step.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={triggerRevisionMode}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-violet-600/10 duration-200 active:scale-95 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-violet-100" />
            Random Revision Deck
          </button>
        </div>
      </div>

      {/* Revision widget overlay if active */}
      {revisionIndex !== null && filteredFormulas[revisionIndex] && (
        <div className="bg-gradient-to-br from-violet-900 via-fuchsia-950 to-[#020205] text-white rounded-3.5xl p-6.5 relative overflow-hidden shadow-2xl border border-violet-505/20 max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold uppercase bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full text-violet-200 tracking-wider">
              {filteredFormulas[revisionIndex].category} Quiz Mode
            </span>
            <button
              onClick={() => setRevisionIndex(null)}
              className="text-slate-400 hover:text-white dark:hover:text-gray-200 text-xs font-medium cursor-pointer"
            >
              ✕ Exit Playbook
            </button>
          </div>

          <div className="space-y-4.5 py-4 min-h-[140px] flex flex-col justify-center">
            <h4 className="text-xs text-violet-300 font-bold uppercase tracking-widest leading-none">Can you recall the formulation for:</h4>
            <h3 className="text-2xl font-black tracking-tight">{filteredFormulas[revisionIndex].title}?</h3>
            
            {showAnswer ? (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 relative">
                {renderVisualFormula(filteredFormulas[revisionIndex].formula, filteredFormulas[revisionIndex].title)}
                {filteredFormulas[revisionIndex].simplifiedExplanation && (
                  <p className="text-xs text-violet-250 italic bg-black/30 p-2.5 rounded-xl border border-white/5 mt-3 max-w-sm mx-auto">
                    {filteredFormulas[revisionIndex].simplifiedExplanation}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-350 dark:text-gray-4000 max-w-sm mx-auto leading-relaxed">
                {filteredFormulas[revisionIndex].description}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex-1 py-3 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {showAnswer ? 'Re-Hide Formula' : 'Reveal Formula Answer'}
            </button>
            <button
              onClick={triggerRevisionMode}
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              Next concept
            </button>
          </div>
        </div>
      )}

      {/* Chapters & Filters sections */}
      <div className="space-y-4">
        
        {/* Horizontal Chapter Section tabs directly mapping to "write them in simple way according to ch section" */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-200 tracking-wider">Browse by Chapter Section 📚</label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {chaptersList.map((chapter) => {
              const isActive = activeChapter === chapter;
              return (
                <button
                  key={chapter}
                  onClick={() => setActiveChapter(chapter)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all border outline-none cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/15 border-transparent' 
                      : 'bg-white dark:bg-[#0B0F19] text-slate-500 dark:text-gray-4000 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-gray-700'
                  }`}
                >
                  {chapter === 'All' ? '🎒 All Chapter Sections' : chapter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input searches & Subject selects row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 dark:text-gray-4000 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chapters, formulas, variables, plain English explanations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-gray-700 rounded-xl text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none dark:text-white font-medium shadow-sm transition-all text-slate-700"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value as any);
                setActiveChapter('All'); // Reset active chapter section to prevent confusion
              }}
              className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-gray-700 rounded-xl py-3 px-3.5 text-xs font-bold text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer shadow-sm"
            >
              <option value="All">🔬 All Core Subjects</option>
              <option value="Mathematics">📐 Mathematics</option>
              <option value="Science">🧪 Science Topics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of beautifully simplified custom formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormulas.map((f) => (
          <FormulaCard
            key={f.id}
            formula={f}
            isFavorite={favoriteFormulaIds.includes(f.id)}
            onToggleFavorite={() => handleToggleFavorite(f.id)}
          />
        ))}

        {filteredFormulas.length === 0 && (
          <div className="lg:col-span-3 py-16 text-center bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-gray-700 shadow-md">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-white/10 mx-auto mb-2" />
            <span className="text-xs text-slate-500 dark:text-gray-4000 font-medium block">
              No textbook formulas or chapter segments matched those queries.
            </span>
            <p className="text-[10px] text-slate-500 dark:text-gray-4000 mt-1">Try resetting the chapter tab or search keys!</p>
          </div>
        )}
      </div>
    </div>
  );
}
