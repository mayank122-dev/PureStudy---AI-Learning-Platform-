export interface UserProfile {
  uid?: string;
  fullName?: string;
  username: string;
  avatarUrl: string;
  school?: string;
  board?: string;
  classLevel?: string;
  medium?: string;
  isAdmin?: boolean;
  joinedDate?: string;
  lastActiveDate?: string;
  grade: string;
  lastCheckInDate?: string;
  points: number;
  streak: number;
  streakFreezes?: number;
  activityHistory?: string[];
  studyMinutesTotal?: number;
  quizzesCompletedTotal?: number;
  formulasViewed?: number;
  formulaQuizAccuracy?: number;
  formulaRevisionProgress?: number;
  bio?: string;
  preferences: {
    theme: 'dark' | 'light';
    favoriteSubject: string;
    dailyGoalMinutes: number;
    language?: 'English' | 'Hindi';
    notifications?: {
      dailyReminder: boolean;
      quizReminder: boolean;
      goalReminder: boolean;
      examCountdown: boolean;
      allEnabled: boolean;
    };
    privacy?: {
      profileVisibility: 'public' | 'private' | 'friends';
      showActivity: boolean;
    };
  };
  badges?: string[]; // Badge ID list
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorClass: string;
  achievedAt?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
  durationMinutes: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  attemptedAt: string;
  accuracy: number;
}

export interface PlannerTask {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  subject: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  durationMinutes?: number;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  studyMinutes: number;
  tasksCompleted: number;
  quizzesCompleted: number;
}

export interface SavedDoubt {
  id: string;
  question: string;
  answer: string;
  subject: string;
  timestamp?: string;
  createdAt?: string;
}

export interface GeneratedNote {
  id: string;
  title: string;
  topic: string;
  subject: string;
  language?: string;
  summary: string;
  keyConcepts: {
    name: string;
    explanation: string;
  }[];
  formulasOrDefinitions: {
    term: string;
    valueOrDefinition: string;
  }[];
  quickSummaries: string[];
  practiceQuestions: {
    question: string;
    answer: string;
  }[];
  createdAt: string;
  bookmarked: boolean;
}

export interface Formula {
  id: string;
  title: string;
  formula: string;
  readableFormula?: string;
  category: string;
  subject: string; // Expanded subject string (e.g., Physics, Chemistry)
  chapter?: string;
  description: string;
  isFavorite: boolean;
  variables?: { symbol: string; meaning: string; unit?: string }[];
  targetClasses?: number[]; // Classes where this formula is highly relevant
  importanceTags?: string[]; // E.g., ['🔥 Most Important', '📘 NCERT Essential']
  simplifiedExplanation?: string;
  exampleProblem?: { scenario: string; calc: string; answer: string };
  commonMistakes?: string;
  examTip?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  ts?: string;
  createdAt?: string;
  type?: string;
  read: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl: string;
  points: number;
  streak: number;
  isCurrentUser?: boolean;
}
