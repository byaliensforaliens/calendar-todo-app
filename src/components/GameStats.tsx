import { useState } from 'react';
import { useGameification } from '../hooks/useGameification';
import { ACHIEVEMENTS } from '../types/gamification';

export const GameStats = () => {
  const { gameStats, getLevelInfo, getProgressToNextLevel, getAchievementProgress } = useGameification();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');
  
  const levelInfo = getLevelInfo();
  const progressToNextLevel = getProgressToNextLevel();
  
  const unlockedAchievements = ACHIEVEMENTS.filter(a => 
    gameStats.unlockedAchievements.includes(a.id)
  );
  
  const lockedAchievements = ACHIEVEMENTS.filter(a => 
    !gameStats.unlockedAchievements.includes(a.id)
  );

  return (
    <div className="game-stats">
      <div className="game-stats-header">
        <div className="level-display">
          <div className="level-icon" style={{ color: levelInfo.color }}>
            {levelInfo.icon}
          </div>
          <div className="level-info">
            <div className="level-title">{levelInfo.title}</div>
            <div className="level-number">Level {levelInfo.level}</div>
          </div>
        </div>
        
        <div className="experience-bar">
          <div className="exp-text">
            {gameStats.experience} XP
            {levelInfo.level < 10 && (
              <span className="exp-next"> → {gameStats.experienceToNextLevel} to next level</span>
            )}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      </div>

      <div className="game-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </button>
      </div>

      <div className="game-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-number">{gameStats.tasksCompleted}</div>
                  <div className="stat-label">Tasks Completed</div>
                </div>
              </div>
              
              <div className="stat-card secondary">
                <div className="stat-icon">🍅</div>
                <div className="stat-info">
                  <div className="stat-number">{gameStats.pomodoroSessions}</div>
                  <div className="stat-label">Focus Sessions</div>
                </div>
              </div>
              
              <div className="stat-card accent">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <div className="stat-number">{gameStats.streakDays}</div>
                  <div className="stat-label">Current Streak</div>
                </div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <div className="stat-number">{Math.round(gameStats.focusMinutes / 60 * 10) / 10}h</div>
                  <div className="stat-label">Focus Time</div>
                </div>
              </div>
            </div>

            <div className="daily-progress">
              <h4>Today's Progress</h4>
              <div className="daily-stats">
                <div className="daily-stat">
                  <span className="daily-label">Tasks Completed</span>
                  <div className="daily-bar">
                    <div 
                      className="daily-fill tasks" 
                      style={{ width: `${Math.min(gameStats.dailyTasksCompleted / 5 * 100, 100)}%` }}
                    />
                    <span className="daily-text">{gameStats.dailyTasksCompleted}/5</span>
                  </div>
                </div>
                
                <div className="daily-stat">
                  <span className="daily-label">Focus Sessions</span>
                  <div className="daily-bar">
                    <div 
                      className="daily-fill pomodoro" 
                      style={{ width: `${Math.min(gameStats.dailyPomodoroSessions / 4 * 100, 100)}%` }}
                    />
                    <span className="daily-text">{gameStats.dailyPomodoroSessions}/4</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="milestones">
              <h4>Milestones</h4>
              <div className="milestone-grid">
                <div className="milestone">
                  <span className="milestone-label">Longest Streak</span>
                  <span className="milestone-value">{gameStats.longestStreak} days</span>
                </div>
                <div className="milestone">
                  <span className="milestone-label">Tasks Created</span>
                  <span className="milestone-value">{gameStats.tasksCreated}</span>
                </div>
                <div className="milestone">
                  <span className="milestone-label">This Week</span>
                  <span className="milestone-value">{gameStats.weeklyTasksCompleted} tasks</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            {unlockedAchievements.length > 0 && (
              <div className="achievement-section">
                <h4>Unlocked ({unlockedAchievements.length})</h4>
                <div className="achievements-grid">
                  {unlockedAchievements.map(achievement => (
                    <div key={achievement.id} className="achievement-card unlocked">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-info">
                        <div className="achievement-title">{achievement.title}</div>
                        <div className="achievement-desc">{achievement.description}</div>
                        <div className="achievement-reward">+{achievement.experienceReward} XP</div>
                      </div>
                      <div className="achievement-status">✅</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lockedAchievements.length > 0 && (
              <div className="achievement-section">
                <h4>Locked ({lockedAchievements.length})</h4>
                <div className="achievements-grid">
                  {lockedAchievements.map(achievement => {
                    const progress = getAchievementProgress(achievement.id);
                    const progressPercent = (progress / achievement.requirement) * 100;
                    
                    return (
                      <div key={achievement.id} className="achievement-card locked">
                        <div className="achievement-icon locked">{achievement.icon}</div>
                        <div className="achievement-info">
                          <div className="achievement-title">{achievement.title}</div>
                          <div className="achievement-desc">{achievement.description}</div>
                          <div className="achievement-progress">
                            <div className="progress-bar small">
                              <div 
                                className="progress-fill"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="progress-text">{progress}/{achievement.requirement}</span>
                          </div>
                          <div className="achievement-reward">+{achievement.experienceReward} XP</div>
                        </div>
                        <div className="achievement-status">🔒</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};