import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types';

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

interface PomodoroTimerProps {
  selectedTodo?: Todo;
  onPomodoroComplete?: (todoId: string) => void;
}

interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // after how many work sessions
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

export const PomodoroTimer = ({ selectedTodo, onPomodoroComplete }: PomodoroTimerProps) => {
  const [settings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(settings.workDuration * 60); // seconds
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseDisplayName = (phase: PomodoroPhase): string => {
    switch (phase) {
      case 'work': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };

  const getPhaseColor = (phase: PomodoroPhase): string => {
    switch (phase) {
      case 'work': return 'var(--color-primary)';
      case 'shortBreak': return 'var(--color-success)';
      case 'longBreak': return 'var(--color-warning)';
    }
  };

  const getPhaseDuration = (phase: PomodoroPhase): number => {
    switch (phase) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  };

  const playNotificationSound = useCallback(() => {
    // Create a simple beep sound using Web Audio API
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const switchPhase = useCallback(() => {
    if (phase === 'work') {
      const newWorkSessions = workSessionsCompleted + 1;
      setWorkSessionsCompleted(newWorkSessions);

      if (selectedTodo && onPomodoroComplete) {
        onPomodoroComplete(selectedTodo.id);
      }

      // Determine next break type
      if (newWorkSessions % settings.longBreakInterval === 0) {
        setPhase('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        showNotification('Work Session Complete!', 'Time for a long break!');
      } else {
        setPhase('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        showNotification('Work Session Complete!', 'Time for a short break!');
      }
    } else {
      setPhase('work');
      setTimeLeft(settings.workDuration * 60);
      showNotification('Break Over!', 'Ready to focus again?');
    }
    
    playNotificationSound();
    setStatus('idle');
  }, [phase, workSessionsCompleted, settings, selectedTodo, onPomodoroComplete, showNotification, playNotificationSound]);

  useEffect(() => {
    if (status === 'running') {
      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStatus('idle');
            switchPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setIntervalId(id);
      return () => {
        clearInterval(id);
        setIntervalId(null);
      };
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [status, switchPhase, intervalId]);

  const startTimer = () => {
    setStatus('running');
  };

  const pauseTimer = () => {
    setStatus('paused');
  };

  const resetTimer = () => {
    setStatus('idle');
    setTimeLeft(getPhaseDuration(phase));
  };

  const skipPhase = () => {
    setStatus('idle');
    switchPhase();
  };

  const resetSession = () => {
    setStatus('idle');
    setPhase('work');
    setTimeLeft(settings.workDuration * 60);
    setWorkSessionsCompleted(0);
  };

  const progress = ((getPhaseDuration(phase) - timeLeft) / getPhaseDuration(phase)) * 100;

  return (
    <div className="pomodoro-timer">
      <div className="timer-header">
        <h3>Pomodoro Timer</h3>
        {selectedTodo && (
          <div className="selected-task">
            <span>Working on:</span>
            <div className="task-name">{selectedTodo.title}</div>
          </div>
        )}
      </div>

      <div className={`timer-display ${status}`}>
        <div className="phase-indicator" style={{ color: getPhaseColor(phase) }}>
          {getPhaseDisplayName(phase)}
        </div>
        
        <div className="time-display" style={{ color: getPhaseColor(phase) }}>
          {formatTime(timeLeft)}
        </div>

        <div className="progress-ring">
          <svg className="progress-ring-svg" width="200" height="200">
            <circle
              className="progress-ring-background"
              cx="100"
              cy="100"
              r="90"
              fill="transparent"
              stroke="var(--color-border)"
              strokeWidth="8"
            />
            <circle
              className="progress-ring-progress"
              cx="100"
              cy="100"
              r="90"
              fill="transparent"
              stroke={getPhaseColor(phase)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
          </svg>
          <div className="timer-center">
            <div className="time-large">{formatTime(timeLeft)}</div>
            <div className="phase-small">{getPhaseDisplayName(phase)}</div>
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {status === 'idle' && (
          <button onClick={startTimer} className="btn btn-primary btn-timer">
            Start
          </button>
        )}
        
        {status === 'running' && (
          <button onClick={pauseTimer} className="btn btn-secondary btn-timer">
            Pause
          </button>
        )}
        
        {status === 'paused' && (
          <>
            <button onClick={startTimer} className="btn btn-primary btn-timer">
              Resume
            </button>
            <button onClick={resetTimer} className="btn btn-secondary btn-timer">
              Reset
            </button>
          </>
        )}

        <button onClick={skipPhase} className="btn btn-small btn-timer-small">
          Skip
        </button>
      </div>

      <div className="timer-stats">
        <div className="stat">
          <span className="stat-label">Sessions Today</span>
          <span className="stat-value">{workSessionsCompleted}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Next Break</span>
          <span className="stat-value">
            {settings.longBreakInterval - (workSessionsCompleted % settings.longBreakInterval) === settings.longBreakInterval 
              ? 'Long' 
              : `${settings.longBreakInterval - (workSessionsCompleted % settings.longBreakInterval)} sessions`}
          </span>
        </div>
      </div>

      <div className="timer-actions">
        <button onClick={resetSession} className="btn btn-small btn-reset">
          Reset Session
        </button>
      </div>
    </div>
  );
};