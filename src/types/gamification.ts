export interface GameStats {
  // Task-related stats
  tasksCompleted: number;
  tasksCreated: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
  
  // Pomodoro-related stats
  pomodoroSessions: number;
  focusMinutes: number;
  breakMinutes: number;
  
  // Experience and levels
  level: number;
  experience: number;
  experienceToNextLevel: number;
  
  // Daily/weekly achievements
  dailyTasksCompleted: number;
  weeklyTasksCompleted: number;
  dailyPomodoroSessions: number;
  weeklyPomodoroSessions: number;
  
  // Achievement tracking
  unlockedAchievements: string[];
  newAchievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tasks' | 'pomodoro' | 'streak' | 'milestone';
  requirement: number;
  currentProgress?: number;
  unlocked: boolean;
  unlockedAt?: Date;
  experienceReward: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  minExperience: number;
  maxExperience: number;
  icon: string;
  color: string;
}

export const EXPERIENCE_REWARDS = {
  TASK_COMPLETED: 10,
  POMODORO_SESSION: 25,
  DAILY_STREAK: 50,
  ACHIEVEMENT_BONUS: 100,
} as const;

export const LEVEL_TITLES: LevelInfo[] = [
  { level: 1, title: 'Novice', minExperience: 0, maxExperience: 99, icon: '🌱', color: '#10b981' },
  { level: 2, title: 'Beginner', minExperience: 100, maxExperience: 249, icon: '📝', color: '#3b82f6' },
  { level: 3, title: 'Focused', minExperience: 250, maxExperience: 499, icon: '🎯', color: '#6366f1' },
  { level: 4, title: 'Dedicated', minExperience: 500, maxExperience: 999, icon: '⚡', color: '#8b5cf6' },
  { level: 5, title: 'Productive', minExperience: 1000, maxExperience: 1999, icon: '🚀', color: '#ec4899' },
  { level: 6, title: 'Master', minExperience: 2000, maxExperience: 3999, icon: '🏆', color: '#f59e0b' },
  { level: 7, title: 'Expert', minExperience: 4000, maxExperience: 7999, icon: '💎', color: '#ef4444' },
  { level: 8, title: 'Legend', minExperience: 8000, maxExperience: 15999, icon: '👑', color: '#f97316' },
  { level: 9, title: 'Grandmaster', minExperience: 16000, maxExperience: 31999, icon: '✨', color: '#84cc16' },
  { level: 10, title: 'Zen Master', minExperience: 32000, maxExperience: Infinity, icon: '🧘', color: '#06b6d4' },
];

export const ACHIEVEMENTS: Achievement[] = [
  // Task achievements
  {
    id: 'first_task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '✅',
    category: 'tasks',
    requirement: 1,
    unlocked: false,
    experienceReward: 50,
  },
  {
    id: 'task_warrior_10',
    title: 'Task Warrior',
    description: 'Complete 10 tasks',
    icon: '⚔️',
    category: 'tasks',
    requirement: 10,
    unlocked: false,
    experienceReward: 100,
  },
  {
    id: 'task_master_50',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: '🎯',
    category: 'tasks',
    requirement: 50,
    unlocked: false,
    experienceReward: 250,
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Complete 100 tasks',
    icon: '💯',
    category: 'tasks',
    requirement: 100,
    unlocked: false,
    experienceReward: 500,
  },
  
  // Pomodoro achievements
  {
    id: 'first_pomodoro',
    title: 'Focus Beginner',
    description: 'Complete your first Pomodoro session',
    icon: '🍅',
    category: 'pomodoro',
    requirement: 1,
    unlocked: false,
    experienceReward: 75,
  },
  {
    id: 'pomodoro_dedication',
    title: 'Focused Mind',
    description: 'Complete 10 Pomodoro sessions',
    icon: '🧠',
    category: 'pomodoro',
    requirement: 10,
    unlocked: false,
    experienceReward: 150,
  },
  {
    id: 'pomodoro_master',
    title: 'Pomodoro Master',
    description: 'Complete 50 Pomodoro sessions',
    icon: '🥇',
    category: 'pomodoro',
    requirement: 50,
    unlocked: false,
    experienceReward: 300,
  },
  {
    id: 'deep_focus',
    title: 'Deep Focus',
    description: 'Complete 100 Pomodoro sessions',
    icon: '🔥',
    category: 'pomodoro',
    requirement: 100,
    unlocked: false,
    experienceReward: 750,
  },
  
  // Streak achievements
  {
    id: 'streak_3',
    title: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: '📅',
    category: 'streak',
    requirement: 3,
    unlocked: false,
    experienceReward: 100,
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🗓️',
    category: 'streak',
    requirement: 7,
    unlocked: false,
    experienceReward: 200,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '📊',
    category: 'streak',
    requirement: 30,
    unlocked: false,
    experienceReward: 500,
  },
  
  // Milestone achievements
  {
    id: 'productive_day',
    title: 'Productive Day',
    description: 'Complete 5 tasks in one day',
    icon: '☀️',
    category: 'milestone',
    requirement: 5,
    unlocked: false,
    experienceReward: 100,
  },
  {
    id: 'focus_marathon',
    title: 'Focus Marathon',
    description: 'Complete 5 Pomodoro sessions in one day',
    icon: '🏃',
    category: 'milestone',
    requirement: 5,
    unlocked: false,
    experienceReward: 150,
  },
];

export const DEFAULT_GAME_STATS: GameStats = {
  tasksCompleted: 0,
  tasksCreated: 0,
  streakDays: 0,
  longestStreak: 0,
  lastActiveDate: '',
  pomodoroSessions: 0,
  focusMinutes: 0,
  breakMinutes: 0,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  dailyTasksCompleted: 0,
  weeklyTasksCompleted: 0,
  dailyPomodoroSessions: 0,
  weeklyPomodoroSessions: 0,
  unlockedAchievements: [],
  newAchievements: [],
};