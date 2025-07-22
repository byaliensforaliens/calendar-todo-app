import { useState, useEffect, useCallback } from 'react';
import { 
  type GameStats, 
  type Achievement, 
  ACHIEVEMENTS, 
  DEFAULT_GAME_STATS, 
  EXPERIENCE_REWARDS, 
  LEVEL_TITLES 
} from '../types/gamification';

export const useGameification = () => {
  const [gameStats, setGameStats] = useState<GameStats>(DEFAULT_GAME_STATS);

  // Load game stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('game-stats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        // Reset daily/weekly counters if needed
        const today = new Date().toDateString();
        const lastActive = new Date(parsed.lastActiveDate || '').toDateString();
        
        if (today !== lastActive) {
          parsed.dailyTasksCompleted = 0;
          parsed.dailyPomodoroSessions = 0;
          
          // Check if we need to reset weekly counters (simple week check)
          const todayNum = new Date().getDay();
          const lastActiveNum = new Date(parsed.lastActiveDate || '').getDay();
          if (todayNum < lastActiveNum) { // New week started
            parsed.weeklyTasksCompleted = 0;
            parsed.weeklyPomodoroSessions = 0;
          }
        }
        
        setGameStats(parsed);
      } catch (error) {
        console.error('Failed to load game stats:', error);
      }
    }
  }, []);

  // Save game stats to localStorage
  useEffect(() => {
    localStorage.setItem('game-stats', JSON.stringify(gameStats));
  }, [gameStats]);

  const calculateLevel = (experience: number) => {
    for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
      if (experience >= LEVEL_TITLES[i].minExperience) {
        return {
          ...LEVEL_TITLES[i],
          experienceToNextLevel: i < LEVEL_TITLES.length - 1 
            ? LEVEL_TITLES[i + 1].minExperience - experience 
            : 0
        };
      }
    }
    return {
      ...LEVEL_TITLES[0],
      experienceToNextLevel: LEVEL_TITLES[1].minExperience - experience
    };
  };

  const checkAchievements = (updatedStats: GameStats): Achievement[] => {
    const newAchievements: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (updatedStats.unlockedAchievements.includes(achievement.id)) {
        return; // Already unlocked
      }

      let currentProgress = 0;
      let shouldUnlock = false;

      switch (achievement.category) {
        case 'tasks':
          currentProgress = updatedStats.tasksCompleted;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'pomodoro':
          currentProgress = updatedStats.pomodoroSessions;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'streak':
          currentProgress = updatedStats.streakDays;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'milestone':
          if (achievement.id === 'productive_day') {
            currentProgress = updatedStats.dailyTasksCompleted;
            shouldUnlock = currentProgress >= achievement.requirement;
          } else if (achievement.id === 'focus_marathon') {
            currentProgress = updatedStats.dailyPomodoroSessions;
            shouldUnlock = currentProgress >= achievement.requirement;
          }
          break;
      }

      if (shouldUnlock) {
        const unlockedAchievement: Achievement = {
          ...achievement,
          currentProgress,
          unlocked: true,
          unlockedAt: new Date(),
        };
        newAchievements.push(unlockedAchievement);
      }
    });

    return newAchievements;
  };


  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    setGameStats(prev => {
      if (prev.lastActiveDate === today) {
        return prev; // Already updated today
      }

      let newStreakDays = prev.streakDays;
      
      if (prev.lastActiveDate === yesterday) {
        // Continuing streak
        newStreakDays += 1;
      } else if (prev.lastActiveDate !== today) {
        // Streak broken or starting new
        newStreakDays = 1;
      }

      return {
        ...prev,
        streakDays: newStreakDays,
        longestStreak: Math.max(prev.longestStreak, newStreakDays),
        lastActiveDate: today,
      };
    });
  };

  const completeTask = useCallback(() => {
    setGameStats(prev => {
      const updatedStats = {
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        dailyTasksCompleted: prev.dailyTasksCompleted + 1,
        weeklyTasksCompleted: prev.weeklyTasksCompleted + 1,
      };

      // Check achievements
      const newAchievements = checkAchievements(updatedStats);
      const experienceBonus = newAchievements.reduce((sum, ach) => sum + ach.experienceReward, 0);

      const finalStats = {
        ...updatedStats,
        experience: updatedStats.experience + EXPERIENCE_REWARDS.TASK_COMPLETED + experienceBonus,
        unlockedAchievements: [...updatedStats.unlockedAchievements, ...newAchievements.map(a => a.id)],
        newAchievements: [...updatedStats.newAchievements, ...newAchievements],
      };

      // Calculate level
      const levelInfo = calculateLevel(finalStats.experience);
      finalStats.level = levelInfo.level;
      finalStats.experienceToNextLevel = levelInfo.experienceToNextLevel;

      return finalStats;
    });

    updateStreak();
  }, []);

  const completePomodoroSession = useCallback((focusMinutes: number = 25) => {
    setGameStats(prev => {
      const updatedStats = {
        ...prev,
        pomodoroSessions: prev.pomodoroSessions + 1,
        focusMinutes: prev.focusMinutes + focusMinutes,
        dailyPomodoroSessions: prev.dailyPomodoroSessions + 1,
        weeklyPomodoroSessions: prev.weeklyPomodoroSessions + 1,
      };

      // Check achievements
      const newAchievements = checkAchievements(updatedStats);
      const experienceBonus = newAchievements.reduce((sum, ach) => sum + ach.experienceReward, 0);

      const finalStats = {
        ...updatedStats,
        experience: updatedStats.experience + EXPERIENCE_REWARDS.POMODORO_SESSION + experienceBonus,
        unlockedAchievements: [...updatedStats.unlockedAchievements, ...newAchievements.map(a => a.id)],
        newAchievements: [...updatedStats.newAchievements, ...newAchievements],
      };

      // Calculate level
      const levelInfo = calculateLevel(finalStats.experience);
      finalStats.level = levelInfo.level;
      finalStats.experienceToNextLevel = levelInfo.experienceToNextLevel;

      return finalStats;
    });

    updateStreak();
  }, []);

  const createTask = useCallback(() => {
    setGameStats(prev => ({
      ...prev,
      tasksCreated: prev.tasksCreated + 1,
    }));
  }, []);

  const clearNewAchievements = useCallback(() => {
    setGameStats(prev => ({
      ...prev,
      newAchievements: [],
    }));
  }, []);

  const getLevelInfo = () => {
    return calculateLevel(gameStats.experience);
  };

  const getProgressToNextLevel = () => {
    const levelInfo = getLevelInfo();
    const currentLevelExp = gameStats.experience - levelInfo.minExperience;
    const totalExpForLevel = levelInfo.maxExperience - levelInfo.minExperience;
    return totalExpForLevel > 0 ? (currentLevelExp / totalExpForLevel) * 100 : 100;
  };

  const getAchievementProgress = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return 0;

    let currentProgress = 0;
    switch (achievement.category) {
      case 'tasks':
        currentProgress = gameStats.tasksCompleted;
        break;
      case 'pomodoro':
        currentProgress = gameStats.pomodoroSessions;
        break;
      case 'streak':
        currentProgress = gameStats.streakDays;
        break;
      case 'milestone':
        if (achievement.id === 'productive_day') {
          currentProgress = gameStats.dailyTasksCompleted;
        } else if (achievement.id === 'focus_marathon') {
          currentProgress = gameStats.dailyPomodoroSessions;
        }
        break;
    }

    return Math.min(currentProgress, achievement.requirement);
  };

  return {
    gameStats,
    completeTask,
    completePomodoroSession,
    createTask,
    clearNewAchievements,
    getLevelInfo,
    getProgressToNextLevel,
    getAchievementProgress,
  };
};