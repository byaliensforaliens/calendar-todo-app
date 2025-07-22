import type { ViewType } from '../types';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
}

export const Navigation = ({ 
  selectedDate, 
  onDateChange, 
  viewType, 
  onViewTypeChange 
}: NavigationProps) => {
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getDateDisplayText = () => {
    switch (viewType) {
      case 'day':
        return selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'week':
        const startOfWeek = new Date(selectedDate);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(selectedDate.getDate() - day);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })} - ${endOfWeek.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}`;
      case 'month':
        return selectedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      default:
        return '';
    }
  };

  return (
    <div className="navigation">
      <div className="nav-controls">
        <button onClick={goToPrevious} className="btn btn-nav">
          ← Previous
        </button>
        
        <div className="date-display">
          <h2>{getDateDisplayText()}</h2>
        </div>
        
        <button onClick={goToNext} className="btn btn-nav">
          Next →
        </button>
      </div>

      <div className="nav-actions">
        <ThemeToggle />
        
        <button onClick={goToToday} className="btn btn-today">
          Today
        </button>
        
        <div className="view-switcher">
          {(['day', 'week', 'month'] as ViewType[]).map((view) => (
            <button
              key={view}
              onClick={() => onViewTypeChange(view)}
              className={`btn btn-view ${viewType === view ? 'active' : ''}`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};