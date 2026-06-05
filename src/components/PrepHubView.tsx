import React, { useState } from 'react';
import { Award, BookOpen, Clock, Heart, Shield, Sparkles, Smile, Star, Zap } from 'lucide-react';
import { PREPARATION_CARDS } from '../data';

interface PrepHubViewProps {
  trackMinutesStudied: (minutes: number) => void;
}

export default function PrepHubView({ trackMinutesStudied }: PrepHubViewProps) {
  const [cards] = useState(PREPARATION_CARDS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCardIdx, setActiveCardIdx] = useState<number | null>(null);

  const categories = ['All', 'Study Strategy', 'Revision Technique', 'Productivity and Focus', 'Mental Well-being', 'Exam Advice'];

  const filteredCards = cards.filter(
    c => selectedCategory === 'All' || c.category === selectedCategory
  );

  return (
    <div id="preparation-hub-root" className="space-y-8 pb-12">
      {/* Upper info banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            Exam Preparation Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-200">Discover core scientific strategies on active recall, spaced repetition, and exam-day focus.</p>
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 4).map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
          {categories.length > 4 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl px-2.5 py-1.5 border-none outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">More Genres...</option>
              {categories.slice(4).map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main card list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, index) => {
          const isActive = activeCardIdx === index;
          return (
            <div
              key={index}
              onClick={() => {
                const goingActive = !isActive;
                setActiveCardIdx(goingActive ? index : null);
                // Log active reading study minutes only upon actual card expansion
                if (goingActive) {
                  trackMinutesStudied(1);
                }
              }}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                  : 'border-slate-100 dark:border-slate-700/50 hover:border-indigo-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[10px] uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded">
                    {card.category}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {card.time}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">{card.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed">
                  {card.description}
                </p>

                {isActive && (
                  <div className="pt-3 border-t border-slate-50 dark:border-slate-700 space-y-2 animate-slide-up">
                    <span className="text-[10px] font-black uppercase text-indigo-500 block tracking-widest leading-none">Smart Study Rules :</span>
                    <ul className="space-y-1.5">
                      {card.tips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
                {isActive ? 'Hide study tips' : 'Expand detailed study tips'}
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
          );
        })}
      </div>

      {/* Productivity quote footer banner */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Gradient Glow with zero costly blur triggers */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-white/15 to-transparent rounded-full" />
        
        <div className="space-y-2 max-w-lg z-10 text-center md:text-left">
          <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-80">Daily Encouragement</span>
          <h3 className="text-xl sm:text-2xl font-black italic shrink-0">"The beautiful thing about learning is that no one can take it away from you."</h3>
          <span className="text-xs opacity-75 inline-block">— B.B. King, Educational Leader</span>
        </div>

        <div className="flex gap-4 shrink-0 z-10">
          <div className="px-4 py-2 bg-white/20 border border-white/20 md:backdrop-blur-md rounded-xl text-center">
            <span className="text-[10px] uppercase font-black block text-indigo-100">Recommended focus</span>
            <span className="text-sm font-bold block">Spaced Repetition</span>
          </div>
        </div>
      </div>
    </div>
  );
}
