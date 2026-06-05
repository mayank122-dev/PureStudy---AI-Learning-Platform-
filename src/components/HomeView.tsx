import React, { useState } from 'react';
import { ArrowRight, Sparkles, BookOpen, MessageSquare, Calendar, Award, Trophy, HelpCircle, Star, GraduationCap } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: 'Active Scholars', value: '45,200+' },
    { label: 'Doubts Resolved', value: '840,000+' },
    { label: 'Quizzes Cleared', value: '1.2M+' },
    { label: 'Average Grade Boost', value: '28%' }
  ];

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
      title: 'AI Doubt Solver',
      desc: 'Ask complex algebra, chemistry structures, or physics questions. Get simplified step-by-step logic in seconds.',
      view: 'doubt',
      badge: 'Gemini 3.5'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
      title: 'Practice & Quizzes',
      desc: 'Hone your knowledge with graded subject tasks (Easy, Medium, Hard). Includes active timer modes & immediate score cards.',
      view: 'quizzes',
      badge: 'Adaptive'
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-violet-500" />,
      title: 'Notes Generator',
      desc: 'Need rapid recap resources? Enter any academic topic. We will compile concept blueprints, summaries, and revision questions.',
      view: 'notes',
      badge: 'Instant AI'
    },
    {
      icon: <Calendar className="w-6 h-6 text-amber-500" />,
      title: 'Study Planner',
      desc: 'Manage your homework deadlines, exam prep lists, weekly revision timetables, and productivity countdown targets.',
      view: 'planner',
      badge: 'Smart Sync'
    },
    {
      icon: <Trophy className="w-6 h-6 text-rose-500" />,
      title: 'Formula Library',
      desc: 'Find all essential High School equations across geometry, calculus, statistics, physics dynamics, and chemistry structures.',
      view: 'formulas',
      badge: 'Quick Deck'
    },
    {
      icon: <Award className="w-6 h-6 text-sky-500" />,
      title: 'Exam Prep Hub',
      desc: 'Access mental stress management files, active recall tips, Pomodoro planning charts, and premium revision guidelines.',
      view: 'prephub',
      badge: 'Pro Guides'
    }
  ];

  const testimonials = [
    {
      quote: "Before PureStudy, I struggled to understand quadratic functions. The AI solver broke down the steps like a human teacher!",
      name: "Olivia Carter",
      grade: "11th Grade student",
      rating: 5,
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
    },
    {
      quote: "The personalized quizzes are highly addictive. Achieving badges like '7-Day Scholar' keeps my revision routine active!",
      name: "Ethan Wright",
      grade: "12th Grade student",
      rating: 5,
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    }
  ];

  const faqs = [
    {
      q: "How does the AI Doubt Solver clarify mathematics equations?",
      a: "Our AI Doubt Solver parses complex math inputs, details the algebraic rules applied, and outputs a clean step-by-step layout. It is like having a companion tutor available 24/7."
    },
    {
      q: "Can I download study notes to read offline?",
      a: "Yes! When you generate study notes, you can bookmark them inside your PureStudy account, or click the print/PDF export function to save them locally on your smartphone or computer."
    },
    {
      q: "How does the study streak bonus work?",
      a: "Every day you complete at least one task, study formula deck, or solve doubts, your streak increases. Maintaining consistency triggers premium achievements and boosts your class leadership board rating!"
    },
    {
      q: "Is PureStudy optimized for mobile devices?",
      a: "Absolutely! PureStudy is built on premium responsive grids, meaning you can easily resolve doubts, take quizzes, and track planners right from your smartphone, tablet, or laptop."
    }
  ];

  return (
    <div id="home-view-container" className="space-y-20 pb-16">
      {/* Premium Hero Section */}
      <section id="hero-banner" className="relative pt-12 pb-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 bg-violet-950/40 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
          EdTech Platform of the Year
        </div>
        
        <h1 id="study-smarter-title" className="text-4xl sm:text-6xl font-black tracking-tight text-black dark:text-white leading-none">
          Study <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Smarter</span>,<br className="sm:hidden" /> Not Harder
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-100 max-w-2xl mx-auto font-medium">
          A complete, beautiful learning ecosystem helping school students clarify academic doubts instantly, practice quizzes, generate notes, and achieve stellar grades.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 px-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 text-base group cursor-pointer"
          >
            Enter Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigate('doubt')}
            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-base cursor-pointer"
          >
            Ask AI Doubt Solver
          </button>
        </div>

        {/* Dynamic decorative backdrop using high-performance CSS radial-gradient (no costly blur triggers) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-radial from-violet-600/15 to-transparent rounded-full -z-10 opacity-80" />
      </section>

      {/* Real-time styled statistics counters */}
      <section id="stats-banner" className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((st, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 md:bg-white/80 md:dark:bg-slate-800/80 md:backdrop-blur-md rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 text-center shadow-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{st.value}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-gray-200 mt-1 uppercase tracking-wider">{st.label}</div>
          </div>
        ))}
      </section>

      {/* Feature Showcase Grid */}
      <section id="features-highlights" className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Empowering Academic Features</h2>
          <p className="text-slate-500 dark:text-gray-200 max-w-xl mx-auto">
            Everything a student needs to excel throughout the academic year is unified under a single clean workspace interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate(feat.view)}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-200">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-gray-200">
                  {feat.desc}
                </p>
              </div>
              <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-bold pt-4 group-hover:gap-1.5 transition-all">
                Launch tool <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* High Quality Student Testimonials */}
      <section id="testimonials-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-8 sm:p-12 border border-slate-100 dark:border-slate-700/30">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 w-fit rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">Genuinely Loved by High-Schoolers</h2>
          <p className="text-sm text-slate-500 dark:text-gray-200 leading-relaxed">
            See how PureStudy is changing study habits, resolving confusion, and building high grading consistency every day.
          </p>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-100 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-indigo-100 dark:border-slate-700" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.name}</h4>
                  <span className="text-xs text-slate-500 dark:text-gray-200 mt-1 block">{t.grade}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq-section" className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Learn About PureStudy</h2>
          <p className="text-slate-500 dark:text-gray-200">Everything you need to know about the operations of our EdTech tools.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left px-6 py-4 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer"
              >
                <span className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  {faq.q}
                </span>
                <span className={`text-slate-500 dark:text-gray-200 transition-transform font-bold ${activeFaq === i ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-gray-100 border-t border-slate-50 dark:border-slate-700/40">
                  <p className="leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
