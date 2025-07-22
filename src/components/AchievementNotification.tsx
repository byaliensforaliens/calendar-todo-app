import { useEffect, useState } from 'react';
import type { Achievement } from '../types/gamification';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close after 5 seconds
    const timer2 = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}>
      <div className="achievement-content">
        <div className="achievement-header">
          <div className="achievement-badge">
            <div className="badge-glow"></div>
            <div className="badge-icon">{achievement.icon}</div>
          </div>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="achievement-details">
          <div className="achievement-announce">🎉 Achievement Unlocked!</div>
          <div className="achievement-name">{achievement.title}</div>
          <div className="achievement-description">{achievement.description}</div>
          <div className="achievement-xp">+{achievement.experienceReward} XP</div>
        </div>
      </div>
      
      <div className="confetti">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`confetti-piece piece-${i + 1}`}></div>
        ))}
      </div>
    </div>
  );
};

interface AchievementManagerProps {
  achievements: Achievement[];
  onClearAchievements: () => void;
}

export const AchievementManager = ({ achievements, onClearAchievements }: AchievementManagerProps) => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);

  useEffect(() => {
    if (achievements.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievements[0]);
      setQueue(achievements.slice(1));
    }
  }, [achievements, currentAchievement]);

  const handleClose = () => {
    setCurrentAchievement(null);
    
    if (queue.length > 0) {
      // Show next achievement after a short delay
      setTimeout(() => {
        setCurrentAchievement(queue[0]);
        setQueue(prev => prev.slice(1));
      }, 500);
    } else {
      // All achievements shown, clear the list
      onClearAchievements();
    }
  };

  if (!currentAchievement) return null;

  return (
    <AchievementNotification 
      achievement={currentAchievement} 
      onClose={handleClose}
    />
  );
};